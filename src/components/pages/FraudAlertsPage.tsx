import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisResult } from '../../types/fraud';

interface FraudAlertsPageProps {
  recentTransactions: AnalysisResult[];
  onSelectAlert: (result: AnalysisResult) => void;
  onNavigateToAnalyze: () => void;
}

export const FraudAlertsPage: React.FC<FraudAlertsPageProps> = ({
  recentTransactions,
  onSelectAlert,
  onNavigateToAnalyze,
}) => {
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [adaptiveAlertsOnly, setAdaptiveAlertsOnly] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter alerts
  const alerts = recentTransactions.filter((item) => {
    if (adaptiveAlertsOnly && !item.isAdaptiveAlert) return false;
    if (riskFilter !== 'all' && item.behavioralRiskBand !== riskFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.transaction.id.toLowerCase().includes(q) ||
        item.transaction.customerId.toLowerCase().includes(q) ||
        item.transaction.merchantName.toLowerCase().includes(q) ||
        item.transaction.merchantCategory.toLowerCase().includes(q) ||
        item.transaction.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const highCount = recentTransactions.filter((t) => t.behavioralRiskBand === 'high').length;
  const adaptiveAlertCount = recentTransactions.filter((t) => t.isAdaptiveAlert).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Fraud Alerts & Investigative Triage</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Suspicious transaction alerts flagged by fused behavioral deviation and adaptive threshold scoring.
          </p>
        </div>

        <button
          onClick={onNavigateToAnalyze}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>Analyze New Transaction</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Triage Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Adaptive Alerts</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {adaptiveAlertCount}
          </div>
          <div className="text-[11px] text-slate-400">S(x_t) &gt; τ(B) trigger</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Risk Band</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {highCount}
          </div>
          <div className="text-[11px] text-slate-400">B(x_t) &gt; 0.70 score</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-indigo-400 font-medium">Evaluated Queue</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {recentTransactions.length}
          </div>
          <div className="text-[11px] text-slate-400">Total analyzed records</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-emerald-400 font-medium">Compliance Role</div>
          <div className="text-sm font-semibold text-slate-200 mt-1">
            Diagnostic Support
          </div>
          <div className="text-[11px] text-slate-400">No automatic card decline</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, customer, merchant, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                riskFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Bands
            </button>
            <button
              onClick={() => setRiskFilter('high')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                riskFilter === 'high'
                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setRiskFilter('medium')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                riskFilter === 'medium'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setRiskFilter('low')}
              className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                riskFilter === 'low'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Low
            </button>
          </div>

          <button
            onClick={() => setAdaptiveAlertsOnly(!adaptiveAlertsOnly)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              adaptiveAlertsOnly
                ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {adaptiveAlertsOnly ? 'Showing Alerts Only' : 'Include Cleared'}
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-3.5">Txn ID / Timestamp</th>
              <th className="py-3 px-3.5">Customer</th>
              <th className="py-3 px-3.5">Merchant & Location</th>
              <th className="py-3 px-3.5 text-right">Amount (₹)</th>
              <th className="py-3 px-3.5 text-center">Risk Band</th>
              <th className="py-3 px-3.5 text-center">Fused S(x)</th>
              <th className="py-3 px-3.5 text-center">Threshold τ(B)</th>
              <th className="py-3 px-3.5">Primary Deviation Reason</th>
              <th className="py-3 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No fraud alerts match the selected criteria.
                </td>
              </tr>
            ) : (
              alerts.map((item) => {
                const flaggedReason =
                  item.deviationReasons?.find((r) => r.isFlagged) ||
                  item.deviationReasons?.[0];

                return (
                  <tr
                    key={item.transaction.id}
                    onClick={() => onSelectAlert(item)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3.5">
                      <div className="font-mono text-indigo-400 font-semibold">
                        {item.transaction.id}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.transaction.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-white">
                        {item.transaction.customerId}
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-100 truncate max-w-[180px]">
                        {item.transaction.merchantName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.transaction.merchantCategory} · {item.transaction.location}, {item.transaction.country}
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-right font-mono font-bold text-white text-sm">
                      ₹{item.transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          item.behavioralRiskBand === 'high'
                            ? 'bg-rose-950 text-rose-400 border-rose-700'
                            : item.behavioralRiskBand === 'medium'
                            ? 'bg-amber-950 text-amber-400 border-amber-700'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                        }`}
                      >
                        {item.behavioralRiskBand}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-100">
                      {item.fusedScore.toFixed(3)}
                    </td>

                    <td className="py-3 px-3.5 text-center font-mono text-indigo-400">
                      {item.applicableThreshold.toFixed(2)}
                    </td>

                    <td className="py-3 px-3.5 max-w-xs">
                      {flaggedReason ? (
                        <div className="text-[11px] text-slate-200 truncate">
                          <span className="font-semibold text-rose-400">
                            {flaggedReason.displayName}:
                          </span>{' '}
                          {flaggedReason.simpleExplanation}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          {item.thresholdDiffReason}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAlert(item);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Why Flagged? →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
