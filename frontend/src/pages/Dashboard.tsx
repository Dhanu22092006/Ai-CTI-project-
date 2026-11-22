import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, AlertTriangle, Network, Layers, Database,
  ArrowUpRight, RefreshCw, Activity, CheckCircle, ExternalLink,
  Flame, Crosshair, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from 'recharts';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-cyan-400">Loading SOC Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  const kpi = data?.kpi || {};

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Threat Intelligence & Correlation Overview
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time unified attack-chain discovery across multi-source security feeds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Feeds</span>
          </button>
          <button
            onClick={() => navigate('/attack-graph')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs text-cyan-400 font-medium flex items-center gap-1.5 transition"
          >
            <Network className="w-3.5 h-3.5" />
            <span>Open Graph Canvas</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono">TOTAL INDICATORS</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpi.total_indicators || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-cyan-400">STIX 2.1</span> normalized
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-red-400 text-xs mb-2">
            <span className="font-mono">CRITICAL THREATS</span>
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{kpi.critical_threats || 0}</div>
          <div className="text-[11px] text-red-300/80 mt-1 flex items-center gap-1">
            Immediate action required
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span className="font-mono">ACTIVE ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{kpi.active_alerts || 0}</div>
          <div className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1">
            With full evidence chains
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-blue-400 text-xs mb-2">
            <span className="font-mono">ATTACK CHAINS</span>
            <Network className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{kpi.correlated_attack_chains || 0}</div>
          <div className="text-[11px] text-blue-300/80 mt-1 flex items-center gap-1">
            Multi-stage graph clusters
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono">UNIQUE CVES</span>
            <Crosshair className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{kpi.unique_cves || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            NVD & vulnerability mappings
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono">GRAPH EDGES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpi.total_relationships || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Topological connections
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono">INTEL SOURCES</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{kpi.total_sources || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            OTX, MISP, CERT-In, EDR
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-mono">DUPLICATES MERGED</span>
            <CheckCircle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{kpi.duplicates_removed || 0}</div>
          <div className="text-[11px] text-teal-300/80 mt-1">
            Alert fatigue reduced
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Activity Timeline */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Threat Activity Timeline</h3>
              <p className="text-xs text-slate-400">Ingested indicators categorized by severity over the past 7 days</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">7 DAYS</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline || []}>
                <defs>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1426', borderColor: '#1E2D4A', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#critGrad)" name="Critical" />
                <Area type="monotone" dataKey="high" stroke="#f97316" fillOpacity={1} fill="url(#highGrad)" name="High" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Severity Breakdown</h3>
            <p className="text-xs text-slate-400">Contextual risk score distribution</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severity_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(data?.severity_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1426', borderColor: '#1E2D4A', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-2 font-mono">
            {(data?.severity_distribution || []).map((s: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300">{s.name}:</span>
                <span className="font-bold text-white ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: IOC Types & Intelligence Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Contribution */}
        <div className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Intelligence Sources Contribution</h3>
            <p className="text-xs text-slate-400">Volume of threat records provided per feed</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.source_distribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1426', borderColor: '#1E2D4A', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#00d2ff" radius={[0, 4, 4, 0]} name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top MITRE Techniques */}
        <div className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Top Associated ATT&CK Techniques</h3>
              <p className="text-xs text-slate-400">Tactics observed across correlated attack chains</p>
            </div>
            <button
              onClick={() => navigate('/vulnerabilities')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Explore MITRE</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {(data?.top_techniques || []).map((t: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {t.technique_id}
                  </span>
                  <span className="text-xs text-slate-200 font-medium">
                    {t.technique_id === 'T1071' ? 'Application Layer Protocol' :
                     t.technique_id === 'T1190' ? 'Exploit Public-Facing Application' :
                     t.technique_id === 'T1059' ? 'Command and Scripting Interpreter' :
                     t.technique_id === 'T1566' ? 'Phishing' :
                     t.technique_id === 'T1055' ? 'Process Injection' : 'Defense Evasion'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">{t.count} indicators</span>
                  <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, t.count * 20)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Prioritized Alerts Table */}
      <div className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Recent Correlated Security Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">Click any alert to launch its complete explainable evidence chain investigation</p>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>VIEW ALL ALERTS</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Alert Title</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Indicators</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.recent_alerts || []).map((alert: any) => (
                <tr key={alert.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : alert.severity === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    {alert.title}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                    {alert.risk_score} / 100
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">
                    {alert.affected_count} connected
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/investigation/${alert.id}`)}
                      className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 transition inline-flex items-center gap-1"
                    >
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

