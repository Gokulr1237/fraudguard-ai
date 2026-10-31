import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Clock,
  MapPin,
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  History,
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  Filter,
  Info,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
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
  AnalysisResult,
  CustomerProfile,
  PresetScenario,
  Transaction,
} from '../../types/fraud';

interface AnalyzeTransactionPageProps {
  customers: CustomerProfile[];
  scenarios?: PresetScenario[];
  onAnalyze: (txData: any) => Promise<AnalysisResult>;
  currentResult: AnalysisResult | null;
  onNavigateToShap?: (result: AnalysisResult) => void;
  onSelectCustomerTxn?: (tx: Transaction) => void;
}

export const AnalyzeTransactionPage: React.FC<AnalyzeTransactionPageProps> = ({
  customers,
  onAnalyze,
  currentResult,
  onNavigateToShap,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || 'CUST_1001'
  );
  const [amount, setAmount] = useState<string>('235000.00');
  const [merchantName, setMerchantName] = useState<string>('Bic Camera Tokyo Online');
  const [merchantCategory, setMerchantCategory] = useState<string>('Overseas Luxury Electronics');
  const [location, setLocation] = useState<string>('Tokyo');
  const [country, setCountry] = useState<string>('JP');
  const [channel, setChannel] = useState<'in_store' | 'ecommerce' | 'mobile_wallet' | 'atm'>('ecommerce');
  const [cardPresent, setCardPresent] = useState<boolean>(false);
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer history search state
  const [historySearch, setHistorySearch] = useState<string>('');
  const historyRef = useRef<HTMLDivElement>(null);

  // Selected customer preview from connected dataset
  const currentCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Submit handler: Analyze Transaction
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      await onAnalyze({
        customerId: selectedCustomerId,
        amount: parseFloat(amount),
        currency: 'INR',
        merchantName,
        merchantCategory,
        location,
        country,
        channel,
        cardPresent,
        timestamp,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete model inference');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler for "View Customer History" button
  const handleViewCustomerHistory = () => {
    setTimeout(() => {
      historyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  // Load a prior transaction into the analysis form
  const handleLoadPriorTxn = (tx: Transaction) => {
    setAmount(tx.amount.toString());
    setMerchantName(tx.merchantName);
    setMerchantCategory(tx.merchantCategory);
    setLocation(tx.location);
    setCountry(tx.country);
    setChannel(tx.channel);
    setCardPresent(tx.cardPresent);
    setTimestamp(new Date().toISOString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Strictly prior transactions (t < current)
  const priorTxns = currentResult?.historicalTransactions || [];
  const filteredHistory = priorTxns.filter((t) => {
    if (!historySearch) return true;
    const q = historySearch.toLowerCase();
    return (
      t.merchantName.toLowerCase().includes(q) ||
      t.merchantCategory.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.amount.toString().includes(q)
    );
  });

  const summary = currentResult?.customerHistorySummary;

  // Prepare SHAP chart data
  const shapData = currentResult
    ? currentResult.shapExplanation.contributions.map((c) => ({
        feature: c.displayName,
        value: c.shapValue,
        description: c.description,
        featureVal: c.value,
      }))
    : [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Analyze Transaction & Adaptive Risk Inference
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customer-specific behavioral deviation profiling, soft-voting ensemble probabilities, adaptive threshold decisioning, and local SHAP attributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewCustomerHistory}
            className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            View Customer History
          </button>
        </div>
      </div>

      {/* 1. TRANSACTION ANALYSIS FORM */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Transaction Parameters & Customer Behavioral Baseline</span>
          </h2>
          <span className="text-[11px] text-slate-400">All amounts in Indian Rupee (INR · ₹)</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cardholder Selection & Baseline Preview */}
            <div className="space-y-2 md:col-span-1">
              <label className="block text-slate-300 font-medium">
                Customer Profile (From Dataset)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) {c.isColdStart ? '— Cold Start' : ''}
                  </option>
                ))}
              </select>

              {/* Compact Behavioral Baseline Preview */}
              {currentCustomer && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Baseline Statistics</span>
                    <span className="font-mono text-indigo-400">
                      {currentCustomer.accountAgeDays}d account
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Mean:</span>
                    <strong className="text-slate-200 font-mono">
                      ₹{currentCustomer.historicalMeanAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Median:</span>
                    <strong className="text-slate-200 font-mono">
                      ₹{(currentCustomer.historicalMedianAmount || currentCustomer.historicalMeanAmount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Historical Peak:</span>
                    <strong className="text-slate-200 font-mono">
                      ₹{currentCustomer.historicalMaxAmount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Prior Transactions:</span>
                    <strong className="text-slate-200 font-mono">
                      {currentCustomer.totalHistoricalTxns} records
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-900">
                    <span>History Reliability:</span>
                    {currentCustomer.isColdStart ? (
                      <span className="text-amber-400 font-semibold">
                        Cold Start (Limited baseline)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">
                        Established (Reliable)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Amount & Timestamp */}
            <div className="space-y-3 md:col-span-1">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Transaction Amount (INR · ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Timestamp (ISO / UTC)
                </label>
                <input
                  type="text"
                  required
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Merchant Details */}
            <div className="space-y-3 md:col-span-1">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Merchant Name
                </label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Merchant Category
                </label>
                <input
                  type="text"
                  required
                  value={merchantCategory}
                  onChange={(e) => setMerchantCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                City / Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Country Code
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Payment Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ecommerce">E-Commerce / Online (3DS)</option>
                <option value="in_store">In-Store (POS Chip/PIN)</option>
                <option value="mobile_wallet">Mobile Wallet / UPI</option>
                <option value="atm">ATM Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Card Present?
              </label>
              <select
                value={cardPresent ? 'yes' : 'no'}
                onChange={(e) => setCardPresent(e.target.value === 'yes')}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="no">No (Card-Not-Present / Digital)</option>
                <option value="yes">Yes (Physical Card Present)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Computing Behavioral Features & ML Models...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze Transaction</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleViewCustomerHistory}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>View Customer History</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. UNIFIED EXPLANATION CARD (Immediately below the form) */}
      {currentResult && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/80 space-y-6">
          {/* Header Strip with Title & Responsible Status Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                Unified Explainable Risk Assessment
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {currentResult.isAdaptiveAlert
                  ? 'Why Was This Transaction Flagged?'
                  : 'Why This Transaction Remained Below Threshold'}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  currentResult.isAdaptiveAlert
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {currentResult.isAdaptiveAlert ? 'Flagged for Review' : 'Below Threshold'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                  currentResult.behavioralRiskBand === 'high'
                    ? 'bg-rose-950/50 text-rose-400 border-rose-600'
                    : currentResult.behavioralRiskBand === 'medium'
                    ? 'bg-amber-950/50 text-amber-400 border-amber-600'
                    : 'bg-emerald-950/50 text-emerald-400 border-emerald-600'
                }`}
              >
                {currentResult.behavioralRiskBand} Behavioral Risk (B = {currentResult.behavioralRiskScore.toFixed(3)})
              </span>
            </div>
          </div>

          {/* SUBSECTION A: FINAL DECISION GRID */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              A. Final Decision & Key Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Transaction ID</div>
                <div className="font-mono font-semibold text-slate-200 truncate">
                  {currentResult.transaction.id}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Customer ID</div>
                <div className="font-mono font-semibold text-indigo-300 truncate">
                  {currentResult.transaction.customerId}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Amount (INR)</div>
                <div className="font-mono font-bold text-white">
                  ₹{currentResult.transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Timestamp</div>
                <div className="font-mono text-slate-300 text-[11px] truncate">
                  {new Date(currentResult.transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Fused Score S</div>
                <div className="font-mono font-bold text-white text-base">
                  {currentResult.fusedScore.toFixed(3)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">S = α·Pens + (1-α)·B</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Adaptive τ(B)</div>
                <div className="font-mono font-bold text-indigo-400 text-base">
                  {currentResult.applicableThreshold.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Customer specific</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Fixed Baseline</div>
                <div className="font-mono font-bold text-slate-400 text-base">
                  0.50
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Fixed comparison</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Final Status</div>
                <div
                  className={`font-bold text-xs ${
                    currentResult.isAdaptiveAlert ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {currentResult.isAdaptiveAlert ? 'Flagged for Review' : 'Below Threshold'}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentResult.isAdaptiveAlert ? 'S ≥ τ(B)' : 'S < τ(B)'}
                </div>
              </div>
            </div>
          </div>

          {/* SUBSECTION B: PLAIN-ENGLISH DYNAMIC REASON */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>B. Plain-English Dynamic Reason</span>
            </h3>

            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-3 ${
                currentResult.isAdaptiveAlert
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              }`}
            >
              <div className="font-medium text-slate-200">
                {currentResult.thresholdDiffReason}
              </div>

              {/* Specific Deviation Findings */}
              {currentResult.deviationReasons && currentResult.deviationReasons.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Behavioral Baseline Findings (t &lt; current transaction):
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-slate-300 text-[11px]">
                    {currentResult.deviationReasons.map((r, idx) => (
                      <li key={idx}>
                        <span className="font-semibold text-white">{r.displayName}:</span>{' '}
                        {r.simpleExplanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* SUBSECTION C: BEHAVIORAL COMPARISON TABLE */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>C. Behavioral Comparison (Customer Historical Baseline vs Current Transaction)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Computed using transactions prior to {new Date(currentResult.transaction.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3">Customer Historical Baseline</th>
                    <th className="py-2.5 px-3">Current Transaction</th>
                    <th className="py-2.5 px-3">Evidence / Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                  {currentResult.comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {row.feature}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                        {row.historicalBehavior}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-white text-[11px]">
                        {row.currentTransaction}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            row.interpretation === 'Severe Anomaly'
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : row.interpretation === 'Moderate Anomaly' || row.interpretation === 'Unusual'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {row.interpretation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUBSECTION D: RISK & THRESHOLD SUMMARY (Horizontal Risk Bar & Scores) */}
          <div className="space-y-4 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>D. Risk & Threshold Summary (Score Fusion & Adaptive Decision)</span>
            </h3>

            {/* Horizontal Risk Bar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>0.00 (Nominal Legitimate)</span>
                <span className="font-semibold text-indigo-400">
                  Adaptive Fusion: S = α·P_ens + (1-α)·B
                </span>
                <span>1.00 (Severe Risk)</span>
              </div>

              {/* Progress track with markers */}
              <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-rose-500/20" />
                {/* Fused Score Fill */}
                <div
                  className={`h-full transition-all duration-500 ${
                    currentResult.isAdaptiveAlert ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, currentResult.fusedScore * 100))}%` }}
                />
              </div>

              {/* Threshold position markers */}
              <div className="relative w-full h-8 text-[11px] font-mono">
                {/* Adaptive Threshold Marker */}
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${currentResult.applicableThreshold * 100}%` }}
                >
                  <div className="w-0.5 h-3 bg-indigo-400" />
                  <span className="text-[10px] text-indigo-300 font-bold whitespace-nowrap bg-slate-900 px-1 py-0.5 rounded border border-indigo-500/50">
                    τ(B) = {currentResult.applicableThreshold.toFixed(2)}
                  </span>
                </div>

                {/* Fixed Baseline Marker */}
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: '50%' }}
                >
                  <div className="w-0.5 h-3 bg-slate-500" />
                  <span className="text-[10px] text-slate-400 whitespace-nowrap bg-slate-900 px-1 py-0.5 rounded border border-slate-700">
                    Fixed τ = 0.50
                  </span>
                </div>

                {/* Fused Score Marker */}
                <div
                  className="absolute -top-1 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${Math.min(98, Math.max(2, currentResult.fusedScore * 100))}%` }}
                >
                  <div className="w-0.5 h-3 bg-white" />
                  <span className="text-[10px] text-white font-bold whitespace-nowrap bg-slate-800 px-1 py-0.5 rounded border border-white/50">
                    S = {currentResult.fusedScore.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Models Ensemble Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Logistic Regression</div>
                <div className="font-mono text-base font-bold text-slate-200">
                  {(currentResult.modelProbabilities.logisticRegression * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Weight: {currentResult.ensembleWeights.wLR}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">Random Forest</div>
                <div className="font-mono text-base font-bold text-slate-200">
                  {(currentResult.modelProbabilities.randomForest * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Weight: {currentResult.ensembleWeights.wRF}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400">XGBoost Classifier</div>
                <div className="font-mono text-base font-bold text-slate-200">
                  {(currentResult.modelProbabilities.xgboost * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Weight: {currentResult.ensembleWeights.wXGB}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-indigo-500/40 space-y-1">
                <div className="text-[11px] text-indigo-300 font-semibold">Ensemble Prob (P_ens)</div>
                <div className="font-mono text-base font-bold text-indigo-300">
                  {(currentResult.modelProbabilities.ensemble * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Soft-voting fusion</div>
              </div>
            </div>
          </div>

          {/* SUBSECTION E: SHAP LOCAL MODEL EXPLANATION */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>E. SHAP Local Model Explanation</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Top influential feature contributions to the ensemble prediction (Base Value E[f(x)] = {currentResult.shapExplanation.baseValue.toFixed(3)} &rarr; Model Output P_ens = {currentResult.shapExplanation.modelOutput.toFixed(3)}).
                </p>
              </div>
            </div>

            {/* Horizontal Diverging Bar Chart */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={shapData}
                    margin={{ top: 10, right: 30, left: 160, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      type="number"
                      stroke="#64748b"
                      tick={{ fontSize: 11 }}
                      domain={[-0.3, 0.4]}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      width={150}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const val = Number(data.value);
                          return (
                            <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs shadow-xl space-y-1">
                              <div className="font-semibold text-white">{data.feature}</div>
                              <div className="text-slate-400 font-mono">
                                Feature Value: {data.featureVal}
                              </div>
                              <div
                                className={`font-mono font-bold ${
                                  val > 0 ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                SHAP Contribution: {val > 0 ? '+' : ''}
                                {val.toFixed(4)}
                              </div>
                              <div className="text-[11px] text-slate-300">
                                {data.description}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                      {shapData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.value > 0 ? '#ef4444' : '#10b981'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Attribution Table */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="text-[11px] font-semibold text-slate-300">
                  Feature Impact Details:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {currentResult.shapExplanation.contributions.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          {c.displayName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {c.description}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs shrink-0 px-2 py-0.5 rounded ${
                          c.shapValue > 0
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {c.shapValue > 0 ? '+' : ''}
                        {c.shapValue.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Methodology Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Ethical & Model Explainability Notice:</strong> SHAP feature attributions reflect statistical associations derived by the gradient boosted trees and tree explainer. A high feature contribution does not prove fraudulent or criminal intent; it identifies the variables that shifted the mathematical risk score away from the base rate.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER TRANSACTION HISTORY & BEHAVIORAL PROFILE SECTION */}
      <div
        ref={historyRef}
        className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Customer Transaction History & Behavioral Profile</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly prior transactions for cardholder{' '}
              <strong className="text-slate-200">{currentCustomer.name}</strong> ({currentCustomer.id}) before the analyzed transaction time.
            </p>
          </div>
          {summary && (
            <div className="text-xs text-slate-400 font-mono">
              {summary.observationPeriod}
            </div>
          )}
        </div>

        {/* Cold Start Guardrail Warning if applicable */}
        {summary?.coldStartWarning && (
          <div className="p-3.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{summary.coldStartWarning}</span>
          </div>
        )}

        {/* Behavioral Statistics Summary Card */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Historical Mean</div>
              <div className="font-mono font-bold text-white text-sm">
                ₹{summary.historicalMeanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Historical Median</div>
              <div className="font-mono font-bold text-white text-sm">
                ₹{summary.historicalMedianAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Historical Peak</div>
              <div className="font-mono font-bold text-white text-sm">
                ₹{summary.historicalMaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Prior Transactions</div>
              <div className="font-mono font-bold text-indigo-400 text-sm">
                {summary.totalHistoricalTxns} records
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Habitual Active Hours</div>
              <div className="font-mono font-semibold text-slate-200 text-xs truncate">
                {summary.typicalHoursString}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] text-slate-400">Avg Interval / Velocity</div>
              <div className="font-mono font-semibold text-slate-200 text-xs">
                ~{summary.averageFrequencyDays} days
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Box */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search historical records..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-[11px] text-slate-400">
            Showing {filteredHistory.length} strictly prior transaction records
          </span>
        </div>

        {/* Prior Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC/IST)</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3">Merchant Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No prior transactions found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-300">
                      {tx.id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium">
                      {tx.merchantName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {tx.merchantCategory}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                      {tx.location}, {tx.country}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                      {tx.channel}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {tx.historicalClassification || 'Normal'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleLoadPriorTxn(tx)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-xs cursor-pointer"
                        title="Load parameters into analysis form"
                      >
                        Re-evaluate &rarr;
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
