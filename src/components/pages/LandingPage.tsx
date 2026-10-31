import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sliders,
  Sparkles,
  Database,
  GitBranch,
  Eye,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  Binary,
  RotateCcw,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  // Interactive Machine Simulation Sandbox State
  const [activeVector, setActiveVector] = useState<'tokyo' | 'grocery' | 'midnight'>('tokyo');

  // Pre-computed machine states for the live visualizer
  const machineStates = {
    tokyo: {
      title: 'Overseas Geographic Anomaly (Tokyo, JP)',
      cardholder: 'Ananya Sharma (Bengaluru, KA)',
      amount: '₹2,35,000.00',
      bScore: 0.89,
      bBand: 'High Risk',
      pLR: 0.82,
      pRF: 0.94,
      pXGB: 0.96,
      pEns: 0.924,
      fusedScore: 0.912,
      adaptiveThreshold: 0.25,
      fixedThreshold: 0.50,
      decision: 'Fraud Alert Flagged',
      isAlert: true,
      topShap: [
        { name: 'amount_dev_hist_mean', push: '+5.81σ (+32.4%)', type: 'risk' },
        { name: 'location_deviation', push: 'Tokyo, JP foreign (+28.2%)', type: 'risk' },
        { name: 'channel_card_present', push: 'CNP E-Commerce (+4.5%)', type: 'risk' },
      ],
      machineReasoning:
        'The Explainable Adaptive Machine detected a severe 5.8σ amount anomaly and international country deviation. High behavioral risk (B=0.89) lowered the adaptive threshold to 0.25, triggering an early investigative alert.',
    },
    grocery: {
      title: 'Routine Supermarket Spend (Indiranagar, Bengaluru)',
      cardholder: 'Ananya Sharma (Bengaluru, KA)',
      amount: '₹3,950.00',
      bScore: 0.08,
      bBand: 'Low Risk',
      pLR: 0.03,
      pRF: 0.01,
      pXGB: 0.02,
      pEns: 0.019,
      fusedScore: 0.040,
      adaptiveThreshold: 0.65,
      fixedThreshold: 0.50,
      decision: 'Cleared (Legitimate)',
      isAlert: false,
      topShap: [
        { name: 'location_deviation', push: 'Indiranagar domestic (-18.2%)', type: 'safe' },
        { name: 'channel_card_present', push: 'RuPay chip POS (-14.0%)', type: 'safe' },
        { name: 'amount_dev_hist_mean', push: 'Aligned with μ_hist (-8.5%)', type: 'safe' },
      ],
      machineReasoning:
        'Benign customer habit history elevated the machine decision threshold to 0.65. Combined fused score (S=0.040) remains well below cutoff, guaranteeing zero false alarm customer friction.',
    },
    midnight: {
      title: 'Subtle Midnight Micro-Burst (Pune, MH)',
      cardholder: 'Priya Patel (Pune, MH)',
      amount: '₹7,200.00 (x3 burst)',
      bScore: 0.78,
      bBand: 'High Risk',
      pLR: 0.36,
      pRF: 0.44,
      pXGB: 0.45,
      pEns: 0.428,
      fusedScore: 0.551,
      adaptiveThreshold: 0.25,
      fixedThreshold: 0.50,
      decision: 'Caught by Adaptive (Missed by Fixed)',
      isAlert: true,
      topShap: [
        { name: 'time_since_last_txn', push: '4m rapid burst (+22.8%)', type: 'risk' },
        { name: 'hour_deviation', push: '03:30 AM IST off-hour (+18.4%)', type: 'risk' },
        { name: 'merchant_cat_deviation', push: 'Gaming in-app currency (+8.1%)', type: 'risk' },
      ],
      machineReasoning:
        'Fixed 0.50 cutoff missed this transaction (P_ens=0.428). The Explainable Adaptive Machine factored in 3:30 AM IST velocity, driving B(x)=0.78 and lowering the threshold to 0.25, successfully intercepting the attack.',
    },
  };

  const curr = machineStates[activeVector];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Explainable Adaptive Machine · Next-Generation Decision Framework
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Explainable Adaptive Machine
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Detect suspicious credit card activity by modeling customer-specific temporal behavior, fusing soft-voting ensemble probabilities, dynamically adapting risk thresholds, and providing transparent SHAP explanations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('analyze')}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Analyze Transaction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-all cursor-pointer"
              >
                Open Analytics Dashboard
              </button>
              <button
                onClick={() => onNavigate('experiments')}
                className="px-5 py-2.5 rounded-lg bg-transparent hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 font-medium text-sm transition-all cursor-pointer"
              >
                Explore Ensemble Experiments
              </button>
            </div>

            {/* Quiet metadata strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
              <span>Behavioral Temporal Memory</span>
              <span aria-hidden="true">·</span>
              <span>Soft-Voting Ensemble (LR + RF + XGB)</span>
              <span aria-hidden="true">·</span>
              <span>Dynamic Threshold Governor τ(B)</span>
              <span aria-hidden="true">·</span>
              <span>TreeSHAP Attribution Core</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl aspect-[16/9] lg:aspect-auto lg:h-[340px]">
              <img
                src="/src/assets/images/fraudguard_hero_neural_1792829868328.jpg"
                alt="FraudGuard AI Decision Manifold"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.classList.add(
                      'flex',
                      'items-center',
                      'justify-center',
                      'bg-gradient-to-tr',
                      'from-slate-950',
                      'to-indigo-950'
                    );
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-xs text-slate-300 bg-slate-950/80 backdrop-blur-sm p-2 rounded-lg border border-slate-800">
                <span className="font-semibold text-white">Machine Manifold:</span> Real-time risk fusion S(x) across behavioral deviation vectors and ensemble models.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Machine State Sandbox */}
      <section className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive Machine Demonstration</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Live Explainable Adaptive Machine Signal Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an operational scenario to view how the Explainable Adaptive Machine dynamically computes behavioral risk, fuses probabilities, shifts thresholds, and generates SHAP attributions.
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveVector('tokyo')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeVector === 'tokyo'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tokyo Overseas Anomaly
            </button>
            <button
              onClick={() => setActiveVector('midnight')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeVector === 'midnight'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Midnight Micro-Burst
            </button>
            <button
              onClick={() => setActiveVector('grocery')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                activeVector === 'grocery'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bengaluru D-Mart Grocery
            </button>
          </div>
        </div>

        {/* Live Machine State Display Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-xl bg-slate-950 border border-slate-800">
          {/* Left Column: Machine Gauges */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">{curr.title}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Cardholder: {curr.cardholder} · Value: <strong className="text-white">{curr.amount}</strong>
                </div>
              </div>
              <div
                className={`text-xs font-bold font-mono px-3 py-1 rounded-lg border ${
                  curr.isAlert
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                }`}
              >
                {curr.decision}
              </div>
            </div>

            {/* 4 Machine Telemetry Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                <div className="text-[11px] text-slate-400">Behavioral B(x)</div>
                <div className="font-mono font-bold text-base text-amber-400 tabular-nums">
                  {curr.bScore.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">{curr.bBand}</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                <div className="text-[11px] text-slate-400">Ensemble P_ens</div>
                <div className="font-mono font-bold text-base text-indigo-400 tabular-nums">
                  {(curr.pEns * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400">LR+RF+XGB soft-vote</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                <div className="text-[11px] text-slate-400">Fused S(x)</div>
                <div className="font-mono font-bold text-base text-white tabular-nums">
                  {curr.fusedScore.toFixed(3)}
                </div>
                <div className="text-[10px] text-slate-400">α=0.65 weighted</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
                <div className="text-[11px] text-slate-400">Adaptive τ(B)</div>
                <div className="font-mono font-bold text-base text-cyan-400 tabular-nums">
                  {curr.adaptiveThreshold.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400">Fixed: {curr.fixedThreshold.toFixed(2)}</div>
              </div>
            </div>

            {/* Natural Machine Reasoning */}
            <div className="p-3.5 bg-slate-900/70 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Machine Operational Logic: </span>
              {curr.machineReasoning}
            </div>
          </div>

          {/* Right Column: SHAP Local Waterfall Attribution */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-indigo-400" />
                <span>TreeSHAP Local Attributions</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Additive φ_i</span>
            </div>

            <div className="space-y-2.5">
              {curr.topShap.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-300">{s.name}</span>
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        s.type === 'risk' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.push}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.type === 'risk' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Target: P_ens probability</span>
              <button
                onClick={() => onNavigate('analyze')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Run full pipeline</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Core Methodology Pillars */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            The Explainable Adaptive Machine: Four Integrated Sub-Engines
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            An end-to-end framework combining customer temporal behavioral features, soft-voting ensemble learning, adaptive risk thresholding, and Shapley attribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white">
                Customer Behavioral Deviation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintains customer temporal memory strictly using transactions prior to the current timestamp. Computes standardized deviations for transaction value (Z-score), velocity (recency & 24h frequency), merchant category entropy, and geographic movement.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>amount_dev_hist_mean = (amount - μ_hist) / σ_hist</div>
              <div>time_since_last_txn = Δt(t_curr - t_prev)</div>
              <div>B(x_t) = Explicit behavioral risk score ∈ [0, 1]</div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white">
                Soft-Voting Classifier Ensemble
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Combines Logistic Regression (linear calibration), Random Forest (orthogonal decision trees), and XGBoost (gradient-boosted residual learners) using calibrated non-negative weights that sum to unity.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>P_ens = w_LR · P_lr + w_RF · P_rf + w_XGB · P_xgb</div>
              <div>Default Weights: w_LR=0.20, w_RF=0.40, w_XGB=0.40</div>
              <div>Trained with Cost-Sensitive Class Balancing</div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white">
                Behavioral-Risk-Dependent Adaptive Thresholds
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dynamically scales the decision threshold based on customer behavioral risk B(x_t). High behavioral deviations lower the alert threshold (increasing sensitivity), while benign profiles elevate the threshold (suppressing false positives).
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>S(x_t) = α · P_ens + (1 - α) · B(x_t)</div>
              <div>τ(B) = 0.65 if B ≤ 0.35; 0.45 if 0.35 &lt; B ≤ 0.70; 0.25 if B &gt; 0.70</div>
              <div>Alert Condition: S(x_t) ≥ τ(B)</div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-colors space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-lg font-semibold text-white">
                Interpretable Explainable AI via TreeSHAP
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Computes game-theoretic Shapley additive feature values for each transaction. Gives human fraud investigators clear waterfall visualizations showing exact positive (risk-elevating) and negative (risk-mitigating) feature contributions.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>f(x) = E[f(x)] + ∑ φ_i</div>
              <div>φ_i: Marginal Shapley value for feature i</div>
              <div>Human readable reasoning without black-box confusion</div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline Flow Diagram */}
      <section className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Explainable Adaptive Machine Execution Pipeline
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Execution sequence for incoming transactions from card payment gateway to operational fraud alert.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 1</div>
            <div className="text-xs font-semibold text-white">Incoming Txn</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Cardholder, amount in ₹, timestamp, location, MCC & channel.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 2</div>
            <div className="text-xs font-semibold text-white">Temporal Lookup</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Strictly prior transactions (t_prior &lt; t_curr).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 3</div>
            <div className="text-xs font-semibold text-white">Deviations Extractor</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Z-score, velocity, category & geo anomaly metrics.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 4</div>
            <div className="text-xs font-semibold text-white">Ensemble Voting</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Soft-voting fusion of LR, RF, and XGB probabilities.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 5</div>
            <div className="text-xs font-semibold text-white">Adaptive Threshold</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Calculates S(x) and evaluates τ(B) risk band cutoff.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono text-indigo-400 font-semibold">Stage 6</div>
            <div className="text-xs font-semibold text-white">SHAP Explainer</div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Additive Shapley attribution & plain-language report.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Ethical AI & Compliance Boundary:</strong> A model-generated fraud alert serves as an analytical decision-support signal for human security operations. It does not automatically decline payments, freeze customer assets, or replace regulatory dispute procedures.
          </p>
        </div>
      </section>
    </div>
  );
};
