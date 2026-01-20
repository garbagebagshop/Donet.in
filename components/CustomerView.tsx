
import React, { useState, useMemo } from 'react';
import { Driver, Coordinates, DriverStatus, Booking, BookingStatus, VehicleProvision } from '../types';
import { calculateDistance, formatCurrency } from '../utils';

interface CustomerViewProps {
  drivers: Driver[];
  userLocation: Coordinates | null;
  currentBooking: Booking | null;
  onCreateBooking: (driver: Driver) => void;
  onCancelBooking: () => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ 
  drivers, 
  userLocation, 
  currentBooking, 
  onCreateBooking,
  onCancelBooking 
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const sortedDrivers = useMemo(() => {
    if (!userLocation) return drivers;
    return drivers
      .map(d => ({
        ...d,
        distance: calculateDistance(userLocation, d.location)
      }))
      .filter(d => filter === 'all' || d.specialties.some(s => s.toLowerCase().includes(filter.toLowerCase())))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [drivers, userLocation, filter]);

  if (currentBooking && currentBooking.status !== BookingStatus.CANCELLED && currentBooking.status !== BookingStatus.COMPLETED) {
    return (
      <div className="p-6 bg-slate-50 min-h-full flex flex-col">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 flex-1 flex flex-col">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img src={currentBooking.driverPhoto} className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md" alt="Driver" />
              <div className="absolute -bottom-1 -right-1 bg-blue-600 p-2 rounded-full border-2 border-white">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{currentBooking.driverName}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {currentBooking.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                <div className="w-0.5 h-8 bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full border-2 border-slate-300"></div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Pickup</p>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{currentBooking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Updates</p>
                  <p className="text-sm text-slate-600 leading-tight">
                    {currentBooking.status === BookingStatus.REQUESTED && "Assigning nearby driver..."}
                    {currentBooking.status === BookingStatus.ACCEPTED && "Driver heading to you"}
                    {currentBooking.status === BookingStatus.ARRIVED && "Driver reached!"}
                    {currentBooking.status === BookingStatus.IN_PROGRESS && "Trip active"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[1.5rem] p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Arrival</p>
                <p className="text-lg font-black text-slate-900">4-6 mins</p>
              </div>
              <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </button>
            </div>
          </div>

          <button 
            onClick={onCancelBooking}
            className="w-full mt-6 py-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-colors uppercase text-xs tracking-widest"
          >
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 min-h-full">
      <div className="mb-6 space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </span>
          <input 
            type="text" 
            placeholder="Where to?" 
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-[1.25rem] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all font-medium"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {['All', 'SUV', 'Sedan', 'Automatic', 'Luxury'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f.toLowerCase())}
              className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                filter === f.toLowerCase() 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Nearby Drivers</h2>
        {sortedDrivers.map(driver => (
          <div 
            key={driver.id} 
            onClick={() => driver.status === DriverStatus.AVAILABLE && setSelectedDriver(driver)}
            className={`bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden active:scale-[0.98] ${driver.status !== DriverStatus.AVAILABLE ? 'opacity-75 grayscale' : ''}`}
          >
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <img src={driver.photo} alt={driver.name} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-sm" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-white rounded-full ${driver.status === DriverStatus.AVAILABLE ? 'bg-green-500' : 'bg-slate-300'}`}></div>
              </div>
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight text-lg leading-none mb-1">{driver.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg">
                        <svg className="w-2.5 h-2.5 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-[10px] font-black text-amber-700 leading-none">{driver.rating}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{driver.experience}Y EXP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 leading-none">{formatCurrency(driver.hourlyRate || 0)}/hr</p>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mt-1">
                      {driver.vehicleProvision === VehicleProvision.DRIVER_OWNED ? 'Brings Own Car' : 'Driving Service'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    {driver.distance ? `${driver.distance.toFixed(1)} km` : 'Local'}
                  </span>
                  <div className="flex gap-1.5">
                    {driver.specialties.slice(0, 2).map(s => (
                      <span key={s} className="text-[8px] font-black px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 uppercase">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDriver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                <img src={selectedDriver.photo} className="w-20 h-20 rounded-[1.5rem] object-cover" alt="" />
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">{selectedDriver.name}</h2>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    {selectedDriver.vehicleProvision === VehicleProvision.DRIVER_OWNED ? 'Owns & Drives Vehicle' : 'Expert Personal Driver'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDriver(null)} className="p-2 bg-slate-100 rounded-full active:scale-90 transition-all">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-4 mb-10">
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rate</p>
                   <p className="text-lg font-black text-slate-900">{formatCurrency(selectedDriver.hourlyRate || 0)}<span className="text-[10px] ml-0.5">/hr</span></p>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                   <p className="text-lg font-black text-slate-900">{selectedDriver.experience}<span className="text-[10px] ml-0.5">YEARS</span></p>
                 </div>
              </div>

              <div className="p-5 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex items-start gap-4">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-blue-900 uppercase tracking-tight leading-none mb-1">Verified Partner</p>
                  <p className="text-[10px] font-medium text-blue-700 leading-tight">
                    {selectedDriver.vehicleProvision === VehicleProvision.DRIVER_OWNED 
                      ? "This driver will arrive with a sanitized vehicle ready for your trip."
                      : "This is a professional driver who will drive your vehicle at your location."}
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                onCreateBooking(selectedDriver);
                setSelectedDriver(null);
              }}
              className="w-full bg-slate-900 py-5 rounded-[1.5rem] text-white font-black text-lg shadow-2xl active:scale-[0.98] transition-all"
            >
              Request {selectedDriver.name.split(' ')[0]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;
