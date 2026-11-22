import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  UploadCloud,
  Search,
  Network,
  Cpu,
  ShieldAlert,
  BellRing,
  FileBarChart,
  MessageSquareShare,
  Sliders,
  Flame,
  Layers
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Threat Intelligence', path: '/intelligence', icon: Database },
  { name: 'Data Ingestion', path: '/ingestion', icon: UploadCloud },
  { name: 'IOC Explorer', path: '/ioc-explorer', icon: Search },
  { name: 'Attack Graph', path: '/attack-graph', icon: Network, badge: 'CORE' },
  { name: 'AI Threat Analysis', path: '/ai-analysis', icon: Cpu, badge: 'AI' },
  { name: 'Vulnerability Intel', path: '/vulnerabilities', icon: ShieldAlert },
  { name: 'Alerts & Incidents', path: '/alerts', icon: BellRing, badge: 'CRIT' },
  { name: 'Reports & Analytics', path: '/reports', icon: FileBarChart },
  { name: 'Analyst Feedback', path: '/feedback', icon: MessageSquareShare },
  { name: 'Settings & Tuning', path: '/settings', icon: Sliders }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#070D1B] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Security Operations Center
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.badge === 'CORE'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : item.badge === 'AI'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Threat Level Banner */}
        <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              DEFCON 2 ALERT
            </span>
            <span className="text-[10px] font-mono text-red-400 font-bold">CRITICAL</span>
          </div>
          <p className="text-[11px] text-slate-300">
            APT29 attack chain active across MOVEit and Citrix appliances.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center justify-between">
          <span>PIPELINE ENGINE</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px]">
          <span>SCHEMA</span>
          <span className="text-slate-400">STIX 2.1 MAPPED</span>
        </div>
      </div>
    </aside>
  );
};

