
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Driver, DriverStatus, VehicleType, Coordinates, Booking, BookingStatus } from './types';
import CustomerView from './components/CustomerView';
import DriverDashboard from './components/DriverDashboard';
import Header from './components/Header';
import { calculateDistance } from './utils';

const DEFAULT_LOCATION: Coordinates = { lat: 12.9716, lng: 77.5946 }; // Bangalore
const ASSIGNMENT_TIMEOUT = 60000; // 60 seconds

const MOCK_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    photo: 'https://picsum.photos/200?random=1',
    rating: 4.8,
    experience: 8,
    specialties: [VehicleType.SUV, VehicleType.MANUAL],
    location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
    status: DriverStatus.AVAILABLE,
    jobsCompleted: 120,
    subscriptionActive: true,
    freeJobsLeft: 2,
    additionalCharges: 0,
    hourlyRate: 150
  },
  {
    id: '2',
    name: 'Amit Singh',
    photo: 'https://picsum.photos/200?random=2',
    rating: 4.5,
    experience: 5,
    specialties: [VehicleType.SEDAN, VehicleType.AUTOMATIC],
    location: { lat: 12.9720, lng: 77.5950 },
    status: DriverStatus.AVAILABLE,
    jobsCompleted: 85,
    subscriptionActive: true,
    freeJobsLeft: 1,
    additionalCharges: 50,
    hourlyRate: 120
  },
  {
    id: '3',
    name: 'Suresh Raina',
    photo: 'https://picsum.photos/200?random=3',
    rating: 4.9,
    experience: 12,
    specialties: [VehicleType.LUXURY, VehicleType.AUTOMATIC],
    location: { lat: 12.9730, lng: 77.5960 },
    status: DriverStatus.AVAILABLE,
    jobsCompleted: 340,
    subscriptionActive: true,
    freeJobsLeft: 0,
    additionalCharges: 100,
    hourlyRate: 250
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [candidateQueue, setCandidateQueue] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleSuccess = (position: GeolocationPosition) => {
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setUserLocation(coords);
      setLocationError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn("Location error:", error.message);
      setLocationError("Enable GPS for better nearby driver matching.");
      if (!userLocation) setUserLocation(DEFAULT_LOCATION);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      setUserLocation(DEFAULT_LOCATION);
    }
  }, []);

  const routeToNextDriver = useCallback(() => {
    if (!currentBooking) return;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (candidateQueue.length <= 1) {
      handleUpdateBookingStatus(BookingStatus.CANCELLED);
      alert("All nearby drivers are currently busy. Donet.in is looking for more partners in your area.");
      return;
    }

    const nextQueue = candidateQueue.slice(1);
    const nextDriverId = nextQueue[0];
    const nextDriver = drivers.find(d => d.id === nextDriverId);

    if (nextDriver) {
      setCandidateQueue(nextQueue);
      setCurrentBooking(prev => prev ? {
        ...prev,
        driverId: nextDriver.id,
        driverName: nextDriver.name,
        driverPhoto: nextDriver.photo,
        timestamp: Date.now()
      } : null);
    }
  }, [currentBooking, candidateQueue, drivers]);

  useEffect(() => {
    if (currentBooking?.status === BookingStatus.REQUESTED) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        routeToNextDriver();
      }, ASSIGNMENT_TIMEOUT);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentBooking?.status, currentBooking?.driverId, routeToNextDriver]);

  const handleCreateBooking = useCallback((selectedDriver: Driver) => {
    const availableDrivers = drivers
      .filter(d => d.status === DriverStatus.AVAILABLE)
      .map(d => ({
        ...d,
        dist: userLocation ? calculateDistance(userLocation, d.location) : 0
      }))
      .sort((a, b) => a.dist - b.dist);

    const otherCandidates = availableDrivers
      .filter(d => d.id !== selectedDriver.id)
      .map(d => d.id);
    
    const fullQueue = [selectedDriver.id, ...otherCandidates];
    setCandidateQueue(fullQueue);

    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      customerId: 'user-1',
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverPhoto: selectedDriver.photo,
      status: BookingStatus.REQUESTED,
      timestamp: Date.now(),
      pickupLocation: 'Your Current Area',
      destinationLocation: 'Nearby Hub',
    };
    setCurrentBooking(newBooking);
    
    setDrivers(prev => prev.map(d => d.id === selectedDriver.id ? { ...d, status: DriverStatus.BUSY } : d));
  }, [drivers, userLocation]);

  const handleUpdateBookingStatus = useCallback((status: BookingStatus) => {
    setCurrentBooking(prev => prev ? { ...prev, status } : null);
    
    if (status === BookingStatus.CANCELLED || status === BookingStatus.COMPLETED) {
      const driverId = currentBooking?.driverId;
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: DriverStatus.AVAILABLE } : d));
      setCandidateQueue([]);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [currentBooking]);

  const handleDeclineBooking = useCallback(() => {
    routeToNextDriver();
  }, [routeToNextDriver]);

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl relative overflow-hidden">
      <Header role={role} onRoleSwitch={setRole} />
      
      {locationError && (
        <div className="bg-amber-100 text-amber-800 px-4 py-1.5 text-[9px] text-center font-bold uppercase tracking-widest">
          {locationError}
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        {role === UserRole.CUSTOMER ? (
          <CustomerView 
            drivers={drivers} 
            userLocation={userLocation} 
            currentBooking={currentBooking}
            onCreateBooking={handleCreateBooking}
            onCancelBooking={() => handleUpdateBookingStatus(BookingStatus.CANCELLED)}
          />
        ) : (
          <DriverDashboard 
            currentBooking={currentBooking}
            onUpdateStatus={handleUpdateBookingStatus}
            onDecline={handleDeclineBooking}
          />
        )}
      </main>

      <nav className="border-t bg-white h-16 flex items-center justify-around px-4 sticky bottom-0 z-50">
        <button className="flex flex-col items-center text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Explore</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Bookings</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">Network</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
