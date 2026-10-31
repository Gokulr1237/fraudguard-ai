import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Binary,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { AnalysisResult } from '../../types/fraud';

interface ExplainabilityShapPageProps {
  currentResult: AnalysisResult | null;
  recentTransactions: AnalysisResult[];
  onSelectResult: (res: AnalysisResult) => void;
  onNavigateToAnalyze: () => void;
}

export const ExplainabilityShapPage: React.FC<ExplainabilityShapPageProps> = ({
  currentResult,
  recentTransactions,
  onSelectResult,
  onNavigateToAnalyze,
}) => {
  // Global feature importance across the evaluation dataset
  const globalShapImportances = [
    { feature: 'amount_dev_hist_mean', name: 'Amount Dev. from Mean (Z-score)', importance: 0.285 },
    { feature: 'location_deviation', name: 'Location / Country Anomaly', importance: 0.242 },
    { feature: 'time_since_last_txn', name: 'Time Since Prior Txn (Velocity)', importance: 0.178 },
    { feature: 'merchant_cat_dev', name: 'Merchant Category Deviation', importance: 0.115 },
    { feature: 'transaction_amount', name: 'Nominal Transaction Value', importance: 0.082 },
    { feature: 'channel_card_present', name: 'Channel / Physical Card Presence', importance: 0.054 },
    { feature: 'hour_deviation', name: 'Transaction Hour Anomaly', importance: 0.044 },
  ];

  // Active result to explain: either currentResult or first in recentTransactions
  const activeResult = currentResult || recentTransactions[0] || null;

  if (!activeResult) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 space-y-4">
        <Binary className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">No Transaction Selected for SHAP</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Execute a transaction analysis first or select one from the dashboard to inspect its local TreeSHAP attribution waterfall.
        </p>
        <button
          onClick={onNavigateToAnalyze}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
        >
          Analyze a Transaction
        </button>
      </div>
    );
  }

  const { shapExplanation, modelProbabilities, behavioralRiskScore, behavioralRiskBand } = activeResult;

  // Transform SHAP contributions for chart
  const localChartData = shapExplanation.contributions.map((c) => ({
    name: c.displayName,
    shapValue: c.shapValue,
    rawVal: c.value,
    isPositive: c.shapValue >= 0,
    desc: c.description,
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Explainable AI — TreeSHAP Feature Attribution
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Additive game-theoretic explanations: decompose ensemble fraud probability into exact feature contributions.
          </p>
        </div>

        {/* Transaction Quick Selector */}
        {recentTransactions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Inspecting Txn:</span>
            <select
              value={activeResult.transaction.id}
              onChange={(e) => {
                const found = recentTransactions.find(
                  (t) => t.transaction.id === e.target.value
                );
                if (found) onSelectResult(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 max-w-xs truncate"
            >
              {recentTransactions.map((t) => (
                <option key={t.transaction.id} value={t.transaction.id}>
                  {t.transaction.merchantName} (₹{t.transaction.amount.toLocaleString('en-IN')}) —{' '}
                  {t.isAdaptiveAlert ? 'Alert Flag' : 'Legit'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Target Explained & Base Value Formula Strip */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Target Explained: </span>
            <span className="text-white font-semibold font-mono">{shapExplanation.targetExplained}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span>
              Base E[f(x)]: <strong className="text-indigo-400">{(shapExplanation.baseValue * 100).toFixed(1)}%</strong>
            </span>
            <span>&rarr;</span>
            <span>
              Net Output f(x):{' '}
              <strong
                className={
                  shapExplanation.modelOutput > 0.4 ? 'text-rose-400' : 'text-emerald-400'
                }
              >
                {(shapExplanation.modelOutput * 100).toFixed(1)}%
              </strong>
            </span>
            <span>
              (Δ = {shapExplanation.modelOutput >= shapExplanation.baseValue ? '+' : ''}
              {((shapExplanation.modelOutput - shapExplanation.baseValue) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
          <span className="font-semibold text-white">Analyst Summary: </span>
          {shapExplanation.summaryText}
        </div>
      </div>

      {/* Local SHAP Waterfall Breakdown Chart */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Local Feature Contribution Waterfall (φ_i)
            </h3>
            <p className="text-xs text-slate-400">
              Positive values (red) push the ensemble towards fraud alert; negative values (emerald) push towards legitimate.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={localChartData}
              margin={{ top: 10, right: 30, left: 160, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={[-0.4, 0.4]}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px',
                  borderRadius: '8px',
                }}
                formatter={(val: any, _name, item: any) => [
                  `${val > 0 ? '+' : ''}${(val * 100).toFixed(2)}% (Observed: ${item.payload.rawVal})`,
                  'Shapley Attribution φ_i',
                ]}
              />
              <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} />
              <Bar dataKey="shapValue" radius={[4, 4, 4, 4]}>
                {localChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.shapValue >= 0 ? '#ef4444' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Attribution Detail Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <h3 className="text-sm font-semibold text-white">
          Detailed Feature Level Diagnostic
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Feature Parameter</th>
                <th className="py-2.5 px-3">Observed Value</th>
                <th className="py-2.5 px-3 text-center">Impact Direction</th>
                <th className="py-2.5 px-3 text-right">Shapley Value (φ_i)</th>
                <th className="py-2.5 px-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {shapExplanation.contributions.map((c, i) => (
                <tr key={i} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-white">{c.displayName}</td>
                  <td className="py-2.5 px-3 font-mono text-indigo-300">{String(c.value)}</td>
                  <td className="py-2.5 px-3 text-center">
                    {c.shapValue >= 0 ? (
                      <span className="text-rose-400 inline-flex items-center gap-1 font-semibold text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Elevates Risk</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold text-[11px]">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Mitigates Risk</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    <span className={c.shapValue >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {c.shapValue >= 0 ? '+' : ''}
                      {(c.shapValue * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Feature Importance across Evaluation Dataset */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Global Feature Importance (Mean |SHAP Value| Across Corpus)
          </h3>
          <p className="text-xs text-slate-400">
            Measures which behavioral and transactional signals exert the strongest average influence on fraud predictions.
          </p>
        </div>

        <div className="space-y-3">
          {globalShapImportances.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-200 font-medium">{item.name}</span>
                <span className="font-mono text-indigo-400 tabular-nums font-semibold">
                  {item.importance.toFixed(3)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${(item.importance / 0.3) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical AI & Governance Card */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Explainability & Compliance Notice:</strong> SHAP values explain statistical model attributions relative to reference baselines. They do not infer customer intent or constitute judicial proof of fraudulent conduct. Under the Reserve Bank of India (RBI) Cyber Security Framework and DPDP guidelines, automated risk flags serve as investigative decision support requiring human verification.
        </p>
      </div>
    </div>
  );
};
