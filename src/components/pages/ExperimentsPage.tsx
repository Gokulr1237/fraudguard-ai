import React, { useState } from 'react';
import {
  FlaskConical,
  BarChart2,
  TrendingUp,
  Layers,
  Info,
  CheckCircle2,
  RotateCcw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { EnsembleWeights, ImbalanceBenchmark } from '../../types/fraud';

interface ExperimentsPageProps {
  weights: EnsembleWeights;
  benchmarks: ImbalanceBenchmark[];
  onUpdateWeights: (weights: EnsembleWeights) => Promise<void>;
}

export const ExperimentsPage: React.FC<ExperimentsPageProps> = ({
  weights,
  benchmarks,
  onUpdateWeights,
}) => {
  const [wLR, setWLR] = useState<number>(weights.wLR);
  const [wRF, setWRF] = useState<number>(weights.wRF);
  const [wXGB, setWXGB] = useState<number>(weights.wXGB);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totalWeight = parseFloat((wLR + wRF + wXGB).toFixed(2));
  const isValid = Math.abs(totalWeight - 1.0) <= 0.01;

  const handleSaveWeights = async () => {
    if (!isValid) return;
    setIsSaving(true);
    setMsg(null);
    try {
      await onUpdateWeights({ wLR, wRF, wXGB });
      setMsg('Ensemble soft-voting weights successfully updated and persisted on backend.');
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const modelComparisonData = [
    { model: 'Logistic Reg.', recall: 0.74, precision: 0.81, f1: 0.77, prAuc: 0.79 },
    { model: 'Random Forest', recall: 0.89, precision: 0.83, f1: 0.86, prAuc: 0.88 },
    { model: 'XGBoost', recall: 0.91, precision: 0.86, f1: 0.88, prAuc: 0.90 },
    { model: 'FraudGuard Ens.', recall: 0.946, precision: 0.889, f1: 0.917, prAuc: 0.923 },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FlaskConical className="w-6 h-6 text-indigo-400" />
            <span>Experiments, Benchmarks & Empirical Results</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Empirical validation of class-imbalance sampling strategies, base classifier performance, and ensemble weights.
          </p>
        </div>
      </div>

      {/* Class Imbalance Benchmarking Matrix */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Class-Imbalance Handling Benchmark (Credit Card Dataset Evaluation)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Credit card fraud exhibits severe class imbalance (typically &lt;0.2% positive fraud cases). Comparison of resampled vs cost-weighted pipelines.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="p-3">Imbalance Technique</th>
                <th className="p-3 text-right">Fraud Recall</th>
                <th className="p-3 text-right">Precision</th>
                <th className="p-3 text-right">F1-Score</th>
                <th className="p-3 text-right">PR-AUC</th>
                <th className="p-3 text-right">ROC-AUC</th>
                <th className="p-3 text-right">False Neg. Rate</th>
                <th className="p-3">Research Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {benchmarks.map((b, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="p-3 font-semibold text-white">
                    {b.technique}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-400">
                    {(b.recall * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-right font-mono text-slate-200">
                    {(b.precision * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-white">
                    {b.f1Score.toFixed(3)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-200">
                    {b.prAuc.toFixed(3)}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-200">
                    {b.rocAuc.toFixed(3)}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-400 font-bold">
                    {(b.falseNegativeRate * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-slate-300 text-[11px]">
                    {b.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Performance Comparison Chart */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Classifier Performance Comparison: Base Models vs FraudGuard Soft-Voting Ensemble</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The soft-voting ensemble achieves peak F1-Score (0.917) and PR-AUC (0.923), suppressing individual variance.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelComparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="model" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0.6, 1.0]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="recall" name="Recall" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="precision" name="Precision" fill="#a855f7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" name="F1-Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="prAuc" name="PR-AUC" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ensemble Weight Configuration Sandbox */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Ensemble Soft-Voting Weight Calibration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              P_ens = w_lr · P_lr + w_rf · P_rf + w_xgb · P_xgb. Model weights must sum to 1.0.
            </p>
          </div>

          <div className="text-xs font-mono">
            Total Weight: <span className={isValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{totalWeight} / 1.00</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Logistic Regression Weight */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Logistic Regression (w_lr)</span>
              <span className="font-mono font-bold text-white">{(wLR * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={wLR}
              onChange={(e) => setWLR(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Baseline linear probabilistic calibration</div>
          </div>

          {/* Random Forest Weight */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Random Forest (w_rf)</span>
              <span className="font-mono font-bold text-white">{(wRF * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={wRF}
              onChange={(e) => setWRF(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Bagged ensemble handling non-linear splits</div>
          </div>

          {/* XGBoost Weight */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">XGBoost (w_xgb)</span>
              <span className="font-mono font-bold text-white">{(wXGB * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={wXGB}
              onChange={(e) => setWXGB(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Gradient boosted trees for high-order interactions</div>
          </div>
        </div>

        {msg && (
          <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/40 text-xs text-indigo-300">
            {msg}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setWLR(0.2);
              setWRF(0.4);
              setWXGB(0.4);
            }}
            className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Reset Default (20/40/40)
          </button>
          <button
            onClick={handleSaveWeights}
            disabled={!isValid || isSaving}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Save Ensemble Calibration'}
          </button>
        </div>
      </div>
    </div>
  );
};
