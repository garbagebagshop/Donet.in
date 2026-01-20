
import React, { useState, useMemo } from 'react';
import { Driver, Coordinates, Booking, BookingStatus } from '../types';
import { calculateDistance, formatCurrency } from '../utils';
import ChatModal from './ChatModal';

interface CustomerViewProps {
  drivers: Driver[];
  userLocation: Coordinates | null;
  currentBooking: Booking | null;
  onCreateBooking: (driver: Driver) => void;
  onCancelBooking: () => void;
  onSendMessage: (text: string) => void;
}

const CustomerView: React.FC<CustomerViewProps> = ({ 
  drivers, 
  userLocation, 
  currentBooking, 
  onCreateBooking,
  onCancelBooking,
  onSendMessage
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showChat, setShowChat] = useState(false);

  const sortedDrivers = useMemo(() => {
    if (!userLocation) return drivers;
    return drivers
      .map(d => ({ ...d, distance: calculateDistance(userLocation, d.location) }))
      .filter(d => filter === 'all' || d.specialties.some(s => s.toLowerCase().includes(filter.toLowerCase())))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [drivers, userLocation, filter]);

  const activeTrip = currentBooking && [BookingStatus.ACCEPTED, BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS].includes(currentBooking.status);
  const isRequesting = currentBooking?.status === BookingStatus.REQUESTED;

  return (
    <div className="flex flex-col min-h-full px-6 py-4 space-y-6">
      {/* Locality Header */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Match Area</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-black text-slate-900">Nearby Bangalore Locality</h2>
        </div>
      </div>

      {isRequesting ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
           <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-200 animate-bounce">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Connecting to Driver</h3>
           <p className="text-slate-400 text-xs mb-10 text-center max-w-[240px]">We are alerting the nearest drivers in your locality for instant booking.</p>
           <button onClick={onCancelBooking} className="bg-slate-200 text-slate-600 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel Request</button>
        </div>
      ) : activeTrip ? (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
             <div className="flex items-center justify-between mb-8">
                <div className="flex gap-4 items-center">
                   <img src={currentBooking?.driverPhoto} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-slate-50" alt="" />
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{currentBooking?.driverName}</h3>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{currentBooking?.status.replace('_', ' ')}</span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${currentBooking?.driverPhone}`} className="flex flex-col items-center justify-center gap-2 bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl active:scale-95 transition-all">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Call Driver</span>
                </a>
                <button onClick={() => setShowChat(true)} className="flex flex-col items-center justify-center gap-2 bg-white text-slate-900 p-6 rounded-[2rem] border border-slate-100 shadow-sm active:scale-95 transition-all">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Chat Now</span>
                </button>
             </div>
             <button onClick={onCancelBooking} className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center mt-6">End Booking</button>
          </div>
        </div>
      ) : (
        <>
          {/* Search & Filter */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 flex items-center border border-slate-100 shadow-sm">
               <svg className="w-4 h-4 text-slate-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input type="text" placeholder="Filter by vehicle type (e.g. SUV, Auto)..." className="bg-transparent text-sm font-bold focus:outline-none w-full" onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="flex gap-2">
               {['all', 'SUV', 'Sedan', 'Auto'].map(f => (
                 <button key={f} onClick={() => setFilter(f.toLowerCase())} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f.toLowerCase() ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>{f}</button>
               ))}
            </div>
          </div>

          {/* List of nearby drivers */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
               <h3 className="text-sm font-black text-slate-900 tracking-tighter uppercase">Available Drivers</h3>
               <span className="text-[10px] font-black text-slate-400 uppercase">{sortedDrivers.length} Found</span>
            </div>
            
            {sortedDrivers.map(driver => (
              <div 
                key={driver.id} 
                onClick={() => setSelectedDriver(driver)}
                className="flex gap-4 p-5 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group"
              >
                <img src={driver.photo} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-1">
                     <h4 className="text-base font-black text-slate-900">{driver.name}</h4>
                     <p className="text-base font-black text-blue-600">{formatCurrency(driver.hourlyRate)}<span className="text-[8px] ml-0.5">/HR</span></p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">⭐ {driver.rating}</span>
                        <span className="text-[10px] font-bold text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400">{driver.experience}Y EXP</span>
                     </div>
                     <span className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-pulse">Online</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Driver Confirmation Detail */}
      {selectedDriver && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] p-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
             <div className="flex justify-between items-start mb-8">
                <div className="flex gap-5 items-center">
                  <img src={selectedDriver.photo} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-slate-50" alt="" />
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{selectedDriver.name}</h2>
                    <span className="text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest">Verified Network Driver</span>
                  </div>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="p-3 bg-slate-50 rounded-full">
                   <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Rate</p>
                <p className="text-4xl font-black text-slate-900">{formatCurrency(selectedDriver.hourlyRate)}<span className="text-xs ml-1 font-bold">/ Hour</span></p>
                <p className="text-[9px] font-medium text-slate-400 mt-4 leading-relaxed">Connect instantly and pay the driver directly after service.</p>
             </div>
             <button 
               onClick={() => { onCreateBooking(selectedDriver); setSelectedDriver(null); }}
               className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all"
             >
               Confirm Match
             </button>
          </div>
        </div>
      )}

      {showChat && activeTrip && (
        <ChatModal recipientName={currentBooking?.driverName || 'Driver'} messages={currentBooking?.messages || []} onSendMessage={onSendMessage} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default CustomerView;
