import React, { useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, AlertTriangle, FileText, Upload, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const SAMPLE_ADVISORY = `THREAT ADVISORY: Targeted Intrusion Campaign Exploiting Public-Facing Enterprise Software
Classification: TLP:AMBER

Incident Responders have investigated a multi-phase cyber attack attributed to threat actor APT29 (Midnight Blizzard).
Initial reconnaissance and probing originated from source IP 194.26.29.112 actively exploiting CVE-2023-4966 affecting Citrix NetScaler gateways using technique T1190.
Simultaneously, unauthenticated SQL injection attacks against MOVEit Transfer servers (CVE-2023-34362) resulted in the deployment of the LEMURLOOT webshell (SHA256: fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9).

The adversaries directed victims to spoofed Microsoft OAuth credential harvesting portals hosted at update-microsoft-auth.com and https://update-microsoft-auth.com/oauth2/v2.0/authorize, bypassing multi-factor authentication checks (T1078, T1566).
Second-stage command and control was established via Cobalt Strike 4.9 beacon communicating with IP 185.220.101.5 on port 8443 (T1071).
The beacon DLL payload (SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855) was injected into svchost.exe (T1055).
Credential extraction was performed using a customized Mimikatz utility (SHA256: 2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae) invoking sekurlsa (T1003).
Finally, confidential data was exfiltrated to https://telemetry-sync-service.info/upload/exfil.tar.gz via IP 45.154.255.89 (T1041), while LockBit 3.0 ransomware (SHA256: 7b52009b64fd0a2a49e6d8a939753077792b0554cac5245bb5640f8b09c6ac56) was staged for destructive impact (T1486).`;

export const AIThreatAnalysis: React.FC = () => {
  const [reportText, setReportText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!reportText.trim()) return;
    setAnalyzing(true);
    setApprovalMessage(null);
    try {
      const res = await api.post('/ai/extract', { text: reportText });
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleToggleApprove = (idx: number) => {
    if (!results) return;
    const updated = [...results.entities];
    updated[idx].approved = !updated[idx].approved;
    setResults({ ...results, entities: updated });
  };

  const handleApproveAll = async () => {
    if (!results) return;
    setApproving(true);
    try {
      const res = await api.post('/ai/approve', {
        entities: results.entities,
        source_name: 'AI Unstructured Threat Analysis',
      });
      setApprovalMessage(
        `Successfully ingested ${res.data.valid_records} indicators into the unified repository (${res.data.duplicates_merged} merged duplicates).`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  const loadSample = () => {
    setReportText(SAMPLE_ADVISORY);
    setResults(null);
    setApprovalMessage(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            AI-Powered Threat Extraction & Entity Disambiguation
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
              NLP // REGEX // SPACY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Extract structured IOCs, CVEs, malware families, threat actors, and MITRE techniques from raw text reports
          </p>
        </div>
        <button
          onClick={loadSample}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-400 flex items-center gap-2 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Load Sample Incident Advisory</span>
        </button>
      </div>

      {/* Input Textarea & Trigger */}
      <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-300 uppercase font-semibold">
            Raw Threat Report / Incident Text
          </label>
          <span className="text-[11px] font-mono text-slate-500">
            {reportText.length} Characters
          </span>
        </div>

        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          rows={8}
          placeholder="Paste threat intelligence PDF text, OSINT advisory, malware writeup, or incident summary here..."
          className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition leading-relaxed"
        />

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!reportText.trim() || analyzing}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center gap-2 disabled:opacity-40 shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? 'Extracting Entities with AI...' : 'Extract & Analyze Threat Entities'}</span>
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400">TOTAL EXTRACTED</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{results.entities.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <div className="text-[10px] font-mono text-purple-400">THREAT ACTORS</div>
              <div className="text-base font-bold text-purple-300 mt-1">
                {results.detected_threat_actors.join(', ') || 'None identified'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
              <div className="text-[10px] font-mono text-red-400">MALWARE FAMILIES</div>
              <div className="text-base font-bold text-red-300 mt-1">
                {results.detected_malware.join(', ') || 'None identified'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="text-[10px] font-mono text-emerald-400">ATT&CK TECHNIQUES</div>
              <div className="text-base font-bold text-emerald-300 mt-1 font-mono">
                {results.mitre_matches.length} Mappings
              </div>
            </div>
          </div>

          {/* Extracted Entities Approval Table */}
          <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Extracted Indicators & Entity Approvals</h3>
                <p className="text-xs text-slate-400">
                  Review extracted entities, toggle approvals, and commit verified items into the correlation repository
                </p>
              </div>
              <button
                onClick={handleApproveAll}
                disabled={approving}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{approving ? 'Ingesting...' : 'Approve & Save Approved Entities'}</span>
              </button>
            </div>

            {approvalMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{approvalMessage}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] bg-slate-950/40">
                    <th className="py-2.5 px-3">Approve</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                    <th className="py-2.5 px-3">Extracted Value</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Extracted Context Snippet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {results.entities.map((ent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={ent.approved}
                          onChange={() => handleToggleApprove(idx)}
                          className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                          {ent.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                        {ent.value}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        {ent.confidence}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] max-w-md truncate">
                        {ent.context}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

