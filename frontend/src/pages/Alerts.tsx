import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, ShieldAlert, ArrowRight, ExternalLink, Filter, Search, CheckCircle2, AlertOctagon } from 'lucide-react';
import api from '../services/api';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alerts', {
        params: {
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      await api.patch(`/alerts/${alertId}`, { status: newStatus });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Prioritized Security Alerts & Incident Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlated multi-stage alerts generated with contextual risk scores and explainable evidence chains
          </p>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <BellRing className="w-4 h-4" />
          <span>{alerts.length} Incidents in Queue</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL SEVERITIES</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="New">NEW</option>
            <option value="Investigating">INVESTIGATING</option>
            <option value="Confirmed">CONFIRMED</option>
            <option value="False Positive">FALSE POSITIVE</option>
            <option value="Resolved">RESOLVED</option>
          </select>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
        >
          Refresh Queue
        </button>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-6 rounded-xl border backdrop-blur-md transition-all ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-950/15 border-red-500/40 hover:border-red-500/70'
                : 'bg-[#111C30]/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {alert.id.slice(0, 8)}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    • Detected {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {alert.title}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Contextual Risk</div>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {alert.risk_score} <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>

                {/* Workflow Status Dropdown */}
                <select
                  value={alert.status}
                  onChange={(e) => handleStatusChange(alert.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs font-mono rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="New">Status: New</option>
                  <option value="Investigating">Status: Investigating</option>
                  <option value="Confirmed">Status: Confirmed</option>
                  <option value="False Positive">Status: False Positive</option>
                  <option value="Resolved">Status: Resolved</option>
                </select>

                <button
                  onClick={() => navigate(`/investigation/${alert.id}`)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 shrink-0"
                >
                  <span>Investigate Evidence Chain</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              {alert.description}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">AFFECTED INDICATORS:</span>
                <div className="flex flex-wrap gap-1">
                  {(alert.affected_indicators || []).slice(0, 4).map((ioc: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800 text-[10px]">
                      {ioc}
                    </span>
                  ))}
                  {(alert.affected_indicators || []).length > 4 && (
                    <span className="text-slate-500 text-[10px]">
                      +{(alert.affected_indicators || []).length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">TECHNIQUES:</span>
                {(alert.mitre_techniques || []).map((t: string, idx: number) => (
                  <span key={idx} className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

