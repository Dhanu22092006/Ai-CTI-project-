import React from 'react';
import { Shield, Sparkles, User, LogOut, Bell, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onOpenDemo: () => void;
  activeAlertCount?: number;
}

export const Header: React.FC<Props> = ({ onOpenDemo, activeAlertCount = 3 }) => {
  const { user, logout, demoLogin } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#080F1F]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#080F1F] animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              AI-POWERED CTI CORRELATION PLATFORM
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded">
                v1.0 SOC
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              Smarter Intelligence. Safer Tomorrow.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 ml-6 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Radio className="w-3 h-3 animate-ping" />
          <span>REAL-TIME CORRELATION ENGINE ACTIVE</span>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-3">
        {/* RUN THREAT CORRELATION DEMO BUTTON */}
        <button
          onClick={onOpenDemo}
          className="relative group px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-cyan-400/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="tracking-wide">RUN THREAT CORRELATION DEMO</span>
        </button>

        {/* Demo Roles Quick Switcher */}
        <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => demoLogin('admin')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              user?.role === 'admin'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => demoLogin('analyst')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              user?.role === 'analyst'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analyst
          </button>
          <button
            onClick={() => demoLogin('viewer')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
              user?.role === 'viewer'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Viewer
          </button>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.full_name || 'SOC Analyst'}</div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase">{user?.role || 'analyst'}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

