import React, { useState, useEffect } from 'react';
import { ShieldAlert, Crosshair, ExternalLink, Search, Filter, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import api from '../services/api';

export const Vulnerabilities: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cves' | 'mitre'>('cves');
  const [vulns, setVulns] = useState<any[]>([]);
  const [tactics, setTactics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cveRes, mitreRes] = await Promise.all([
          api.get('/vulnerabilities'),
          api.get('/mitre/tactics'),
        ]);
        setVulns(cveRes.data);
        setTactics(mitreRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredVulns = vulns.filter((v) => {
    const matchSearch =
      v.cve_id.toLowerCase().includes(search.toLowerCase()) ||
      (v.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.affected_products || '').toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === 'ALL' || v.severity === severityFilter;
    return matchSearch && matchSev;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Vulnerability Intelligence & MITRE ATT&CK
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            National Vulnerability Database (NVD) mappings correlated against enterprise attack tactics
          </p>
        </div>

        <div className="flex border border-slate-700 rounded-lg p-0.5 bg-slate-900 text-xs font-mono">
          <button
            onClick={() => setActiveTab('cves')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'cves' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400'
            }`}
          >
            CVE REPOSITORY
          </button>
          <button
            onClick={() => setActiveTab('mitre')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'mitre' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-slate-400'
            }`}
          >
            ATT&CK MATRIX
          </button>
        </div>
      </div>

      {activeTab === 'cves' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CVE ID, vendor, or software..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">ALL SEVERITY</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>

          {/* CVE Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVulns.map((cve) => (
              <div
                key={cve.id}
                className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-white">{cve.cve_id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          cve.severity === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {cve.severity}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">
                      CVSS v3.1: <strong className="text-white">{cve.cvss_score} / 10.0</strong>
                    </div>
                  </div>
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${cve.cve_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                    title="View on NIST NVD"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {cve.description}
                </p>

                <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-mono text-[10px] block mb-0.5">AFFECTED PRODUCTS</span>
                  <span className="text-slate-200 font-mono">{cve.affected_products || 'General software'}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px]">TECHNIQUES:</span>
                    {(cve.related_techniques || []).map((t: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-500 text-[10px]">NVD VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ATT&CK Matrix Tactic Explorer */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tactics.map((tac, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase">{tac.tactic}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {tac.count} Techniques
                </span>
              </div>
              <div className="space-y-2">
                {tac.techniques.map((tech: any, tIdx: number) => (
                  <div key={tIdx} className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono font-bold text-white mb-1">
                      <span>{tech.technique_id}</span>
                      <span className="text-slate-300 font-sans font-medium text-[11px]">{tech.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

