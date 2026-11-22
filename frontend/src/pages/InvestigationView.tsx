import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, ArrowLeft, CheckCircle2, AlertTriangle, Network,
  ExternalLink, Layers, Crosshair, ShieldCheck, ThumbsUp, ThumbsDown, HelpCircle, Send
} from 'lucide-react';
import api from '../services/api';

export const InvestigationView: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await api.get(`/alerts/${alertId}`);
        setAlert(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (alertId) fetchAlert();
  }, [alertId]);

  const handleFeedbackSubmit = async () => {
    if (!verdict || !alertId) return;
    try {
      await api.post(`/alerts/${alertId}/feedback`, {
        verdict: verdict,
        notes: feedbackNotes,
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Alert not found or was deleted.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={() => navigate('/alerts')}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO INCIDENT QUEUE</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold uppercase">
            {alert.severity} SEVERITY
          </span>
          <button
            onClick={() => navigate('/attack-graph')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs text-cyan-400 font-medium flex items-center gap-1.5 transition"
          >
            <Network className="w-3.5 h-3.5" />
            <span>View Full Graph Topology</span>
          </button>
        </div>
      </div>

      {/* Incident Header Overview */}
      <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 font-semibold mb-1">
              INCIDENT INVESTIGATION // EXPLAINABLE ATTACK CHAIN
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {alert.title}
            </h1>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-right shrink-0">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Contextual Risk Score</div>
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {alert.risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {alert.description}
        </p>

        {/* Contributing Intel Sources */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Aggregated Sources:</span>
          {(alert.intelligence_sources || []).map((src: string, idx: number) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700"
            >
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN USP: 5-Step Explainable Evidence Chain */}
      <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Correlated Evidence Chain (Step-by-Step Chronology)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evidence demonstrating why the AI engine connected these indicators into a unified attack cluster
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {(alert.evidence_chain || []).length} Correlated Steps
          </span>
        </div>

        {/* Chronological Steps */}
        <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {(alert.evidence_chain || []).map((step: any, idx: number) => (
            <div key={idx} className="relative pl-10">
              {/* Step Circle */}
              <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center font-mono text-xs font-bold text-cyan-400 shadow-lg shadow-cyan-500/20">
                {step.step || idx + 1}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      {step.stage}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
                      {step.indicator}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Confidence: {step.confidence}% • Source: {step.source}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {step.finding}
                </p>

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">ATT&CK Technique:</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {step.technique}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Defensive Actions & Mitigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recommended Defensive Investigation Steps</span>
          </h3>
          <p className="text-xs text-slate-400">
            Actionable playbooks tailored to this correlated threat pattern:
          </p>
          <ul className="space-y-2 text-xs">
            {(alert.recommended_actions || []).map((action: string, idx: number) => (
              <li key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-slate-200">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Analyst Feedback Loop Component */}
        <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-purple-400" />
            <span>Analyst Incident Feedback & Calibration</span>
          </h3>
          <p className="text-xs text-slate-400">
            Submit your triage verdict to refine scoring weights and prevent alert fatigue:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setVerdict('True Positive')}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${verdict === 'True Positive'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
            >
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
              <span>True Positive</span>
            </button>
            <button
              onClick={() => setVerdict('False Positive')}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${verdict === 'False Positive'
                ? 'bg-red-500/20 border-red-500 text-red-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
            >
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span>False Positive</span>
            </button>
            <button
              onClick={() => setVerdict('Needs Further Investigation')}
              className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${verdict === 'Needs Further Investigation'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Investigating</span>
            </button>
          </div>

          <textarea
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            rows={3}
            placeholder="Add analyst investigation notes or calibration reasoning..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={handleFeedbackSubmit}
            disabled={!verdict || feedbackSubmitted}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{feedbackSubmitted ? 'Feedback Recorded in Audit Log' : 'Commit Analyst Verdict'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

