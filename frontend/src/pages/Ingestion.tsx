import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Send, Database, Shield, History, Globe } from 'lucide-react';
import api from '../services/api';

export const Ingestion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual' | 'apis' | 'history'>('upload');
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState('External File Ingestion');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Manual input state
  const [iocType, setIocType] = useState('ip');
  const [iocValue, setIocValue] = useState('');
  const [category, setCategory] = useState('Command and Control');
  const [severity, setSeverity] = useState('HIGH');
  const [description, setDescription] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);

  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/ingestion/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_name', sourceName);

    try {
      const res = await api.post('/ingestion/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadResult({ success: true, data: res.data });
      setFile(null);
    } catch (err: any) {
      setUploadResult({
        success: false,
        error: err.response?.data?.detail || 'Failed to parse and ingest file',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iocValue.trim()) return;

    setManualLoading(true);
    setManualResult(null);

    try {
      const res = await api.post('/ingestion/manual', {
        type: iocType,
        value: iocValue.trim(),
        threat_category: category,
        severity: severity,
        description: description,
        source_name: 'SOC Analyst Manual Form',
      });
      setManualResult({ success: true, data: res.data });
      setIocValue('');
      setDescription('');
    } catch (err: any) {
      setManualResult({
        success: false,
        error: err.response?.data?.detail || 'Failed to ingest indicator',
      });
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Multi-Source Data Ingestion Engine
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ingest cybersecurity threat intelligence via API feeds, structured files (STIX 2.1, CSV, JSON), or analyst manual entry
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'upload'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>FILE UPLOAD (STIX / CSV / JSON / TXT)</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'manual'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>MANUAL IOC ENTRY</span>
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'apis'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>INTEL API CONNECTORS</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 flex items-center gap-2 transition ${
            activeTab === 'history'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>INGESTION AUDIT LOGS</span>
        </button>
      </div>

      {/* TAB 1: FILE UPLOAD */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-2">Upload Threat Intelligence Bundle</h3>
            <p className="text-xs text-slate-400 mb-6">
              Supported formats: OASIS STIX 2.1 JSON, CSV feeds, JSON indicator lists, and unstructured TXT threat advisories.
            </p>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                  Feed / Source Label
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. AlienVault OTX Export, Internal Incident Report"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-8 text-center bg-slate-900/40 transition">
                <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <div className="text-xs text-slate-200 font-medium mb-1">
                  {file ? file.name : 'Select or drag & drop threat intelligence file'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mb-4">
                  .JSON, .STIX, .CSV, or .TXT (Max 15MB)
                </div>
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-400 border border-slate-700 inline-block transition">
                  Browse Files
                  <input
                    type="file"
                    accept=".json,.csv,.txt,.log"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs transition disabled:opacity-40"
              >
                {uploading ? 'Normalizing and Ingesting File...' : 'Start Normalization Pipeline'}
              </button>
            </form>

            {uploadResult && (
              <div
                className={`mt-4 p-4 rounded-lg border text-xs ${
                  uploadResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {uploadResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{uploadResult.success ? 'File Normalized Successfully' : 'Ingestion Failed'}</span>
                </div>
                <p>{uploadResult.success ? uploadResult.data.message : uploadResult.error}</p>
                {uploadResult.success && (
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-emerald-500/20 text-center font-mono text-[11px]">
                    <div>Received: {uploadResult.data.records_received}</div>
                    <div>Valid: {uploadResult.data.valid_records}</div>
                    <div>Duplicates Merged: {uploadResult.data.duplicates_merged}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
            <h4 className="text-xs font-mono text-slate-300 uppercase font-semibold">Sample Files Available</h4>
            <p className="text-xs text-slate-400">
              You can test the ingestion pipeline using the realistic sample files included in the project:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                📄 <span className="text-cyan-400">data/samples/sample_indicators.csv</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                📄 <span className="text-cyan-400">data/samples/sample_stix_bundle.json</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                📄 <span className="text-cyan-400">data/samples/sample_threat_report.txt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL ENTRY */}
      {activeTab === 'manual' && (
        <div className="max-w-2xl p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-1">Manual Indicator Registration</h3>
          <p className="text-xs text-slate-400 mb-6">
            Directly register an indicator for immediate STIX 2.1 normalization and graph correlation.
          </p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Indicator Type</label>
                <select
                  value={iocType}
                  onChange={(e) => setIocType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="ip">IPv4 Address</option>
                  <option value="domain">Domain Name</option>
                  <option value="url">URL</option>
                  <option value="sha256">SHA256 Hash</option>
                  <option value="md5">MD5 Hash</option>
                  <option value="cve">CVE Vulnerability</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Indicator Value</label>
              <input
                type="text"
                value={iocValue}
                onChange={(e) => setIocValue(e.target.value)}
                placeholder="e.g. 198.51.100.22 or evil-c2-domain.com"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Threat Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Command and Control, Phishing, Ransomware Staging"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Analyst Context / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Observed during incident triage..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={manualLoading}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              {manualLoading ? 'Saving...' : 'Register Indicator'}
            </button>
          </form>

          {manualResult && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{manualResult.data?.message || 'Indicator ingested successfully'}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: API CONNECTORS */}
      {activeTab === 'apis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'NIST NVD Vulnerability Feed',
              type: 'CVE API 2.0',
              status: 'CONNECTED (CACHED)',
              desc: 'National Vulnerability Database streaming CVE CVSS scores, affected software CPEs, and mitigation advisories.',
              reliability: '98%',
            },
            {
              name: 'AlienVault OTX (Open Threat Exchange)',
              type: 'OTX Direct API',
              status: 'SYNTHETIC FALLBACK ACTIVE',
              desc: 'Community crowd-sourced pulse feeds providing IP reputation, malware hashes, and active C2 nodes.',
              reliability: '85%',
            },
            {
              name: 'MISP Threat Sharing Architecture',
              type: 'REST / TAXII 2.1',
              status: 'CONNECTED',
              desc: 'Malware Information Sharing Platform format supporting bidirectional indicator exchange and threat events.',
              reliability: '90%',
            },
            {
              name: 'CERT-In Incident Advisory Stream',
              type: 'Advisory Connector',
              status: 'CONNECTED',
              desc: 'National critical infrastructure security advisories covering active regional campaigns.',
              reliability: '95%',
            },
          ].map((apiConn, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 font-bold">{apiConn.type}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  {apiConn.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{apiConn.name}</h4>
              <p className="text-xs text-slate-400 mb-4">{apiConn.desc}</p>
              <div className="text-[10px] font-mono text-slate-500 flex justify-between border-t border-slate-800 pt-2">
                <span>RELIABILITY SCORE</span>
                <span className="text-slate-300 font-bold">{apiConn.reliability}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS / HISTORY */}
      {activeTab === 'history' && (
        <div className="rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] bg-slate-950/40">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Received</th>
                <th className="py-3 px-4">Valid</th>
                <th className="py-3 px-4">Duplicates Merged</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-900/40 font-mono text-xs">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(h.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white font-sans">{h.source_name}</td>
                  <td className="py-3 px-4 uppercase text-slate-300">{h.import_type}</td>
                  <td className="py-3 px-4">{h.records_received}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{h.valid_records}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{h.duplicates_merged}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

