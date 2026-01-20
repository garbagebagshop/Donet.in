
import React, { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '../utils';
import { Booking, BookingStatus, VehicleType, VehicleProvision } from '../types';

interface DriverDashboardProps {
  currentBooking: Booking | null;
  onUpdateStatus: (status: BookingStatus) => void;
  onDecline: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ currentBooking, onUpdateStatus, onDecline }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasSubmittedProfile, setHasSubmittedProfile] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [showAcceptedDetails, setShowAcceptedDetails] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'Basic' | 'Pro'>('Basic');
  const [timeLeft, setTimeLeft] = useState(100); 
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    age: '',
    experience: '5',
    vehicleProvision: VehicleProvision.CUSTOMER_OWNED,
    preferredArea: '',
    profilePhoto: null as File | null,
    licensePhoto: null as File | null,
    locationPermission: false,
    notificationsEnabled: false
  });

  const isRequestActive = currentBooking?.status === BookingStatus.REQUESTED && isOnline && isSubscribed;

  useEffect(() => {
    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isRequestActive) {
      setTimeLeft(100);
      
      if (!audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.6;
      }
      
      audioRef.current.play().catch(() => {
        console.warn("Audio autoplay blocked by browser policy.");
      });

      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - (100 / 60); 
        });
      }, 1000);
    } else {
      setTimeLeft(100);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (audioRef.current) audioRef.current.pause();
    };
  }, [isRequestActive]);

  const handleAcceptJob = () => {
    onUpdateStatus(BookingStatus.ACCEPTED);
    setShowAcceptedDetails(true);
  };

  const handleDeclineJob = () => {
    onDecline();
  };

  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setProfileData(prev => ({ ...prev, locationPermission: true })),
        () => alert("Location access is required for Donet.in drivers.")
      );
    }
  };

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setProfileData(prev => ({ ...prev, notificationsEnabled: true }));
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallPopup(true);
    }
  };

  const handleGrantPermissions = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setProfileData(prev => ({ ...prev, notificationsEnabled: true }));
        }
      });
    }
    handleRequestLocation();
    alert("Donet.in permissions (Location, Camera, Notifications) have been requested.");
  };

  const handleRegisterAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name || !profileData.phone || !profileData.age) {
      alert("Please fill in all identity details.");
      return;
    }
    setHasSubmittedProfile(true);
    // Redirect to Razorpay gateway
    window.location.href = 'https://rzp.io/rzp/ZKe8OtXi';
  };

  const activeJob = currentBooking && ![BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(currentBooking.status) 
    ? currentBooking 
    : null;

  const renewalDate = new Date();
  renewalDate.setDate(renewalDate.getDate() + 30);
  const formattedDate = renewalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Registration Flow
  if (!hasSubmittedProfile) {
    return (
      <div className="p-6 bg-slate-50 min-h-full pb-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Driver Onboarding</h2>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-300 ${regStep >= s ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              ))}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3">Step {regStep} of 4</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 min-h-[520px] flex flex-col overflow-hidden relative">
            
            {regStep === 1 && (
              <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-black text-slate-800">Identity Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Full Name</label>
                    <input required type="text" placeholder="e.g. Rajesh Kumar" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Age</label>
                      <input required type="number" placeholder="28" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" value={profileData.age} onChange={e => setProfileData({...profileData, age: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">Phone</label>
                      <input required type="tel" placeholder="98XXXXXXXX" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button onClick={() => setRegStep(2)} className="w-full bg-blue-600 py-5 rounded-2xl text-white font-black text-lg mt-auto active:scale-95 transition-all shadow-xl shadow-blue-100">Next: Documents</button>
              </div>
            )}

            {regStep === 2 && (
              <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-black text-slate-800">Profile & Documents</h3>
                <div className="space-y-5">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-blue-200">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-700 uppercase">Profile Photo</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Must match license photo</p>
                        <input type="file" className="hidden" id="profileImg" onChange={e => setProfileData({...profileData, profilePhoto: e.target.files?.[0] || null})} />
                        <label htmlFor="profileImg" className="text-[10px] font-black text-blue-600 uppercase mt-1 inline-block cursor-pointer">Upload Photo</label>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border-2 border-dashed border-slate-200">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-700 uppercase">Driving License</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Clearly visible scan</p>
                        <input type="file" className="hidden" id="licenseImg" onChange={e => setProfileData({...profileData, licensePhoto: e.target.files?.[0] || null})} />
                        <label htmlFor="licenseImg" className="text-[10px] font-black text-blue-600 uppercase mt-1 inline-block cursor-pointer">Upload License</label>
                      </div>
                   </div>
                   <div className="pt-4">
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 text-center">Service Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setProfileData({...profileData, vehicleProvision: VehicleProvision.CUSTOMER_OWNED})} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${profileData.vehicleProvision === VehicleProvision.CUSTOMER_OWNED ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-400'}`}>Driving Only</button>
                        <button type="button" onClick={() => setProfileData({...profileData, vehicleProvision: VehicleProvision.DRIVER_OWNED})} className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${profileData.vehicleProvision === VehicleProvision.DRIVER_OWNED ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-400'}`}>With Vehicle</button>
                      </div>
                   </div>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => setRegStep(1)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase text-xs">Back</button>
                  <button onClick={() => setRegStep(3)} className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs">Next: Region</button>
                </div>
              </div>
            )}

            {regStep === 3 && (
              <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-black text-slate-800">Operational Area</h3>
                <div className="space-y-4">
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3 text-center">Live GPS Search</p>
                    <button 
                      onClick={handleRequestLocation} 
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase transition-all ${profileData.locationPermission ? 'bg-green-100 text-green-700' : 'bg-white text-blue-600 shadow-sm border border-blue-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                      {profileData.locationPermission ? 'Permission Active' : 'Request Location Access'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-[9px] font-black text-slate-300">CITY</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Bangalore, Mumbai, Delhi" 
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                      value={profileData.preferredArea}
                      onChange={e => setProfileData({...profileData, preferredArea: e.target.value})}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium text-center px-4">Donet.in matches you with customers based on your live vicinity for fastest pickups.</p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => setRegStep(2)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase text-xs">Back</button>
                  <button onClick={() => setRegStep(4)} className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs">Next: App Install</button>
                </div>
              </div>
            )}

            {regStep === 4 && (
              <div className="space-y-6 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-100 relative">
                     <div className="absolute inset-0 bg-white rounded-2xl animate-ping opacity-10"></div>
                     <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Drivers Online Network</h3>
                  <p className="text-sm text-slate-500 mt-2">Join the <strong>Donet.in</strong> fleet. Install the app to receive loud audible job alerts on your phone.</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handlePWAInstall}
                    className="w-full bg-blue-50 border-2 border-blue-200 py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span className="text-xs font-black text-blue-900 uppercase">Install Donet Web App</span>
                  </button>

                  <button 
                    onClick={handleGrantPermissions}
                    className="w-full bg-slate-900 py-4 rounded-2xl flex items-center justify-center gap-3 text-white active:scale-[0.98] transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span className="text-xs font-black uppercase">Enable Notification Alerts</span>
                  </button>
                </div>

                <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-600/10 mt-auto">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Partner Monthly Fee</span>
                      <span className="text-lg font-black text-blue-600">₹100</span>
                   </div>
                   <p className="text-[9px] text-blue-700 font-bold uppercase tracking-tighter text-center">Get Unlimited Job Access • 2 Free Bookings Included</p>
                </div>

                <button onClick={handleRegisterAndPay} className="w-full bg-blue-600 py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all">Submit & Join Donet.in</button>
                <button onClick={() => setRegStep(3)} className="w-full py-1 text-[10px] font-black text-slate-300 uppercase">Return to Map Area</button>
              </div>
            )}

            {showInstallPopup && (
              <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                   <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">How to Install</h4>
                <div className="text-xs text-slate-500 font-bold space-y-4 mb-8 text-left max-w-[240px]">
                   <p className="flex gap-2"><span>1.</span> Tap browser settings (3 dots or share)</p>
                   <p className="flex gap-2"><span>2.</span> Select <strong>'Add to Home Screen'</strong></p>
                   <p className="flex gap-2"><span>3.</span> Open from Home Screen for job alerts.</p>
                </div>
                <button onClick={() => setShowInstallPopup(false)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Okay, Understood</button>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Verification State
  if (!isSubscribed) {
    return (
      <div className="p-6 bg-slate-50 min-h-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-25"></div>
          <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 leading-tight tracking-tight">Verifying Your Profile</h2>
        <p className="text-slate-500 mb-10 max-w-xs leading-relaxed">
          The <strong>Donet.in</strong> team is reviewing your documents. Verification takes about 60 mins. <br/>
          You'll be notified once you're live!
        </p>
        <button onClick={() => setIsSubscribed(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">(Simulate Approval)</button>
      </div>
    );
  }

  return (
    <div className={`p-0 bg-slate-50 min-h-full pb-20 transition-all duration-500 relative ${isRequestActive ? 'overflow-hidden' : ''}`}>
      
      {isRequestActive && (
        <div className="fixed inset-0 pointer-events-none z-[105] ring-[30px] ring-blue-600/30 animate-pulse duration-[800ms] shadow-[inset_0_0_100px_rgba(37,99,235,0.2)]"></div>
      )}

      {isRequestActive && (
        <div className="sticky top-0 z-[110] animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 shadow-[0_25px_60px_rgba(37,99,235,0.45)] border-b-4 border-white/20">
            <div className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50"></div>
                  <div className="relative w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-2xl transform rotate-3 animate-bounce">
                    <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black uppercase tracking-widest text-white leading-none mb-1 tracking-tighter">New Donet Request!</h3>
                  <p className="text-[10px] text-blue-50 font-black uppercase opacity-90 tracking-widest line-clamp-1">{currentBooking?.pickupLocation}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={handleAcceptJob} className="bg-white text-blue-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Accept</button>
                <button onClick={handleDeclineJob} className="bg-red-500/20 text-white/90 border border-white/20 px-6 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest active:scale-95 transition-all">Decline</button>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center text-[10px] text-white font-black uppercase tracking-widest mb-1.5 px-1">
                <span className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-ping"></span>
                   Expiring In
                </span>
                <span>{Math.ceil((timeLeft / 100) * 60)}s</span>
              </div>
              <div className="w-full h-3 bg-blue-900/50 rounded-full overflow-hidden border border-white/20 p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft < 25 ? 'bg-red-400' : 'bg-white'}`}
                  style={{ width: `${timeLeft}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`px-4 py-2 transition-colors duration-500 text-center ${isOnline ? 'bg-green-500 shadow-sm' : 'bg-slate-500'}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
          {isOnline ? '● Operational: Live on Network' : '○ System Paused'}
        </p>
      </div>

      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Donet Dashboard</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{profileData.name}</span>
              <span className="text-[9px] px-2 py-0.5 bg-slate-200 rounded text-slate-600 font-black uppercase tracking-tighter">
                {profileData.vehicleProvision === VehicleProvision.DRIVER_OWNED ? 'With Car' : 'Expert Driver'}
              </span>
            </div>
          </div>
          <button onClick={() => setIsOnline(!isOnline)} className={`w-16 h-9 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-green-500 shadow-lg' : 'bg-slate-300'}`}>
            <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-sm ${isOnline ? 'right-1.5' : 'left-1.5'}`}></div>
          </button>
        </div>

        {activeJob ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`bg-white rounded-[2rem] p-6 shadow-xl border-l-4 border-l-blue-600`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Network Status</h4>
                  <p className="text-lg font-black text-slate-900 leading-none">{activeJob.status.replace('_', ' ')}</p>
                </div>
                <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
              </div>
              <div className="space-y-5 mb-8">
                 <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p><p className="text-lg font-black text-slate-900 leading-none">Verified Network User</p></div>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg></div>
                    <div className="flex-1 overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pickup From</p><p className="text-sm font-bold text-slate-900 truncate leading-tight">{activeJob.pickupLocation}</p></div>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {activeJob.status === BookingStatus.ACCEPTED && <button onClick={() => onUpdateStatus(BookingStatus.ARRIVED)} className="w-full bg-slate-900 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-lg">Arrived at Pickup</button>}
                {activeJob.status === BookingStatus.ARRIVED && <button onClick={() => onUpdateStatus(BookingStatus.IN_PROGRESS)} className="w-full bg-blue-600 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100">Start Network Trip</button>}
                {activeJob.status === BookingStatus.IN_PROGRESS && <button onClick={() => onUpdateStatus(BookingStatus.COMPLETED)} className="w-full bg-green-600 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100">Complete & Earn</button>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jobs Left</p><p className="text-3xl font-black text-blue-600 leading-none tracking-tight">2 FREE</p></div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Wallet</p><p className="text-3xl font-black text-slate-900 leading-none tracking-tight">₹0.00</p></div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
               <div className="flex justify-between items-center mb-5"><h4 className="text-sm font-black text-slate-900 tracking-tight">Booking Rate</h4><button onClick={() => setIsEditingRate(!isEditingRate)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{isEditingRate ? 'Save' : 'Edit'}</button></div>
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"><svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
                  <div className="flex-1">{isEditingRate ? <div className="flex items-center gap-2"><span className="text-lg font-black">₹</span><input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full py-1 border-b-2 border-blue-600 text-2xl font-black focus:outline-none" /></div> : <p className="text-2xl font-black text-slate-900">{formatCurrency(hourlyRate)}<span className="text-xs font-bold text-slate-400 ml-1">/HOUR</span></p>}</div>
               </div>
             </div>
             <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-2xl shadow-blue-100/50">
                <div className="flex justify-between items-center mb-6">
                  <div><h4 className="text-sm font-black text-slate-900 tracking-tight">Donet.in Member</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Access Pass</p></div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span><span className="text-[10px] font-black uppercase tracking-tight">Verified</span></div>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Tier</p><p className="text-sm font-black text-slate-900">{currentPlan} Partner</p></div>
                  <div className="text-right"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Next Payment</p><p className="text-xs font-bold text-slate-900">{formattedDate}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3"><button onClick={() => alert("Renewal triggered via gateway.")} className="bg-slate-100 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Renew Now</button><button onClick={() => setCurrentPlan('Pro')} className="bg-slate-900 py-3 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">Go Pro</button></div>
             </div>
          </div>
        )}
      </div>

      {showAcceptedDetails && activeJob && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md"><svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg></div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Trip Confirmed!</h2>
              <p className="text-slate-500 text-sm">Proceeding to customer's vehicle</p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex gap-4"><div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div><div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Customer</p><p className="text-lg font-black text-slate-900 leading-none">Donet User #123</p></div></div>
              <div className="flex gap-4"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg></div><div className="flex-1 overflow-hidden"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Network Pickup</p><p className="text-sm font-black text-slate-900 truncate leading-tight">{activeJob.pickupLocation}</p></div></div>
            </div>
            <button onClick={() => setShowAcceptedDetails(false)} className="w-full bg-slate-900 py-5 rounded-2xl text-white font-black text-lg active:scale-95 transition-all shadow-xl">Launch Navigation</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
