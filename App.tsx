
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Driver, DriverStatus, VehicleType, Coordinates, Booking, BookingStatus, ChatMessage, ApprovalStatus, DriverType } from './types';
import CustomerView from './components/CustomerView';
import DriverDashboard from './components/DriverDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';

const DEFAULT_LOCATION: Coordinates = { lat: 12.9716, lng: 77.5946 };

const INITIAL_DRIVERS: Driver[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    password: 'password123',
    photo: 'https://picsum.photos/200?random=1',
    rating: 4.8,
    experience: 8,
    specialties: [VehicleType.SUV],
    location: { lat: 12.9716, lng: 77.5946 },
    status: DriverStatus.AVAILABLE,
    approvalStatus: ApprovalStatus.APPROVED,
    driverType: DriverType.ONLY_DRIVER,
    jobsCompleted: 120,
    jobsLeft: 2,
    hourlyRate: 150
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  // Simple Router based on window.location
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(DEFAULT_LOCATION)
      );
    } else {
      setUserLocation(DEFAULT_LOCATION);
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const activeDriver = drivers.find(d => d.id === activeDriverId) || null;

  const handleUpdateBookingStatus = useCallback((status: BookingStatus) => {
    setCurrentBooking(prev => prev ? { ...prev, status } : null);
    if (status === BookingStatus.COMPLETED && activeDriverId) {
      setDrivers(prev => prev.map(d => d.id === activeDriverId ? { 
        ...d, 
        jobsLeft: Math.max(0, d.jobsLeft - 1),
        jobsCompleted: d.jobsCompleted + 1
      } : d));
    }
    if (status === BookingStatus.CANCELLED || status === BookingStatus.COMPLETED) {
      const driverId = currentBooking?.driverId;
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: DriverStatus.AVAILABLE } : d));
    }
  }, [currentBooking, activeDriverId]);

  const handleSendMessage = (text: string) => {
    if (!currentBooking) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: role === UserRole.CUSTOMER ? 'customer' : 'driver',
      text,
      timestamp: Date.now()
    };
    setCurrentBooking(prev => prev ? { ...prev, messages: [...(prev.messages || []), newMessage] } : null);
  };

  const updateDriver = (updatedDriver: Driver) => {
    setDrivers(prev => {
      const exists = prev.find(d => d.id === updatedDriver.id);
      if (exists) return prev.map(d => d.id === updatedDriver.id ? updatedDriver : d);
      return [...prev, updatedDriver];
    });
  };

  // Admin route check
  if (currentPath === '/admin8886') {
    return <AdminDashboard drivers={drivers} onUpdateDriver={updateDriver} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative overflow-hidden font-sans">
      <Header role={role} onRoleSwitch={setRole} />
      
      <main className="flex-1 relative overflow-y-auto bg-slate-50 pt-20 pb-24">
        {role === UserRole.CUSTOMER ? (
          <CustomerView 
            drivers={drivers.filter(d => d.approvalStatus === ApprovalStatus.APPROVED)} 
            userLocation={userLocation} 
            currentBooking={currentBooking}
            onCreateBooking={(d) => {
              const newBooking: Booking = {
                id: Math.random().toString(36).substr(2, 9),
                customerId: 'user-1',
                driverId: d.id,
                driverName: d.name,
                driverPhoto: d.photo,
                driverPhone: d.phone,
                status: BookingStatus.REQUESTED,
                timestamp: Date.now(),
                pickupLocation: 'Current Vicinity',
                messages: []
              };
              setCurrentBooking(newBooking);
              setDrivers(prev => prev.map(drv => drv.id === d.id ? { ...drv, status: DriverStatus.BUSY } : drv));
            }}
            onCancelBooking={() => handleUpdateBookingStatus(BookingStatus.CANCELLED)}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <DriverDashboard 
            activeDriver={activeDriver}
            onLogin={(driver) => {
              setActiveDriverId(driver.id);
              updateDriver(driver);
            }}
            onRegister={(driver) => {
              updateDriver(driver);
              setActiveDriverId(driver.id);
            }}
            onUpdateDriver={updateDriver}
            currentBooking={currentBooking}
            onUpdateStatus={handleUpdateBookingStatus}
            onDecline={() => handleUpdateBookingStatus(BookingStatus.CANCELLED)}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white h-20 flex items-center justify-around px-8 border-t border-slate-100 z-[200]">
        <button onClick={() => setRole(UserRole.CUSTOMER)} className={`flex flex-col items-center gap-1 flex-1 ${role === UserRole.CUSTOMER ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Find</span>
        </button>
        <button onClick={() => setRole(UserRole.DRIVER)} className={`flex flex-col items-center gap-1 flex-1 ${role === UserRole.DRIVER ? 'text-blue-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Jobs</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
