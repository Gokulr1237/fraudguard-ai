import React, { useState } from 'react';
import {
  User,
  Clock,
  MapPin,
  Tag,
  AlertCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  History,
  ShieldAlert,
  ArrowRight,
  Search,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CustomerProfile, Transaction } from '../../types/fraud';

interface CustomerBehaviorPageProps {
  customers: CustomerProfile[];
  transactions: Transaction[];
  onSelectCustomerTxnForAnalysis: (tx: Transaction) => void;
  onNavigateToAnalyze: () => void;
}

export const CustomerBehaviorPage: React.FC<CustomerBehaviorPageProps> = ({
  customers,
  transactions,
  onSelectCustomerTxnForAnalysis,
  onNavigateToAnalyze,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || 'CUST_1001'
  );
  const [txnSearch, setTxnSearch] = useState<string>('');

  const customer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // All transactions strictly for this customer
  const customerHistory = transactions
    .filter((t) => t.customerId === customer.id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const filteredHistory = customerHistory.filter((t) => {
    if (!txnSearch) return true;
    const q = txnSearch.toLowerCase();
    return (
      t.merchantName.toLowerCase().includes(q) ||
      t.merchantCategory.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  // Category distribution for pie chart
  const categoryData = customer.frequentCategories.map((c) => ({
    name: c.category,
    value: Math.round(c.frequency * 100),
  }));

  const COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Behavioral Profiles & Memory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customer-specific historical baselines, spending distributions, active diurnal hours, and cold-start governance.
          </p>
        </div>

        {/* Customer Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Customer Profile:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-medium"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id}) {c.isColdStart ? '— Cold Start' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cold Start Notice */}
      {customer.isColdStart && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300">
              Cold-Start Account (Account age: {customer.accountAgeDays} days · {customer.totalHistoricalTxns} prior transaction)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When an account has fewer than 3 historical transactions, the framework applies conservative population priors (neutral behavioral risk score B=0.38, moderate threshold τ=0.45) rather than inventing ungrounded assumptions.
            </p>
          </div>
        </div>
      )}

      {/* Customer Baseline KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span className="font-mono text-indigo-400 font-bold">₹</span>
            <span>Historical Mean</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ₹{customer.historicalMeanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Std Dev: <span className="font-mono">₹{customer.historicalStdAmount.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span className="font-mono text-indigo-400 font-bold">₹</span>
            <span>Historical Median</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ₹{(customer.historicalMedianAmount || customer.historicalMeanAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Robust central tendency
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Historical Peak Spend</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ₹{customer.historicalMaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">
            Recorded ceiling
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Account Maturity</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {customer.accountAgeDays} <span className="text-sm font-normal text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {customer.totalHistoricalTxns} lifetime transactions
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Diurnal Window</span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {customer.typicalHoursRange[0]}:00 – {customer.typicalHoursRange[1]}:00
          </div>
          <div className="text-[11px] text-slate-400">
            Indian Standard Time (IST)
          </div>
        </div>
      </div>

      {/* Behavioral Footprint: Categories & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Frequent Categories Distribution */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                <span>Habitual Merchant Categories</span>
              </h3>
              <p className="text-xs text-slate-400">
                Percentage breakdown of past transaction merchant domains.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      fontSize: '11px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [`${val}%`, 'Frequency']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {customer.frequentCategories.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-300 truncate max-w-[170px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate">{c.category}</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    {(c.frequency * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Established Locations Pattern */}
        <div className="lg:col-span-6 p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Established Geographic Baseline</span>
          </h3>
          <p className="text-xs text-slate-400">
            Historical transaction location distribution used to compute spatial distance deviations.
          </p>

          <div className="space-y-3 pt-2">
            {customer.frequentLocations.map((loc, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-mono text-xs flex items-center justify-center font-bold">
                    {loc.country}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{loc.location}</div>
                    <div className="text-[11px] text-slate-400">
                      Country ISO: {loc.country} · Regular Home Territory
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-indigo-400">
                    {(loc.frequency * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-slate-400">Frequency</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Transactions Log Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Historical Transaction Ledger</span>
            </h3>
            <p className="text-xs text-slate-400">
              Complete chronological audit trail for {customer.name}.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical records..."
              value={txnSearch}
              onChange={(e) => setTxnSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Txn ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-sans">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No historical transactions found for this customer.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-indigo-400 font-medium">
                      {t.id}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">
                      {t.merchantName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {t.merchantCategory}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {t.location}, {t.country}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-100">
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {t.historicalClassification || 'Verified Normal'}
                      </span>
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
