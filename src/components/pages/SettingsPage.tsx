import React, { useState } from 'react';
import {
  Settings,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { AnalysisResult, ThresholdConfig } from '../../types/fraud';

interface SettingsPageProps {
  config: ThresholdConfig;
  onUpdateConfig: (newConfig: ThresholdConfig) => Promise<void>;
  recentTransactions: AnalysisResult[];
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  config,
  onUpdateConfig,
  recentTransactions,
}) => {
  const [alpha, setAlpha] = useState<number>(config.alpha);
  const [b1, setB1] = useState<number>(config.b1);
  const [b2, setB2] = useState<number>(config.b2);
  const [tauLow, setTauLow] = useState<number>(config.tauLow);
  const [tauMid, setTauMid] = useState<number>(config.tauMid);
  const [tauHigh, setTauHigh] = useState<number>(config.tauHigh);
  const [fixedBaseline, setFixedBaseline] = useState<number>(config.fixedBaseline);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate curve data for chart: B in [0, 1] -> tau(B)
  const curveData = [];
  for (let b = 0; b <= 1.0; b += 0.02) {
    const bVal = parseFloat(b.toFixed(2));
    let tau = tauMid;
    if (bVal <= b1) tau = tauHigh;
    else if (bVal > b2) tau = tauLow;

    curveData.push({
      b: bVal,
      tauAdaptive: tau,
      tauFixed: fixedBaseline,
    });
  }

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await onUpdateConfig({
        alpha,
        b1,
        b2,
        tauLow,
        tauMid,
        tauHigh,
        fixedBaseline,
      });
      setStatusMessage('Adaptive threshold configuration successfully saved to ML backend.');
    } catch (err: any) {
      setStatusMessage(`Failed to update parameters: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setAlpha(0.65);
    setB1(0.35);
    setB2(0.70);
    setTauLow(0.25);
    setTauMid(0.45);
    setTauHigh(0.65);
    setFixedBaseline(0.50);
  };

  // Sensitivity simulation over recent transactions
  const simResults = recentTransactions.map((item) => {
    const b = item.behavioralRiskScore;
    let tau = tauMid;
    if (b <= b1) tau = tauHigh;
    else if (b > b2) tau = tauLow;

    const S = alpha * item.modelProbabilities.ensemble + (1 - alpha) * b;
    const isAlert = S > tau;
    const isFixed = item.modelProbabilities.ensemble > fixedBaseline;

    return {
      id: item.transaction.id,
      b,
      S,
      tau,
      isAlert,
      isFixed,
      difference: isAlert !== isFixed,
    };
  });

  const savedFrictions = simResults.filter((s) => s.isFixed && !s.isAlert).length;
  const caughtStealths = simResults.filter((s) => !s.isFixed && s.isAlert).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>Settings: Adaptive Threshold Optimization</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calibrate fusion weight α, risk band breakpoints (b1, b2), and risk-dependent decision thresholds τ(B).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg bg-slate-900 border border-indigo-500/40 text-xs text-indigo-300">
          {statusMessage}
        </div>
      )}

      {/* Adaptive Decision Curve Chart */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Step-Down Threshold Function: τ(B) vs Rigid Baseline</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              High behavioral risk (B &gt; {b2}) lowers threshold to τ={tauLow} to catch low-value anomalies; trusted customers (B ≤ {b1}) raise threshold to τ={tauHigh} to prevent friction.
            </p>
          </div>
          <div className="text-xs font-mono text-indigo-300">
            S(x_t) = {alpha.toFixed(2)} · P_ens + {(1 - alpha).toFixed(2)} · B(x_t)
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curveData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="b"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                label={{ value: 'Behavioral Risk Score B(x_t)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={[0.1, 0.8]}
                label={{ value: 'Decision Threshold τ', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <ReferenceLine y={fixedBaseline} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Fixed Baseline (0.50)', fill: '#94a3b8', fontSize: 10 }} />
              <Line
                type="stepAfter"
                dataKey="tauAdaptive"
                name="Adaptive Threshold τ(B)"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parameter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fusion Weight alpha */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Score Fusion Weight (α)</span>
            <span className="font-mono font-bold text-indigo-400">{alpha.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            S = {alpha.toFixed(2)}·P_ens + {(1 - alpha).toFixed(2)}·B(x_t). Balances raw classifier ensemble vs behavioral deviation.
          </div>
        </div>

        {/* Breakpoint b1 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Low/Medium Breakpoint (b1)</span>
            <span className="font-mono font-bold text-emerald-400">{b1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.50"
            step="0.05"
            value={b1}
            onChange={(e) => setB1(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            Scores B ≤ {b1} classified as Low Behavioral Risk.
          </div>
        </div>

        {/* Breakpoint b2 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Medium/High Breakpoint (b2)</span>
            <span className="font-mono font-bold text-rose-400">{b2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.55"
            max="0.85"
            step="0.05"
            value={b2}
            onChange={(e) => setB2(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            Scores B &gt; {b2} classified as High Behavioral Risk.
          </div>
        </div>

        {/* tauHigh */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Threshold for Low Risk (τ_high)</span>
            <span className="font-mono font-bold text-indigo-400">{tauHigh.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.85"
            step="0.05"
            value={tauHigh}
            onChange={(e) => setTauHigh(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            High threshold applied to trusted customers to minimize false alarms.
          </div>
        </div>

        {/* tauMid */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Threshold for Med Risk (τ_mid)</span>
            <span className="font-mono font-bold text-amber-400">{tauMid.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.60"
            step="0.05"
            value={tauMid}
            onChange={(e) => setTauMid(parseFloat(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            Moderate threshold applied to intermediate or cold-start transactions.
          </div>
        </div>

        {/* tauLow */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-white">Threshold for High Risk (τ_low)</span>
            <span className="font-mono font-bold text-rose-400">{tauLow.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.40"
            step="0.05"
            value={tauLow}
            onChange={(e) => setTauLow(parseFloat(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-400">
            Low threshold applied to high-deviation transactions to catch subtle fraud.
          </div>
        </div>
      </div>

      {/* Real-Time Sensitivity Impact Simulation */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Sensitivity Simulation on Evaluated Transaction Queue</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates real-world impact of the adaptive threshold against the rigid 0.50 fixed baseline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-1">
            <div className="font-bold text-emerald-400 text-sm">
              {savedFrictions} False Alarms Prevented
            </div>
            <p className="text-slate-300 text-[11px]">
              Transactions with P_ens &gt; 0.50 where trusted customer baseline raised τ to {tauHigh}, preventing unnecessary user verification.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
            <div className="font-bold text-rose-400 text-sm">
              {caughtStealths} Stealth Frauds Intercepted
            </div>
            <p className="text-slate-300 text-[11px]">
              Transactions with P_ens &lt; 0.50 where high behavioral deviation dropped τ to {tauLow}, successfully detecting anomalous activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
