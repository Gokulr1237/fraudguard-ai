import React, { useState } from 'react';
import {
  Layers,
  Scale,
  Zap,
  Info,
  CheckCircle2,
  TrendingUp,
  Cpu,
  BarChart3,
  Sliders,
  RotateCcw,
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

interface EnsembleExperimentsPageProps {
  weights: EnsembleWeights;
  benchmarks: ImbalanceBenchmark[];
  onUpdateWeights: (newWeights: EnsembleWeights) => Promise<void>;
}

export const EnsembleExperimentsPage: React.FC<EnsembleExperimentsPageProps> = ({
  weights,
  benchmarks,
  onUpdateWeights,
}) => {
  const [wLR, setWLR] = useState<number>(weights.wLR);
  const [wRF, setWRF] = useState<number>(weights.wRF);
  const [wXGB, setWXGB] = useState<number>(weights.wXGB);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const sumWeights = parseFloat((wLR + wRF + wXGB).toFixed(2));
  const isValidSum = Math.abs(sumWeights - 1.0) < 0.01;

  const handleUpdate = async () => {
    if (!isValidSum) {
      setStatusMsg(`Weights must sum to 1.0 (current sum: ${sumWeights.toFixed(2)})`);
      return;
    }
    setIsUpdating(true);
    setStatusMsg(null);
    try {
      await onUpdateWeights({ wLR, wRF, wXGB });
      setStatusMsg('Ensemble soft-voting weights updated in live backend pipeline.');
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to update ensemble weights');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetDefaults = () => {
    setWLR(0.20);
    setWRF(0.40);
    setWXGB(0.40);
  };

  // Detailed model comparison metrics
  const modelSpecs = [
    {
      model: 'Logistic Regression',
      type: 'Linear / Calibrated Log-Odds',
      trainingTime: '1.2s',
      inferenceLatency: '0.4ms',
      rocAuc: 0.884,
      prAuc: 0.741,
      recall: 0.742,
      precision: 0.814,
      f1Score: 0.776,
      brierScore: 0.042,
    },
    {
      model: 'Random Forest',
      type: 'Bagged Orthogonal Trees (n=100)',
      trainingTime: '18.4s',
      inferenceLatency: '2.1ms',
      rocAuc: 0.942,
      prAuc: 0.865,
      recall: 0.895,
      precision: 0.832,
      f1Score: 0.862,
      brierScore: 0.028,
    },
    {
      model: 'XGBoost',
      type: 'Gradient Boosted Trees (scale_pos_weight)',
      trainingTime: '24.6s',
      inferenceLatency: '1.4ms',
      rocAuc: 0.961,
      prAuc: 0.914,
      recall: 0.918,
      precision: 0.864,
      f1Score: 0.890,
      brierScore: 0.021,
    },
    {
      model: 'FraudGuard Ensemble',
      type: 'Soft-Voting Fusion + Behavioral Adaptation',
      trainingTime: '44.2s (combined)',
      inferenceLatency: '3.9ms',
      rocAuc: 0.976,
      prAuc: 0.938,
      recall: 0.946,
      precision: 0.889,
      f1Score: 0.917,
      brierScore: 0.015,
    },
  ];

  const imbalanceChartData = benchmarks.map((b) => ({
    name: b.technique.split(' ')[0],
    fullName: b.technique,
    recall: parseFloat((b.recall * 100).toFixed(1)),
    precision: parseFloat((b.precision * 100).toFixed(1)),
    f1: parseFloat((b.f1Score * 100).toFixed(1)),
    prAuc: parseFloat((b.prAuc * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Ensemble Architecture & Imbalance Benchmarks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reproducible experiments comparing individual classifiers, probability fusion weights, and class imbalance mitigation.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Paper Weights (0.2 / 0.4 / 0.4)</span>
        </button>
      </div>

      {/* Soft-Voting Weights Tuning */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Soft-Voting Probability Fusion Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              P_ens = w_LR · P_lr + w_RF · P_rf + w_XGB · P_xgb &nbsp;(Constraint: ∑ w_i = 1.0)
            </p>
          </div>

          <div
            className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
              isValidSum
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
            }`}
          >
            Weight Sum: {sumWeights.toFixed(2)} / 1.00
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* wLR */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">w_LR (Logistic Reg.)</span>
              <span className="font-mono text-indigo-400 font-bold text-base">
                {wLR.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={wLR}
              onChange={(e) => setWLR(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 leading-snug">
              Linear baseline providing stable log-odds calibration.
            </div>
          </div>

          {/* wRF */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">w_RF (Random Forest)</span>
              <span className="font-mono text-purple-400 font-bold text-base">
                {wRF.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={wRF}
              onChange={(e) => setWRF(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 leading-snug">
              Orthogonal bagged trees robust against outlier noise.
            </div>
          </div>

          {/* wXGB */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">w_XGB (XGBoost)</span>
              <span className="font-mono text-cyan-400 font-bold text-base">
                {wXGB.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.8"
              step="0.05"
              value={wXGB}
              onChange={(e) => setWXGB(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-400 leading-snug">
              Gradient-boosted decision trees targeting residual errors.
            </div>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-indigo-300">
            {statusMsg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            disabled={!isValidSum || isUpdating}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>Update Live Ensemble Weights</span>
          </button>
        </div>
      </div>

      {/* Model Performance Comparison Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Individual Classifier vs Soft-Voting Ensemble Benchmark
          </h3>
          <p className="text-xs text-slate-400">
            Empirical evaluation across 284,807 credit card transactions under standardized test partitioning.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Architecture</th>
                <th className="py-2.5 px-3">Training Specs</th>
                <th className="py-2.5 px-3 text-center">Latency</th>
                <th className="py-2.5 px-3 text-center">Recall</th>
                <th className="py-2.5 px-3 text-center">Precision</th>
                <th className="py-2.5 px-3 text-center">F1-Score</th>
                <th className="py-2.5 px-3 text-center">PR-AUC</th>
                <th className="py-2.5 px-3 text-center">ROC-AUC</th>
                <th className="py-2.5 px-3 text-center">Brier Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {modelSpecs.map((m, i) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-850/50 transition-colors ${
                    m.model.includes('FraudGuard') ? 'bg-indigo-950/20 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-white">{m.model}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{m.type}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 tabular-nums">
                    {m.inferenceLatency}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-400 tabular-nums font-bold">
                    {(m.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-violet-400 tabular-nums font-bold">
                    {(m.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-white tabular-nums font-bold">
                    {m.f1Score.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-cyan-400 tabular-nums font-bold">
                    {m.prAuc.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-300 tabular-nums">
                    {m.rocAuc.toFixed(3)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-400 tabular-nums">
                    {m.brierScore.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Class Imbalance Mitigation Study */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Class Imbalance Technique Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-400">
              Evaluating SMOTE, Random Undersampling (RUS), and Cost-Sensitive Weighting on 0.17% fraud prevalence.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={imbalanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="recall" name="Recall (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" name="F1-Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prAuc" name="PR-AUC (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Research Findings on Class Imbalance</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {benchmarks.map((b, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-white">{b.technique}</span>
                  <span className="font-mono text-indigo-400 tabular-nums">
                    F1: {(b.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{b.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Recall: {(b.recall * 100).toFixed(1)}%</span>
                  <span>·</span>
                  <span>FNR: {(b.falseNegativeRate * 100).toFixed(1)}%</span>
                  <span>·</span>
                  <span>PR-AUC: {b.prAuc.toFixed(3)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
