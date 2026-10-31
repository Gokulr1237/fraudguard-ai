
import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './components/pages/DashboardPage';
import { AnalyzeTransactionPage } from './components/pages/AnalyzeTransactionPage';
import { CustomerBehaviorPage } from './components/pages/CustomerBehaviorPage';
import { FraudAlertsPage } from './components/pages/FraudAlertsPage';
import { ModelExplainabilityPage } from './components/pages/ModelExplainabilityPage';
import { ExperimentsPage } from './components/pages/ExperimentsPage';
import { SettingsPage } from './components/pages/SettingsPage';

import type {
  AnalysisResult,
  CustomerProfile,
  EnsembleWeights,
  ImbalanceBenchmark,
  MetricSummary,
  ThresholdConfig,
  Transaction,
} from './types/fraud';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed: ${url} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricSummary | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentEvaluations, setRecentEvaluations] = useState<AnalysisResult[]>([]);
  const [benchmarks, setBenchmarks] = useState<ImbalanceBenchmark[]>([]);

  const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfig>({
    alpha: 0.65,
    b1: 0.35,
    b2: 0.70,
    tauLow: 0.25,
    tauMid: 0.45,
    tauHigh: 0.65,
    fixedBaseline: 0.50,
  });

  const [ensembleWeights, setEnsembleWeights] = useState<EnsembleWeights>({
    wLR: 0.20,
    wRF: 0.40,
    wXGB: 0.40,
  });

  const [selectedResult, setSelectedResult] =
    useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [
        statusRes,
        metricsRes,
        customersRes,
        txnsRes,
        benchmarksRes,
        thresholdRes,
        ensembleRes,
      ] = await Promise.all([
        fetchJson<any>('/api/status'),
        fetchJson<MetricSummary>('/api/metrics'),
        fetchJson<CustomerProfile[]>('/api/customers'),
        fetchJson<{ transactions: AnalysisResult[] }>('/api/transactions'),
        fetchJson<ImbalanceBenchmark[]>('/api/benchmarks'),
        fetchJson<ThresholdConfig>('/api/threshold-config'),
        fetchJson<EnsembleWeights>('/api/ensemble-config'),
      ]);

      setSystemStatus(statusRes);
      setMetrics(metricsRes);
      setCustomers(customersRes);
      setBenchmarks(benchmarksRes);
      setThresholdConfig(thresholdRes);
      setEnsembleWeights(ensembleRes);

      const transactions = Array.isArray(txnsRes.transactions)
        ? txnsRes.transactions
        : [];

      setRecentEvaluations(transactions);
      setAllTransactions(
        transactions
          .map((item) => item.transaction)
          .filter((item): item is Transaction => Boolean(item)),
      );
      setSelectedResult(transactions[0] ?? null);
    } catch (error) {
      console.error('Error loading FraudGuard data:', error);
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Unable to load application data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleAnalyzeTransaction = async (
    txData: any,
  ): Promise<AnalysisResult> => {
    const result = await fetchJson<AnalysisResult>(
      '/api/analyze-transaction',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      },
    );

    setSelectedResult(result);
    setRecentEvaluations((previous) => [result, ...previous]);

    if (result.transaction) {
      setAllTransactions((previous) => [result.transaction, ...previous]);
    }

    try {
      const updatedMetrics = await fetchJson<MetricSummary>('/api/metrics');
      setMetrics(updatedMetrics);
    } catch (error) {
      console.error('Unable to refresh metrics:', error);
    }

    return result;
  };

  const handleUpdateThresholdConfig = async (
    newConfig: ThresholdConfig,
  ) => {
    const data = await fetchJson<{ config: ThresholdConfig }>(
      '/api/threshold-config',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      },
    );

    setThresholdConfig(data.config);
  };

  const handleUpdateEnsembleWeights = async (
    newWeights: EnsembleWeights,
  ) => {
    const data = await fetchJson<{ weights: EnsembleWeights }>(
      '/api/ensemble-config',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWeights),
      },
    );

    setEnsembleWeights(data.weights);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          systemStatus={systemStatus}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[500px] text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading FraudGuard AI...</span>
              </div>
            </div>
          ) : loadError ? (
            <div className="max-w-2xl mx-auto mt-12 rounded-xl border border-red-500/30 bg-red-950/30 p-6">
              <h2 className="text-lg font-semibold text-red-300">
                Unable to load application data
              </h2>
              <p className="mt-2 text-sm text-slate-300">{loadError}</p>
              <p className="mt-2 text-sm text-slate-400">
                Check that the backend is running and its API routes match
                the routes configured in this application.
              </p>
              <button
                type="button"
                onClick={() => void loadInitialData()}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardPage
                  metrics={metrics}
                  recentTransactions={recentEvaluations}
                  onSelectTransaction={(result) => {
                    setSelectedResult(result);
                    setCurrentView('analyze');
                  }}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'analyze' && (
                <AnalyzeTransactionPage
                  customers={customers}
                  onAnalyze={handleAnalyzeTransaction}
                  currentResult={selectedResult}
                  onNavigateToShap={(result) => {
                    setSelectedResult(result);
                    setCurrentView('model-explainability');
                  }}
                />
              )}

              {currentView === 'customer-behavior' && (
                <CustomerBehaviorPage
                  customers={customers}
                  transactions={allTransactions}
                  onSelectCustomerTxnForAnalysis={() => {
                    setCurrentView('analyze');
                  }}
                  onNavigateToAnalyze={() => setCurrentView('analyze')}
                />
              )}

              {currentView === 'fraud-alerts' && (
                <FraudAlertsPage
                  recentTransactions={recentEvaluations}
                  onSelectAlert={(result) => {
                    setSelectedResult(result);
                    setCurrentView('analyze');
                  }}
                  onNavigateToAnalyze={() => setCurrentView('analyze')}
                />
              )}

              {currentView === 'model-explainability' && (
                <ModelExplainabilityPage
                  currentResult={selectedResult}
                  recentTransactions={recentEvaluations}
                  onSelectResult={setSelectedResult}
                  onNavigateToAnalyze={() => setCurrentView('analyze')}
                />
              )}

              {currentView === 'experiments' && (
                <ExperimentsPage
                  weights={ensembleWeights}
                  benchmarks={benchmarks}
                  onUpdateWeights={handleUpdateEnsembleWeights}
                />
              )}

              {currentView === 'settings' && (
                <SettingsPage
                  config={thresholdConfig}
                  onUpdateConfig={handleUpdateThresholdConfig}
                  recentTransactions={recentEvaluations}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
