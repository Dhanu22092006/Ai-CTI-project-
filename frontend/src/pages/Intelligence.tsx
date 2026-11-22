import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, ArrowUpDown, ExternalLink, X, Tag, Calendar, Database, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const Intelligence: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedIoc, setSelectedIoc] = useState<any | null>(null);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const res = await api.get('/intelligence', {
        params: {
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          search: search || undefined,
        },
      });
      setIndicators(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [typeFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIndicators();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Normalized Threat Intelligence Repository
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deduplicated STIX 2.1-compliant threat indicators with multi-source attribution
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg">
          <Database className="w-4 h-4" />
          <span>{indicators.length} Active Indicators</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search indicator value, campaign, or tag..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">ALL TYPES</option>
            <option value="IP">IP ADDRESS</option>
            <option value="DOMAIN">DOMAIN</option>
            <option value="URL">URL</option>
            <option value="SHA256">SHA256 HASH</option>
            <option value="MD5">MD5 HASH</option>
            <option value="CVE">CVE VULN</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">ALL SEVERITY</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <button
            onClick={fetchIndicators}
            className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Indicators Table */}
      <div className="rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] bg-slate-950/40">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Indicator Value</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Sources / Attribution</th>
                <th className="py-3 px-4">Associated CVEs</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    Loading normalized indicators...
                  </td>
                </tr>
              ) : indicators.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No threat indicators match your filter criteria.
                  </td>
                </tr>
              ) : (
                indicators.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                        {ioc.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-200 max-w-xs truncate">
                      {ioc.value}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          ioc.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : ioc.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {ioc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      {ioc.risk_score}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {ioc.confidence}%
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(ioc.sources || []).map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-cyan-300 border border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                        {ioc.duplicate_count > 1 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                            +{ioc.duplicate_count - 1} merged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(ioc.cve_references || []).length > 0 ? (
                          (ioc.cve_references || []).map((cve: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            >
                              {cve}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-600 font-mono text-[10px]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedIoc(ioc)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicator Detail Drawer */}
      {selectedIoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg h-full bg-[#0b1426] border-l border-slate-800 p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
                    {selectedIoc.type}
                  </span>
                  <h3 className="text-base font-bold text-white font-mono truncate max-w-xs">
                    {selectedIoc.value}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIoc(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Severity & Risk Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CONTEXTUAL RISK SCORE</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">{selectedIoc.risk_score} / 100</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">SEVERITY LEVEL</div>
                  <div className="text-xl font-bold text-red-400 mt-1 font-mono">{selectedIoc.severity}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Intelligence Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                  {selectedIoc.description || 'No specific telemetry description provided.'}
                </p>
              </div>

              {/* Multi-Source Provenance & Deduplication */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-2 flex items-center justify-between">
                  <span>Source Attribution & Provenance</span>
                  <span className="text-teal-400 font-bold">{selectedIoc.duplicate_count} Instances Combined</span>
                </h4>
                <div className="space-y-1.5">
                  {(selectedIoc.sources || []).map((src: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{src}</span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associated Tags */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">Campaign & Context Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedIoc.tags || []).map((tag: string, idx: number) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* MITRE ATT&CK */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">Mapped MITRE Techniques</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedIoc.mitre_techniques || []).map((tech: string, idx: number) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedIoc(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

