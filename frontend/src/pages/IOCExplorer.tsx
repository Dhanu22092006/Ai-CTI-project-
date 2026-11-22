import React, { useState, useEffect } from 'react';
import { Search, Shield, Database, ExternalLink, Calendar, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export const IOCExplorer: React.FC = () => {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/intelligence');
        setIndicators(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const filtered = indicators.filter((ioc) => {
    const matchSearch =
      ioc.value.toLowerCase().includes(search.toLowerCase()) ||
      (ioc.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || ioc.threat_category === categoryFilter;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(indicators.map((i) => i.threat_category).filter(Boolean)));

  return (
    <div className="p-6 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Deep-Dive IOC Explorer
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed technical telemetry, multi-feed deduplication history, and STIX 2.1 provenance
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search indicators..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg p-1.5 font-mono"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map((c: any, idx) => (
                <option key={idx} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {filtered.map((ioc) => (
              <div
                key={ioc.id}
                onClick={() => setSelected(ioc)}
                className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                  selected?.id === ioc.id
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">
                    {ioc.type}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      ioc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}
                  >
                    {ioc.severity}
                  </span>
                </div>
                <div className="font-mono font-medium text-slate-200 truncate">{ioc.value}</div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {ioc.threat_category}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-2 space-y-5">
          {selected ? (
            <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold uppercase">
                      STIX 2.1 {selected.type}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      ID: {selected.id.slice(0, 8)}...
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-mono break-all">
                    {selected.value}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">RISK SCORE</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {selected.risk_score}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* STIX Schema Attributes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CONFIDENCE</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">{selected.confidence}%</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">FIRST SEEN</div>
                  <div className="text-xs text-slate-300 font-mono mt-1">
                    {new Date(selected.first_seen).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">LAST SEEN</div>
                  <div className="text-xs text-slate-300 font-mono mt-1">
                    {new Date(selected.last_seen).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Telemetry Description</h4>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {selected.description}
                </div>
              </div>

              {/* Merged Sources & Provenance */}
              <div>
                <h4 className="text-xs font-mono text-slate-400 uppercase mb-2 flex items-center justify-between">
                  <span>Correlated Sources Attribution</span>
                  <span className="text-cyan-400 font-bold">{selected.duplicate_count} Instances Deduplicated</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(selected.sources || []).map((s: string, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-semibold">{s}</span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ATTRIBUTED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related CVEs & ATT&CK */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">Linked Vulnerabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.cve_references || []).length > 0 ? (
                      selected.cve_references.map((cve: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                          {cve}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">No direct CVE links</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase mb-2">MITRE ATT&CK Techniques</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.mitre_techniques || []).length > 0 ? (
                      selected.mitre_techniques.map((tech: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                          {tech}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">No technique mappings</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono">
              Select an indicator to inspect STIX 2.1 properties
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

