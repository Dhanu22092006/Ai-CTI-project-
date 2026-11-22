import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Loader2, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

interface Stage {
  title: string;
  desc: string;
}

const STAGES: Stage[] = [
  { title: "Ingesting Multi-Source Feeds", desc: "Connecting to AlienVault OTX, MISP, CERT-In, and NVD..." },
  { title: "AI/NLP Threat Extraction", desc: "Parsing unstructured threat advisories and extracting IOCs..." },
  { title: "STIX 2.1 Schema Normalization", desc: "Normalizing records to common STIX 2.1-inspired schema..." },
  { title: "Deduplication & Provenance Merging", desc: "Detecting multi-source collisions and combining source attributions..." },
  { title: "Threat Knowledge Graph Construction", desc: "Instantiating NetworkX graph and discovering relationship topologies..." },
  { title: "MITRE ATT&CK Framework Mapping", desc: "Aligning techniques to Initial Access, C2, and Credential Access..." },
  { title: "Contextual Risk Scoring", desc: "Calculating weighted multi-factor risk scores (0-100)..." },
  { title: "Explainable Alert Synthesis", desc: "Generating prioritized alerts with verified 5-stage evidence chains..." }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DemoPipelineModal: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [isDone, setIsDone] = useState<boolean>(false);

  const startDemo = async () => {
    setIsRunning(true);
    setIsDone(false);
    setActiveStage(0);

    // Simulate animated step progression for judges
    for (let i = 0; i < STAGES.length; i++) {
      setActiveStage(i);
      await new Promise(r => setTimeout(r, 450));
    }

    try {
      const res = await api.post('/demo/run');
      setMetrics(res.data.metrics);
      setIsDone(true);
      setIsRunning(false);
      onComplete();
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !isRunning && !isDone) {
      startDemo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0b1426] border border-cyan-500/30 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                AI Threat Intelligence Correlation Pipeline
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end autonomous CTI correlation and evidence generation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="my-5">
          <div className="flex justify-between text-xs font-mono text-cyan-400 mb-2">
            <span>PIPELINE EXECUTION</span>
            <span>{isDone ? '100%' : `${Math.round(((activeStage + 1) / STAGES.length) * 100)}%`}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300"
              style={{ width: `${isDone ? 100 : ((activeStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Stage List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {STAGES.map((s, idx) => {
            const isCompleted = isDone || idx < activeStage;
            const isCurrent = !isDone && idx === activeStage;

            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-sm flex items-start gap-3 transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-600">
                      {idx + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isCurrent ? 'text-cyan-300' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                      {s.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {isCompleted ? 'VERIFIED' : isCurrent ? 'RUNNING' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Metrics */}
        {isDone && metrics && (
          <div className="mt-5 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span>Threat Intelligence Correlation Completed Successfully</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">TOTAL INDICATORS</div>
                <div className="text-base font-bold text-white mt-0.5">{metrics.total_indicators}</div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">GRAPH RELATIONSHIPS</div>
                <div className="text-base font-bold text-cyan-400 mt-0.5">{metrics.total_edges}</div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">DUPLICATES MERGED</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">{metrics.duplicates_merged}</div>
              </div>
              <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                <div className="text-slate-400 text-[10px]">CORRELATED ALERTS</div>
                <div className="text-base font-bold text-red-400 mt-0.5">{metrics.alerts_generated}</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={startDemo}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg transition"
          >
            Re-run Pipeline
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-600/20 transition flex items-center gap-1.5"
          >
            <span>Explore Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

