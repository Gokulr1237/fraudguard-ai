import React, { useState } from 'react';
import {
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

interface AdaptiveThresholdPageProps {
  config: ThresholdConfig;
  onUpdateConfig: (newConfig: ThresholdConfig) => Promise<void>;
  recentTransactions: AnalysisResult[];
}

export const AdaptiveThresholdPage: React.FC<AdaptiveThresholdPageProps> = ({
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
      setStatusMessage('Adaptive threshold configuration successfully saved and applied to live engine.');
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to update threshold configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to Paper Defaults
  const handleResetToPaperDefaults = () => {
    setAlpha(0.65);
    setB1(0.35);
    setB2(0.70);
    setTauLow(0.25);
    setTauMid(0.45);
    setTauHigh(0.65);
    setFixedBaseline(0.50);
  };

  // Run live simulation on sample transactions with current local slider settings
  const simulatedTxns = recentTransactions.map((item) => {
    const pEns = item.modelProbabilities.ensemble;
    const bScore = item.behavioralRiskScore;
    const fused = parseFloat((alpha * pEns + (1 - alpha) * bScore).toFixed(4));

    let tau = tauMid;
    if (bScore <= b1) tau = tauHigh;
    else if (bScore > b2) tau = tauLow;

    const isAdaptive = fused >= tau;
    const isFixed = pEns >= fixedBaseline;

    let flagDiff = 'Agreement';
    if (isAdaptive && !isFixed) flagDiff = 'Adaptive Catch (Missed by Fixed)';
    if (!isAdaptive && isFixed) flagDiff = 'False Alarm Suppressed';

    return {
      ...item,
      simFused: fused,
      simTau: tau,
      simAdaptiveAlert: isAdaptive,
      simFixedAlert: isFixed,
      flagDiff,
    };
  });

  const adaptiveAlertsCount = simulatedTxns.filter((t) => t.simAdaptiveAlert).length;
  const fixedAlertsCount = simulatedTxns.filter((t) => t.simFixedAlert).length;
  const adaptiveCatches = simulatedTxns.filter((t) => t.simAdaptiveAlert && !t.simFixedAlert).length;
  const suppressedFPs = simulatedTxns.filter((t) => !t.simAdaptiveAlert && t.simFixedAlert).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Behavioral-Risk-Dependent Adaptive Thresholds
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic thresholding mechanism τ(B) formulated to maximize recall on subtle anomalies while minimizing benign customer friction.
          </p>
        </div>

        <button
          onClick={handleResetToPaperDefaults}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Research Defaults</span>
        </button>
      </div>

      {/* Mathematical Formulation Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h2 className="text-sm font-semibold text-white">
          Formal Mathematical Specification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-indigo-400 font-bold">1. Risk Score Fusion Equation</div>
            <div className="text-white text-sm">
              S(x_t) = α · P_ens(x_t) + (1 - α) · B(x_t)
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Where <strong className="text-slate-300">P_ens</strong> is the soft-voting ensemble fraud probability, <strong className="text-slate-300">B(x_t)</strong> is the explicit standardized behavioral deviation score, and <strong className="text-slate-300">α ∈ [0, 1]</strong> controls fusion balance.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="text-indigo-400 font-bold">2. Piecewise Adaptive Threshold τ(B)</div>
            <div className="text-white text-xs space-y-0.5">
              <div>τ(B) = τ_high ({tauHigh.toFixed(2)}) &nbsp;when B ≤ b₁ ({b1.toFixed(2)})</div>
              <div>τ(B) = τ_mid &nbsp;({tauMid.toFixed(2)}) &nbsp;when b₁ &lt; B ≤ b₂ ({b2.toFixed(2)})</div>
              <div>τ(B) = τ_low &nbsp;({tauLow.toFixed(2)}) &nbsp;when B &gt; b₂ ({b2.toFixed(2)})</div>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              A higher threshold applies when behavioral risk is low (demanding stronger model evidence before triggering an alert), preventing false friction on benign cardholders.
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Step-Function Curve & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Configuration Panel */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Interactive Parameter Optimization</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Alpha */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Fusion Weight α:</span>
                <span className="font-mono text-indigo-400 font-bold">{alpha.toFixed(2)}</span>
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
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0.1 (Behavior Dominant)</span>
                <span>0.9 (Model Dominant)</span>
              </div>
            </div>

            {/* Breakpoints b1 and b2 */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Breakpoint b₁:</span>
                  <span className="font-mono text-white font-bold">{b1.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.50"
                  step="0.05"
                  value={b1}
                  onChange={(e) => setB1(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Low &rarr; Mid boundary</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Breakpoint b₂:</span>
                  <span className="font-mono text-white font-bold">{b2.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.55"
                  max="0.85"
                  step="0.05"
                  value={b2}
                  onChange={(e) => setB2(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Mid &rarr; High boundary</span>
              </div>
            </div>

            {/* Threshold Values */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">τ_high (Low Behavioral Risk):</span>
                  <span className="font-mono text-emerald-400 font-bold">{tauHigh.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.85"
                  step="0.05"
                  value={tauHigh}
                  onChange={(e) => setTauHigh(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">τ_mid (Medium Behavioral Risk):</span>
                  <span className="font-mono text-amber-400 font-bold">{tauMid.toFixed(2)}</span>
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
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">τ_low (High Behavioral Risk):</span>
                  <span className="font-mono text-rose-400 font-bold">{tauLow.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.40"
                  step="0.05"
                  value={tauLow}
                  onChange={(e) => setTauLow(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Baseline Fixed Threshold:</span>
                  <span className="font-mono text-slate-300 font-bold">{fixedBaseline.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.70"
                  step="0.05"
                  value={fixedBaseline}
                  onChange={(e) => setFixedBaseline(parseFloat(e.target.value))}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                {statusMessage}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Configuration to Engine</span>
            </button>
          </div>
        </div>

        {/* Step Curve Visualization */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Dynamic Threshold Function Curve τ(B)
            </h3>
            <p className="text-xs text-slate-400">
              Visualizes how the alert threshold decreases as customer behavioral deviation B(x_t) intensifies.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="b"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Behavioral Risk Score B(x)', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0.1, 0.9]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <ReferenceLine x={b1} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `b1=${b1}`, fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine x={b2} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `b2=${b2}`, fill: '#ef4444', fontSize: 10 }} />
                <Line
                  type="stepAfter"
                  dataKey="tauAdaptive"
                  name="Adaptive Threshold τ(B)"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="tauFixed"
                  name="Static Baseline (0.50)"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time simulation impact KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-[11px] text-slate-400">Adaptive Alerts</div>
              <div className="font-mono font-bold text-white text-lg tabular-nums">
                {adaptiveAlertsCount}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-0.5">
              <div className="text-[11px] text-slate-400">Fixed Alerts</div>
              <div className="font-mono font-bold text-slate-300 text-lg tabular-nums">
                {fixedAlertsCount}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/30 space-y-0.5">
              <div className="text-[11px] text-indigo-400">Adaptive Catches</div>
              <div className="font-mono font-bold text-indigo-400 text-lg tabular-nums">
                +{adaptiveCatches}
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 space-y-0.5">
              <div className="text-[11px] text-emerald-400">Suppressed FPs</div>
              <div className="font-mono font-bold text-emerald-400 text-lg tabular-nums">
                -{suppressedFPs}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Feed Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Comparative Decision Matrix: Fixed (0.50) vs Adaptive τ(B)
          </h3>
          <p className="text-xs text-slate-400">
            Evaluating recent transactions side-by-side using identical model predictions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Cardholder</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">B(x_t)</th>
                <th className="py-2.5 px-3 text-center">P_ens</th>
                <th className="py-2.5 px-3 text-center">Fused S(x)</th>
                <th className="py-2.5 px-3 text-center">Fixed (0.50)</th>
                <th className="py-2.5 px-3 text-center">Adaptive τ(B)</th>
                <th className="py-2.5 px-3">Empirical Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {simulatedTxns.map((item) => (
                <tr key={item.transaction.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-white">{item.transaction.merchantName}</div>
                    <div className="text-[11px] text-slate-400">{item.transaction.location}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {item.transaction.customerId}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-white tabular-nums">
                    ₹{item.transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold tabular-nums text-amber-400">
                    {item.behavioralRiskScore.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums text-indigo-300">
                    {(item.modelProbabilities.ensemble * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold tabular-nums text-white">
                    {item.simFused.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.simFixedAlert ? (
                      <span className="text-rose-400 font-semibold text-[11px]">Alert</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Legit</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.simAdaptiveAlert ? (
                      <span className="text-rose-400 font-semibold text-[11px]">Alert</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px]">Legit</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    {item.flagDiff === 'Agreement' ? (
                      <span className="text-slate-400">Decisions Agree</span>
                    ) : item.flagDiff.includes('Adaptive Catch') ? (
                      <span className="text-indigo-400 font-semibold">{item.flagDiff}</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">{item.flagDiff}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
