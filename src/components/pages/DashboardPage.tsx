import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Search,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { AnalysisResult, MetricSummary } from '../../types/fraud';

interface DashboardPageProps {
  metrics: MetricSummary | null;
  recentTransactions: AnalysisResult[];
  onSelectTransaction: (result: AnalysisResult) => void;
  onNavigate: (view: string) => void;
}

const RISK_BAND_COLORS = {
  low: '#10b981',    // emerald
  medium: '#f59e0b', // amber
  high: '#ef4444',   // rose/red
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  recentTransactions,
  onSelectTransaction,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [alertsOnly, setAlertsOnly] = useState(false);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Loading research analytics telemetry...</span>
        </div>
      </div>
    );
  }

  // Filtered transactions
  const filteredList = recentTransactions.filter((item) => {
    if (selectedRiskFilter !== 'all' && item.behavioralRiskBand !== selectedRiskFilter) {
      return false;
    }
    if (alertsOnly && !item.isAdaptiveAlert) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.transaction.merchantName.toLowerCase().includes(q);
      const matchCust = item.transaction.customerId.toLowerCase().includes(q);
      const matchLoc = item.transaction.location.toLowerCase().includes(q);
      return matchName || matchCust || matchLoc;
    }
    return true;
  });

  // Chart data
  const pieData = [
    { name: 'Low Risk', value: metrics.lowRiskCount, color: '#10b981' },
    { name: 'Medium Risk', value: metrics.mediumRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: metrics.highRiskCount, color: '#ef4444' },
  ];

  const modelComparisonData = [
    { model: 'Logistic Reg.', recall: 0.74, precision: 0.81, f1: 0.77 },
    { model: 'Random Forest', recall: 0.89, precision: 0.83, f1: 0.86 },
    { model: 'XGBoost', recall: 0.91, precision: 0.86, f1: 0.88 },
    { model: 'FraudGuard Ens.', recall: 0.946, precision: 0.889, f1: 0.917 },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Model Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            FraudGuard Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time behavioral telemetry, ensemble inference metrics, and adaptive risk evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Live Model Pipeline Active</span>
          </div>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Analyze New Txn</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular Numerals) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Total Processed</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {metrics.totalProcessed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Streamed & stored</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Fraud Alerts</span>
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            {metrics.fraudAlertsCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Adaptive threshold triggers</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legitimate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {metrics.legitimateCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Cleared nominal volume</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-indigo-400 font-medium">Fraud Recall</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">
            {(metrics.fraudRecall * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">True positive detection</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-violet-400 font-medium">Precision (PPV)</div>
          <div className="text-2xl font-bold text-violet-400 font-mono tabular-nums">
            {(metrics.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">Alert validity rate</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium">F1-Score</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {metrics.f1Score.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400">Harmonic mean balance</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium">PR-AUC</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {metrics.prAuc.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400">Precision-recall curve area</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-emerald-400 font-medium">False Negative Rate</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {(metrics.falseNegativeRate * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">Missed fraud risk (FNR)</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium">False Positive Rate</div>
          <div className="text-2xl font-bold text-slate-300 font-mono tabular-nums">
            {(metrics.falsePositiveRate * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">Benign friction rate (FPR)</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-amber-400 font-medium">High Risk Band</div>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
            {metrics.highRiskCount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">B(x_t) &gt; 0.70 volume</div>
        </div>
      </div>

      {/* Visualization Row 1: Volume Timeline & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transaction Volume Timeline */}
        <div className="lg:col-span-8 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Transaction Volume & Anomaly Distribution Over Time
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation stream aggregated in 3-hour diurnal windows.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Transactions"
                  stroke="#6366f1"
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  name="Adaptive Fraud Alerts"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#alertGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Behavioral Risk Bands Pie */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Risk Band Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Transactions categorized by explicit behavioral score B(x_t).
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Low Risk (B ≤ 0.35)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-400">
                {metrics.lowRiskCount.toLocaleString()} ({((metrics.lowRiskCount / metrics.totalProcessed) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Medium Risk (0.35 &lt; B ≤ 0.70)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-400">
                {metrics.mediumRiskCount.toLocaleString()} ({((metrics.mediumRiskCount / metrics.totalProcessed) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>High Risk (B &gt; 0.70)</span>
              </span>
              <span className="font-mono tabular-nums text-slate-400">
                {metrics.highRiskCount.toLocaleString()} ({((metrics.highRiskCount / metrics.totalProcessed) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Row 2: Behavioral Deviations & Ensemble Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts by Behavioral Deviation Type */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Alerts by Primary Behavioral Deviation Trigger
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of underlying behavioral flags triggering the adaptive threshold.
            </p>
          </div>

          <div className="space-y-3">
            {metrics.alertsByDeviation.map((dev, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{dev.name}</span>
                  <span className="font-mono text-indigo-400 tabular-nums font-semibold">
                    {dev.count} alerts
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${(dev.count / 120) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">{dev.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Ensemble Performance Comparison */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Ensemble vs Base Classifiers Benchmark
            </h3>
            <p className="text-xs text-slate-400">
              Validation metrics comparing individual models against the soft-voting ensemble.
            </p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelComparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="model" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0.6, 1.0]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="recall" name="Recall" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" name="Precision" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" name="F1-Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance by Customer History Group */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Evaluation by Customer Profile Maturity (Handling Cold-Start)
          </h3>
          <p className="text-xs text-slate-400">
            Comparing model performance across accounts with varying historical transaction depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.performanceByHistoryGroup.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-white">{item.group}</div>
              <div className="text-[11px] text-slate-400">Evaluated volume: {item.count.toLocaleString()} txns</div>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">F1-Score:</span>
                  <span className="font-mono text-white tabular-nums font-semibold">{item.f1Score.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recall:</span>
                  <span className="font-mono text-indigo-400 tabular-nums">{(item.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precision:</span>
                  <span className="font-mono text-violet-400 tabular-nums">{(item.precision * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluated Transactions Feed Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Recent Evaluated Transactions
            </h3>
            <p className="text-xs text-slate-400">
              Live transaction records processed through the behavioral feature extractor and adaptive ensemble.
            </p>
          </div>

          {/* Interactive Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search merchant, ID, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedRiskFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedRiskFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedRiskFilter('high')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedRiskFilter === 'high'
                    ? 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                High Risk
              </button>
              <button
                onClick={() => setSelectedRiskFilter('medium')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedRiskFilter === 'medium'
                    ? 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setSelectedRiskFilter('low')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedRiskFilter === 'low'
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Low
              </button>
            </div>

            <button
              onClick={() => setAlertsOnly(!alertsOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                alertsOnly
                  ? 'bg-rose-900/40 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Alerts Only
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Transaction</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Behavioral Dev.</th>
                <th className="py-2.5 px-3 text-center">B(x_t)</th>
                <th className="py-2.5 px-3 text-center">P_ens</th>
                <th className="py-2.5 px-3 text-center">Fused S(x)</th>
                <th className="py-2.5 px-3 text-center">τ(B)</th>
                <th className="py-2.5 px-3 text-center">Decision</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.transaction.id}
                    className="hover:bg-slate-850/50 transition-colors cursor-pointer"
                    onClick={() => onSelectTransaction(item)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white truncate max-w-[160px]">
                        {item.transaction.merchantName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.transaction.merchantCategory} · {item.transaction.location}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-200">{item.transaction.customerId}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.transaction.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-white tabular-nums">
                      ₹{item.transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[11px] text-slate-300">
                        Z: {item.behavioralDeviations.amount_dev_hist_mean > 0 ? '+' : ''}
                        {item.behavioralDeviations.amount_dev_hist_mean}σ
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Δt: {item.behavioralDeviations.time_since_last_txn}h
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className="font-mono font-bold tabular-nums"
                        style={{ color: RISK_BAND_COLORS[item.behavioralRiskBand] }}
                      >
                        {item.behavioralRiskScore.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-300">
                      {(item.modelProbabilities.ensemble * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold tabular-nums text-white">
                      {item.fusedScore.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums text-indigo-400">
                      {item.applicableThreshold.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isAdaptiveAlert ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/30">
                          Flagged for Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                          Below Threshold
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(item);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-xs cursor-pointer"
                      >
                        SHAP &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
