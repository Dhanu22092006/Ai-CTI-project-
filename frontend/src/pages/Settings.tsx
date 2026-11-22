import React, { useState } from 'react';
import { Sliders, Key, Shield, Database, CheckCircle2, Save, Terminal, Server } from 'lucide-react';

export const Settings: React.FC = () => {
  const [nvdKey, setNvdKey] = useState('');
  const [otxKey, setOtxKey] = useState('');
  const [mispUrl, setMispUrl] = useState('https://misp.cyberdefense.org');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Platform Configuration & System Integration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage threat feed API keys, data persistence connectors, and SOC platform parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>Threat Intelligence API Credentials</span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure external API keys. (If keys are not provided, the platform automatically utilizes high-fidelity synthetic fallbacks).
          </p>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5 uppercase">
                NIST National Vulnerability Database (NVD) API Key
              </label>
              <input
                type="password"
                value={nvdKey}
                onChange={(e) => setNvdKey(e.target.value)}
                placeholder="Optional: nvd-api-key-xxxxxxxx"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 uppercase">
                AlienVault OTX API Token
              </label>
              <input
                type="password"
                value={otxKey}
                onChange={(e) => setOtxKey(e.target.value)}
                placeholder="Optional: otx-user-token-xxxxxxxx"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 uppercase">
                MISP Base URL Endpoint
              </label>
              <input
                type="text"
                value={mispUrl}
                onChange={(e) => setMispUrl(e.target.value)}
                placeholder="https://misp.instance.local"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {saved && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>API integration settings saved successfully.</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Integrations</span>
            </button>
          </form>
        </div>

        {/* System Architecture Status */}
        <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Active Architecture Status</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">SQL Relational Store</div>
                <div className="text-[10px] text-slate-400">SQLite / PostgreSQL DB</div>
              </div>
              <span className="text-emerald-400 font-bold">ONLINE</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Graph Correlation Engine</div>
                <div className="text-[10px] text-slate-400">NetworkX In-Memory MultiDiGraph</div>
              </div>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">Schema Standard</div>
                <div className="text-[10px] text-slate-400">OASIS STIX 2.1 Specification</div>
              </div>
              <span className="text-cyan-400 font-bold">COMPLIANT</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-200 font-bold">AI/NLP Engine</div>
                <div className="text-[10px] text-slate-400">RegEx + spaCy NER Parser</div>
              </div>
              <span className="text-purple-400 font-bold">READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

