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
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult } from '../../types/fraud';

interface ModelExplainabilityPageProps {
  currentResult: AnalysisResult | null;
  recentTransactions: AnalysisResult[];
  onSelectResult: (res: AnalysisResult) => void;
  onNavigateToAnalyze: () => void;
}

export const ModelExplainabilityPage: React.FC<ModelExplainabilityPageProps> = ({
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

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Binary className="w-6 h-6 text-indigo-400" />
            <span>Model Explainability & SHAP Interpretability</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global tree feature importance, local additive feature attributions, and cooperative game theory Shapley values.
          </p>
        </div>

        <button
          onClick={onNavigateToAnalyze}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>Analyze Transaction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Global Feature Importance Section */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Global Feature Importance: Mean |SHAP Value| Across Evaluation Benchmark</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregate contribution magnitude across all test transactions. Customer-specific behavioral deviations dominate nominal transaction amount.
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={globalShapImportances}
              margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                width={170}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(val: any) => [`${val}`, 'Mean |SHAP Value|']}
              />
              <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local Transaction SHAP Explainer */}
      {activeResult ? (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="text-[11px] font-mono text-indigo-400 uppercase font-semibold">
                Local Explainer Case Study
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Local Additive Feature Attribution: {activeResult.transaction.id}
              </h2>
            </div>

            {/* Quick selector of other recent evaluations */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Select Txn:</label>
              <select
                value={activeResult.transaction.id}
                onChange={(e) => {
                  const target = recentTransactions.find((r) => r.transaction.id === e.target.value);
                  if (target) onSelectResult(target);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
              >
                {recentTransactions.map((r) => (
                  <option key={r.transaction.id} value={r.transaction.id}>
                    {r.transaction.id} · ₹{r.transaction.amount.toLocaleString('en-IN')} ({r.transaction.merchantName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additive Math Formulation */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
            <div className="font-mono font-bold text-indigo-200">
              f(x) = E[f(x)] + ∑ φ_i = {(activeResult.shapExplanation.baseValue * 100).toFixed(1)}% + ∑ φ_i = {(activeResult.shapExplanation.modelOutput * 100).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              TreeSHAP calculates the exact marginal contribution of each feature across all permutations of feature subsets.
              Positive values push the model toward a fraud prediction; negative values push the prediction toward legitimate.
            </p>
          </div>

          {/* Local Attribution Waterfall Chart */}
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={activeResult.shapExplanation.contributions.map((c) => ({
                  name: c.displayName,
                  value: parseFloat(c.shapValue.toFixed(3)),
                  isPos: c.shapValue >= 0,
                }))}
                margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val >= 0 ? '+' : ''}${val}`, 'SHAP Value (φ)']}
                />
                <ReferenceLine x={0} stroke="#475569" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {activeResult.shapExplanation.contributions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.shapValue >= 0 ? '#ef4444' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Contributions Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="p-3">Feature Name</th>
                  <th className="p-3">Observed Value</th>
                  <th className="p-3">SHAP Attribution (φ_i)</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Human-Interpretable Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {activeResult.shapExplanation.contributions.map((contrib, i) => {
                  const isPos = contrib.shapValue >= 0;
                  return (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-white">
                        {contrib.displayName}
                      </td>
                      <td className="p-3 font-mono text-slate-200">
                        {typeof contrib.value === 'number'
                          ? contrib.value.toFixed(2)
                          : contrib.value}
                      </td>
                      <td
                        className={`p-3 font-mono font-bold text-sm ${
                          isPos ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {contrib.shapValue.toFixed(3)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            isPos
                              ? 'bg-rose-950 text-rose-300 border border-rose-700'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          }`}
                        >
                          {isPos ? 'Elevates Risk' : 'Reduces Risk'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 text-[11px]">
                        {contrib.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs">
          Analyze a transaction first to view local SHAP explanations.
        </div>
      )}

      {/* Methodology Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Research Context: SHAP values satisfy the efficiency, symmetry, dummy, and additivity axioms from cooperative game theory. In financial fraud detection research, SHAP explanations provide forensic traceability into why ensemble models flag edge-case transactions.
        </p>
      </div>
    </div>
  );
};
