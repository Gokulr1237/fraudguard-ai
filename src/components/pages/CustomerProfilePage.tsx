import React, { useState } from 'react';
import {
  User,
  Clock,
  MapPin,
  Tag,
  DollarSign,
  AlertCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
  History,
} from 'lucide-react';
import { CustomerProfile, Transaction } from '../../types/fraud';

interface CustomerProfilePageProps {
  customers: CustomerProfile[];
  transactions: Transaction[];
  onSelectCustomerTxnForAnalysis: (tx: Transaction) => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  customers,
  transactions,
  onSelectCustomerTxnForAnalysis,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || 'CUST_1001'
  );

  const customer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Eligible history (guaranteed strictly recorded past transactions)
  const customerHistory = transactions
    .filter((t) => t.customerId === customer.id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Behavioral Profiles & Memory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Temporal baselines, spending distributions, and cold-start governance.
          </p>
        </div>

        {/* Customer Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Select Profile:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id}) {c.isColdStart ? '— Cold Start' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cold Start Guardrail Warning */}
      {customer.isColdStart && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 text-xs text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300">
              Cold-Start Account (Insufficient History: {customer.totalHistoricalTxns} prior txn)
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              When an account has fewer than 3 historical transactions, the framework applies conservative population priors (neutral behavioral score B=0.38, moderate threshold τ=0.45) rather than inventing ungrounded assumptions.
            </p>
          </div>
        </div>
      )}

      {/* Customer Baseline KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span className="font-mono text-indigo-400 font-bold">₹</span>
            <span>Historical Mean (μ_hist)</span>
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
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Historical Max (max_hist)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            ₹{customer.historicalMaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400">Peak legitimate spend</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Hours Range</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {customer.typicalHoursRange[0]}:00 - {customer.typicalHoursRange[1]}:00
          </div>
          <div className="text-[11px] text-slate-400">Habitual diurnal window</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>Historical Depth</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {customer.totalHistoricalTxns} txns
          </div>
          <div className="text-[11px] text-slate-400">
            Account age: {customer.accountAgeDays} days
          </div>
        </div>
      </div>

      {/* Historical Distributions: Categories & Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frequent Categories */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Frequent Merchant Categories</span>
          </h3>

          <div className="space-y-3">
            {customer.frequentCategories.length === 0 ? (
              <div className="text-xs text-slate-400">No category history recorded yet.</div>
            ) : (
              customer.frequentCategories.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200">{cat.category}</span>
                    <span className="font-mono text-indigo-400 tabular-nums">
                      {(cat.frequency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${cat.frequency * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Frequent Locations */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span>Frequent Locations & Countries</span>
          </h3>

          <div className="space-y-3">
            {customer.frequentLocations.length === 0 ? (
              <div className="text-xs text-slate-400">No location history recorded yet.</div>
            ) : (
              customer.frequentLocations.map((loc, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200">
                      {loc.location} ({loc.country})
                    </span>
                    <span className="font-mono text-indigo-400 tabular-nums">
                      {(loc.frequency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${loc.frequency * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Strictly Prior Transaction History Feed */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Customer Historical Records (Strict Temporal Safety)
            </h3>
            <p className="text-xs text-slate-400">
              Only past transactions stored in chronological order. Future events are strictly unreachable by the behavioral extractor.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {customerHistory.length} recorded items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Date & Time (UTC)</th>
                <th className="py-2.5 px-3">Merchant</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {customerHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No prior transactions on record for this customer.
                  </td>
                </tr>
              ) : (
                customerHistory.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 font-mono text-slate-400">
                      {new Date(t.timestamp).toLocaleDateString()} ·{' '}
                      {new Date(t.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 px-3 font-medium text-white">{t.merchantName}</td>
                    <td className="py-2 px-3 text-slate-300">{t.merchantCategory}</td>
                    <td className="py-2 px-3 text-slate-300">
                      {t.location}, {t.country}
                    </td>
                    <td className="py-2 px-3 text-slate-400 capitalize">
                      {t.channel.replace('_', ' ')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-white tabular-nums">
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onSelectCustomerTxnForAnalysis(t)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-xs cursor-pointer"
                      >
                        Inspect &rarr;
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
