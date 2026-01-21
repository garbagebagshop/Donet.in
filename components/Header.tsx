
import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  onRoleSwitch: (role: UserRole) => void;
}

const Header: React.FC<HeaderProps> = ({ role, onRoleSwitch }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none p-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="bg-slate-900 p-2.5 rounded-2xl shadow-xl border border-white/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="drop-shadow-md">
            <h1 className="text-lg font-black tracking-tighter text-slate-900 leading-none">Donet.in</h1>
            <p className="text-[6px] font-black uppercase text-blue-600 tracking-[0.2em] mt-0.5">Drivers Online Network</p>
          </div>
        </div>

        <div className="pointer-events-auto flex bg-white/90 backdrop-blur-md rounded-2xl p-1 shadow-xl border border-white/50">
          <button 
            onClick={() => onRoleSwitch(UserRole.CUSTOMER)}
            className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.CUSTOMER ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Find
          </button>
          <button 
            onClick={() => onRoleSwitch(UserRole.DRIVER)}
            className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.DRIVER ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Jobs
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
