import React, { useState, useEffect } from 'react';
import { MessageSquareShare, Sliders, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Save } from 'lucide-react';
import api from '../services/api';

export const AnalystFeedback: React.FC = () => {
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Sliders state
  const [weights, setWeights] = useState({
    severity_weight: 0.30,
    confidence_weight: 0.25,
    source_reliability_weight: 0.15,
    vuln_impact_weight: 0.15,
    correlation_strength_weight: 0.15,
  });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback/summary');
      setSummary(res.data);
      if (res.data.scoring_config) {
        setWeights(res.data.scoring_config);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const totalSum = Number(
    (
      weights.severity_weight +
      weights.confidence_weight +
      weights.source_reliability_weight +
      weights.vuln_impact_weight +
      weights.correlation_strength_weight
    ).toFixed(2)
  );

  const handleSaveWeights = async () => {
    setSaveStatus(null);
    if (totalSum !== 1.0) {
      setSaveStatus('Error: The sum of all weights must equal exactly 1.00');
      return;
    }
    try {
      await api.post('/feedback/config', weights);
      setSaveStatus('Scoring weights updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(err.response?.data?.detail || 'Failed to update weights');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Analyst Feedback Loop & Model Calibration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent feedback mechanism tuning the contextual risk scoring weights based on analyst verdicts
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 hover:bg-slate-800 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C30]/80 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400">TOTAL VERDICTS</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            {summary?.metrics?.total_feedbacks || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-[10px] font-mono text-emerald-400">TRUE POSITIVES</div>
          <div className="text-2xl font-bold text-emerald-300 mt-1 font-mono">
            {summary?.metrics?.true_positives || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30">
          <div className="text-[10px] font-mono text-red-400">FALSE POSITIVES</div>
          <div className="text-2xl font-bold text-red-300 mt-1 font-mono">
            {summary?.metrics?.false_positives || 0}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
          <div className="text-[10px] font-mono text-cyan-400">PRECISION ACCURACY</div>
          <div className="text-2xl font-bold text-cyan-300 mt-1 font-mono">
            {summary?.metrics?.accuracy_ratio || 100}%
          </div>
        </div>
      </div>

      {/* Calibration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Contextual Risk Weight Configuration</span>
              </h3>
              <p className="text-xs text-slate-400">Weights adjust the multi-factor mathematical scoring equation</p>
            </div>
            <span
              className={`font-mono text-xs px-2.5 py-1 rounded font-bold ${
                totalSum === 1.0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              SUM: {totalSum.toFixed(2)} / 1.00
            </span>
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SEVERITY IMPACT WEIGHT</span>
                <span className="text-cyan-400 font-bold">{weights.severity_weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.severity_weight}
                onChange={(e) => setWeights({ ...weights, severity_weight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>CONFIDENCE SCORE WEIGHT</span>
                <span className="text-cyan-400 font-bold">{weights.confidence_weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={weights.confidence_weight}
                onChange={(e) => setWeights({ ...weights, confidence_weight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SOURCE RELIABILITY WEIGHT</span>
                <span className="text-cyan-400 font-bold">{weights.source_reliability_weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.source_reliability_weight}
                onChange={(e) => setWeights({ ...weights, source_reliability_weight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>VULNERABILITY IMPACT WEIGHT</span>
                <span className="text-cyan-400 font-bold">{weights.vuln_impact_weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.vuln_impact_weight}
                onChange={(e) => setWeights({ ...weights, vuln_impact_weight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>GRAPH CORRELATION STRENGTH</span>
                <span className="text-cyan-400 font-bold">{weights.correlation_strength_weight.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.correlation_strength_weight}
                onChange={(e) => setWeights({ ...weights, correlation_strength_weight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {saveStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-mono ${
                saveStatus.startsWith('Error')
                  ? 'bg-red-950/40 border border-red-500/40 text-red-300'
                  : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              {saveStatus}
            </div>
          )}

          <button
            onClick={handleSaveWeights}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Apply Tuned Scoring Model</span>
          </button>
        </div>

        {/* Recent Feedback Submissions */}
        <div className="p-6 rounded-xl bg-[#111C30]/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white">Analyst Audit Submissions</h3>
          <p className="text-xs text-slate-400">Verdicts recorded during incident investigation workflows:</p>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {(summary?.recent_feedback || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No analyst feedback submissions recorded yet.
              </div>
            ) : (
              (summary?.recent_feedback || []).map((fb: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{fb.user_name}</span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.2 rounded font-bold ${
                        fb.verdict === 'True Positive'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : fb.verdict === 'False Positive'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {fb.verdict}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{fb.notes || 'No analyst commentary provided.'}</p>
                  <div className="text-[10px] font-mono text-slate-600">
                    {new Date(fb.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

