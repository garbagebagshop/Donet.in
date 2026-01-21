
import React, { useState } from 'react';
import { Driver, ApprovalStatus, DriverType } from '../types';
import { formatCurrency } from '../utils';

interface AdminDashboardProps {
  drivers: Driver[];
  onUpdateDriver: (driver: Driver) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ drivers, onUpdateDriver }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [auth, setAuth] = useState({ userId: '', password: '' });
  const [search, setSearch] = useState('');

  const handleLogin = () => {
    if (auth.userId === '8886575507' && auth.password === 'Harsh@123') {
      setIsLoggedIn(true);
    } else {
      alert('Unauthorized');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-w-sm space-y-8 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="text-center">
             <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
             </div>
             <h1 className="text-2xl font-black text-white tracking-tighter">Admin Portal</h1>
             <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-2">Secure Access Only</p>
          </div>
          <div className="space-y-4">
             <input 
              type="text" placeholder="User ID" 
              className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-600"
              value={auth.userId} onChange={e => setAuth({...auth, userId: e.target.value})}
             />
             <input 
              type="password" placeholder="Password" 
              className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-600"
              value={auth.password} onChange={e => setAuth({...auth, password: e.target.value})}
             />
             <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Decrypt Access</button>
          </div>
        </div>
      </div>
    );
  }

  const filtered = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
           <div>
              <h1 className="text-3xl font-black tracking-tighter">Network Management</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time Driver Approval</p>
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-4 py-2 rounded-xl">Logout</button>
        </header>

        <div className="flex gap-4">
           <input 
            type="text" placeholder="Search drivers by name or phone..." 
            className="flex-1 p-5 bg-white border border-slate-200 rounded-[2rem] font-bold outline-none shadow-sm"
            value={search} onChange={e => setSearch(e.target.value)}
           />
           <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="text-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase">Pending</p>
                 <p className="text-xl font-black text-yellow-500">{drivers.filter(d => d.approvalStatus === ApprovalStatus.PENDING).length}</p>
              </div>
              <div className="w-[1px] h-8 bg-slate-100"></div>
              <div className="text-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase">Live</p>
                 <p className="text-xl font-black text-green-500">{drivers.filter(d => d.approvalStatus === ApprovalStatus.APPROVED).length}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {filtered.map(driver => (
             <div key={driver.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
                <div className="flex gap-6 items-start">
                   <img src={driver.photo} className="w-24 h-24 rounded-[1.5rem] object-cover border-4 border-slate-50 shadow-md" alt="" />
                   <div className="flex-1">
                      <h4 className="text-xl font-black tracking-tight">{driver.name}</h4>
                      <p className="text-xs font-bold text-slate-400">{driver.phone}</p>
                      <div className="flex gap-2 mt-3">
                         <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                           driver.approvalStatus === ApprovalStatus.APPROVED ? 'bg-green-50 text-green-600' : 
                           driver.approvalStatus === ApprovalStatus.PENDING ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                         }`}>
                           {driver.approvalStatus}
                         </span>
                         <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase tracking-widest">{driver.driverType}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-[2rem]">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Rates</p>
                      <p className="text-xs font-bold">{formatCurrency(driver.hourlyRate)}/HR</p>
                      {driver.ratePerKm && <p className="text-xs font-bold">{formatCurrency(driver.ratePerKm)}/KM</p>}
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Activity</p>
                      <p className="text-xs font-bold">{driver.jobsCompleted} Jobs</p>
                      <p className="text-xs font-bold text-blue-600">{driver.jobsLeft} Credits</p>
                   </div>
                </div>

                <div className="flex gap-2">
                   {driver.approvalStatus !== ApprovalStatus.APPROVED && (
                     <button 
                      onClick={() => onUpdateDriver({...driver, approvalStatus: ApprovalStatus.APPROVED})}
                      className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100"
                     >Approve</button>
                   )}
                   {driver.approvalStatus !== ApprovalStatus.REJECTED && (
                     <button 
                      onClick={() => onUpdateDriver({...driver, approvalStatus: ApprovalStatus.REJECTED})}
                      className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                     >Reject</button>
                   )}
                   <button 
                    onClick={() => {
                      const newName = prompt('Enter new name', driver.name);
                      if (newName) onUpdateDriver({...driver, name: newName});
                    }}
                    className="p-4 bg-blue-50 text-blue-600 rounded-2xl"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
