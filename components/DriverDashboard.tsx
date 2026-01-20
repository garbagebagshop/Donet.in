
import React, { useState, useRef } from 'react';
import { formatCurrency } from '../utils';
import { Booking, BookingStatus, Driver, DriverStatus, VehicleType, ApprovalStatus, DriverType } from '../types';
import ChatModal from './ChatModal';

const PAYMENT_LINK = "https://rzp.io/rzp/ZKe8OtXi";

interface DriverDashboardProps {
  activeDriver: Driver | null;
  onLogin: (driver: Driver) => void;
  onRegister: (driver: Driver) => void;
  onUpdateDriver: (driver: Driver) => void;
  currentBooking: Booking | null;
  onUpdateStatus: (status: BookingStatus) => void;
  onDecline: () => void;
  onSendMessage: (text: string) => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
  activeDriver, 
  onLogin, 
  onRegister,
  onUpdateDriver,
  currentBooking, 
  onUpdateStatus, 
  onDecline, 
  onSendMessage 
}) => {
  const [view, setView] = useState<'AUTH' | 'LOGIN' | 'REGISTER' | 'DASHBOARD'>('AUTH');
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [regStep, setRegStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  // Fix: Added missing showChat state
  const [showChat, setShowChat] = useState(false);
  const [regData, setRegData] = useState<Partial<Driver>>({
    name: '',
    phone: '',
    password: '',
    driverType: DriverType.ONLY_DRIVER,
    hourlyRate: 150,
    specialties: [VehicleType.SEDAN],
    photo: '',
    documents: { license: '', aadhaar: '' }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Simple Auth View
  if (!activeDriver && view === 'AUTH') {
    return (
      <div className="h-full flex flex-col p-8 justify-center space-y-8 animate-in fade-in duration-500">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-200">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Driver Network</h2>
          <p className="text-slate-500 text-sm mt-2">Manage your professional driver profile</p>
        </div>
        <div className="space-y-4">
          <button onClick={() => setView('LOGIN')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Login</button>
          <button onClick={() => setView('REGISTER')} className="w-full bg-white border-2 border-slate-100 text-slate-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest">Create Account</button>
        </div>
      </div>
    );
  }

  // Login View
  if (view === 'LOGIN') {
    return (
      <div className="h-full p-8 flex flex-col animate-in slide-in-from-right duration-300">
        <button onClick={() => setView('AUTH')} className="mb-8 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Welcome Back</h2>
        <div className="space-y-6">
          <input 
            type="tel" placeholder="Mobile Number" 
            className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600"
            value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600"
            value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})}
          />
          <button 
            onClick={() => {
              // Mock Login Logic
              if (loginForm.phone === '9876543210' && loginForm.password === 'password123') {
                onLogin({ id: '1', name: 'Rajesh Kumar', phone: '9876543210', photo: 'https://picsum.photos/200', rating: 4.8, experience: 8, specialties: [VehicleType.SUV], location: { lat: 0, lng: 0 }, status: DriverStatus.AVAILABLE, approvalStatus: ApprovalStatus.APPROVED, driverType: DriverType.ONLY_DRIVER, jobsCompleted: 120, jobsLeft: 2, hourlyRate: 150 });
              } else {
                alert('Invalid Credentials');
              }
            }}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
          >Sign In</button>
        </div>
      </div>
    );
  }

  // Register View
  if (view === 'REGISTER') {
    const startCamera = async () => {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    };

    const takePhoto = () => {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current?.videoWidth || 0;
      canvas.height = videoRef.current?.videoHeight || 0;
      canvas.getContext('2d')?.drawImage(videoRef.current!, 0, 0);
      setRegData({ ...regData, photo: canvas.toDataURL('image/jpeg') });
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
      setIsCapturing(false);
    };

    return (
      <div className="h-full p-8 flex flex-col animate-in slide-in-from-right duration-300">
        <button onClick={() => setView('AUTH')} className="mb-6 text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Registration</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {regStep} of 4</span>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6">
          {regStep === 1 && (
            <div className="space-y-6">
              <input type="text" placeholder="Full Name" className="w-full p-4 border border-slate-200 rounded-2xl font-bold outline-none" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} />
              <input type="tel" placeholder="Mobile Number" className="w-full p-4 border border-slate-200 rounded-2xl font-bold outline-none" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} />
              <input type="password" placeholder="Set Password" className="w-full p-4 border border-slate-200 rounded-2xl font-bold outline-none" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
            </div>
          )}

          {regStep === 2 && (
            <div className="space-y-6 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Take a Profile Selfie</p>
              {regData.photo ? (
                <div className="relative mx-auto w-48 h-48">
                  <img src={regData.photo} className="w-full h-full rounded-[2rem] object-cover border-4 border-blue-600 shadow-xl" alt="Selfie" />
                  <button onClick={() => setRegData({...regData, photo: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ) : isCapturing ? (
                <div className="relative mx-auto w-48 h-48 overflow-hidden rounded-[2rem] bg-slate-100 shadow-inner">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  <button onClick={takePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-4 rounded-full shadow-xl">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4z" /><path d="M10 14a3 3 0 100-6 3 3 0 000 6z" /></svg>
                  </button>
                </div>
              ) : (
                <button onClick={startCamera} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 text-slate-400 active:bg-slate-50">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">Open Camera</span>
                </button>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Driving License</label>
                  <button className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">Upload Doc</button>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Aadhaar Card</label>
                  <button className="w-full py-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600">Upload Doc</button>
                </div>
              </div>
            </div>
          )}

          {regStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setRegData({...regData, driverType: DriverType.ONLY_DRIVER})}
                  className={`p-6 rounded-[2rem] border-2 transition-all ${regData.driverType === DriverType.ONLY_DRIVER ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'}`}
                >
                  <h4 className="font-black text-sm">Only Driver</h4>
                </button>
                <button 
                  onClick={() => setRegData({...regData, driverType: DriverType.WITH_CAR})}
                  className={`p-6 rounded-[2rem] border-2 transition-all ${regData.driverType === DriverType.WITH_CAR ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100'}`}
                >
                  <h4 className="font-black text-sm">With Car</h4>
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Rates (₹)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Per Hour" className="p-4 border border-slate-200 rounded-2xl font-bold outline-none" value={regData.hourlyRate} onChange={e => setRegData({...regData, hourlyRate: Number(e.target.value)})} />
                  <input type="number" placeholder="Per KM" className="p-4 border border-slate-200 rounded-2xl font-bold outline-none" value={regData.ratePerKm} onChange={e => setRegData({...regData, ratePerKm: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          )}

          {regStep === 4 && (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-500 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-xl">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">Ready to Start?</h3>
                <p className="text-slate-500 text-xs mt-2 px-6">Payment of ₹100 is required for activation and profile verification.</p>
              </div>
              <button 
                onClick={() => window.open(PAYMENT_LINK, '_blank')}
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl active:scale-95 transition-all"
              >Pay ₹100 Now</button>
            </div>
          )}
        </div>

        <div className="mt-8">
          {regStep < 4 ? (
            <button 
              onClick={() => setRegStep(regStep + 1)}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95"
            >Next Step</button>
          ) : (
            <button 
              onClick={() => {
                const newDriver: Driver = {
                  ...regData as Driver,
                  id: 'driver-' + Date.now(),
                  rating: 5.0,
                  experience: 0,
                  status: DriverStatus.OFFLINE,
                  approvalStatus: ApprovalStatus.PENDING,
                  jobsCompleted: 0,
                  jobsLeft: 10,
                  location: { lat: 12.97, lng: 77.59 }
                };
                onRegister(newDriver);
              }}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95"
            >Submit for Approval</button>
          )}
        </div>
      </div>
    );
  }

  // Pending Approval View
  if (activeDriver?.approvalStatus === ApprovalStatus.PENDING) {
    return (
      <div className="h-full flex flex-col p-10 justify-center items-center text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-yellow-400 rounded-[2.5rem] flex items-center justify-center text-white mb-8 animate-pulse shadow-xl shadow-yellow-100">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Under Review</h2>
        <p className="text-slate-500 text-sm mt-4 px-8 leading-relaxed">Our team is verifying your documents. You will receive an alert once your profile is live.</p>
        <button onClick={() => window.location.reload()} className="mt-12 text-[10px] font-black text-blue-600 uppercase tracking-widest border-b-2 border-blue-600 pb-1">Refresh Status</button>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="h-full w-full bg-slate-100 flex flex-col px-6 py-4 space-y-6 overflow-y-auto pb-10">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center gap-4">
        <img src={activeDriver?.photo} className="w-16 h-16 rounded-2xl object-cover border-4 border-slate-50" alt="" />
        <div className="flex-1">
          <h3 className="text-xl font-black text-slate-900 leading-none">{activeDriver?.name}</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest">Verified Member</p>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="p-3 bg-slate-50 rounded-2xl">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-blue-600 space-y-6 animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Update Profile</h4>
              <button onClick={() => setIsEditing(false)} className="text-red-500 text-[10px] font-black">Close</button>
           </div>
           <div className="space-y-4">
              <div className="flex gap-2">
                 <button 
                  onClick={() => onUpdateDriver({...activeDriver!, driverType: DriverType.ONLY_DRIVER})}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${activeDriver?.driverType === DriverType.ONLY_DRIVER ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                 >Only Driver</button>
                 <button 
                  onClick={() => onUpdateDriver({...activeDriver!, driverType: DriverType.WITH_CAR})}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${activeDriver?.driverType === DriverType.WITH_CAR ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                 >With Car</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Hourly</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={activeDriver?.hourlyRate} onChange={e => onUpdateDriver({...activeDriver!, hourlyRate: Number(e.target.value)})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase">Per KM</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={activeDriver?.ratePerKm || 0} onChange={e => onUpdateDriver({...activeDriver!, ratePerKm: Number(e.target.value)})} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Stats and Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl">
           <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Available Matches</p>
           <h3 className="text-3xl font-black">{activeDriver?.jobsLeft}</h3>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
           <h3 className="text-xl font-black text-slate-900">Settled Offline</h3>
        </div>
      </div>

      {/* Active Booking */}
      {currentBooking && currentBooking.status !== BookingStatus.COMPLETED && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-4 border-blue-600 space-y-6">
           <div className="flex justify-between items-center">
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ongoing Request</p>
                 <h3 className="text-xl font-black text-slate-900 leading-none">{currentBooking.status.replace('_', ' ')}</h3>
              </div>
              <button onClick={() => setShowChat(true)} className="p-4 bg-slate-50 rounded-2xl shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg></button>
           </div>
           <div className="flex gap-2">
              <button onClick={() => onUpdateStatus(BookingStatus.COMPLETED)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Mark Done</button>
              <button onClick={onDecline} className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
           </div>
        </div>
      )}

      {/* Pricing / Offline settlement reminder */}
      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white space-y-4">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Pricing Model</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold">Standard Rate</span>
            <span className="text-2xl font-black">{formatCurrency(activeDriver?.hourlyRate || 0)}/HR</span>
          </div>
          {activeDriver?.driverType === DriverType.WITH_CAR && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold">Distance Rate</span>
              <span className="text-2xl font-black">{formatCurrency(activeDriver?.ratePerKm || 0)}/KM</span>
            </div>
          )}
        </div>
        <p className="text-[9px] font-medium opacity-70 leading-relaxed">Customers will coordinate payments directly with you. Use Donet.in to connect and verify matches.</p>
      </div>

      {showChat && currentBooking && (
        <ChatModal recipientName="Customer" messages={currentBooking.messages || []} onSendMessage={onSendMessage} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default DriverDashboard;
