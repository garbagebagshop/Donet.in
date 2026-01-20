
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  onRoleSwitch: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ role, onRoleSwitch }) => {
  return (
    <header className="p-4 border-b bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">Donet.in</h1>
            <p className="text-[7px] font-black uppercase text-blue-600 tracking-[0.2em] mt-0.5">Drivers Online Network</p>
          </div>
        </div>
        <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200 shadow-inner">
          <button 
            onClick={() => onRoleSwitch(UserRole.CUSTOMER)}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${role === UserRole.CUSTOMER ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
          >
            Find
          </button>
          <button 
            onClick={() => onRoleSwitch(UserRole.DRIVER)}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${role === UserRole.DRIVER ? 'bg-white shadow-md text-blue-600' : 'text-slate-500'}`}
          >
            Jobs
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
