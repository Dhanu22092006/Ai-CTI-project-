import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Shield, CheckCircle2, ArrowDownToLine, Calendar, FileBarChart } from 'lucide-react';
import api from '../services/api';

export const Reports: React.FC = () => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get('/reports/summary');
        setReport(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleDownloadCSV = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Cyber Threat Intelligence Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Export executive assessment briefings, compliance records, and CSV indicator dumps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-400 flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Telemetry</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 transition shadow-md shadow-cyan-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Executive PDF</span>
          </button>
        </div>
      </div>

      {/* Styled Printable Report View */}
      <div className="p-8 rounded-2xl bg-[#0c1527] border border-slate-800 shadow-2xl space-y-8 max-w-4xl mx-auto print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6 print:border-black">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold mb-1">
              <Shield className="w-4 h-4" />
              <span>AI-POWERED CYBER THREAT INTELLIGENCE CORRELATION PLATFORM</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight print:text-black">
              {report?.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Generated: {report?.generated_at} • Classification: {report?.classification}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg shrink-0">
            OFFICIAL SOC REPORT
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase font-semibold mb-3">
            I. Key Intelligence Metrics
          </h3>
          <div className="grid grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-black print:bg-slate-100">
              <div className="text-[10px] text-slate-400">TOTAL INDICATORS</div>
              <div className="text-xl font-bold text-white mt-1 print:text-black">{report?.metrics?.total_indicators}</div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-black print:bg-slate-100">
              <div className="text-[10px] text-red-400">CRITICAL THREATS</div>
              <div className="text-xl font-bold text-red-400 mt-1">{report?.metrics?.critical_indicators}</div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-black print:bg-slate-100">
              <div className="text-[10px] text-cyan-400">CORRELATED ALERTS</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{report?.metrics?.active_alerts}</div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 print:border-black print:bg-slate-100">
              <div className="text-[10px] text-teal-400">DUPLICATES MERGED</div>
              <div className="text-xl font-bold text-teal-400 mt-1">{report?.metrics?.duplicates_prevented}</div>
            </div>
          </div>
        </div>

        {/* Correlated Incidents Summary */}
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase font-semibold mb-3">
            II. Prioritized Correlated Incidents
          </h3>
          <div className="space-y-3">
            {(report?.correlated_alerts || []).map((alt: any) => (
              <div key={alt.id} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 print:border-black print:bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs print:text-black">{alt.title}</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                    Risk: {alt.risk_score}/100
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                  <span>Evidence Steps: {alt.evidence_chain_count}</span>
                  <span>• Status: {alt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Critical Threat Indicators */}
        <div>
          <h3 className="text-xs font-mono text-slate-400 uppercase font-semibold mb-3">
            III. Critical Threat Indicators In Focus
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2">Type</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(report?.top_critical_threats || []).map((ioc: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 text-cyan-400 font-bold uppercase">{ioc.type}</td>
                    <td className="py-2 text-slate-200 print:text-black">{ioc.value}</td>
                    <td className="py-2 text-slate-400">{ioc.category}</td>
                    <td className="py-2 text-right text-red-400 font-bold">{ioc.risk_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Defense Recommendations */}
        <div className="pt-4 border-t border-slate-800 print:border-black">
          <h3 className="text-xs font-mono text-slate-400 uppercase font-semibold mb-3">
            IV. Strategic Mitigation Recommendations
          </h3>
          <div className="space-y-2 text-xs">
            {(report?.strategic_recommendations || []).map((rec: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-slate-300 print:text-black">
                <span className="text-cyan-400 font-bold font-mono">0{idx + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

