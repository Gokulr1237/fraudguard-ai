/**
 * FraudGuard AI - Full-Stack Express Server with Machine Learning Pipeline
 * Provides real backend inference, customer behavioral memory, soft-voting ensemble,
 * adaptive threshold optimization, and SHAP explainability.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  AnalysisResult,
  CustomerProfile,
  EnsembleWeights,
  ThresholdConfig,
  Transaction,
} from './src/types/fraud';
import {
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTION_HISTORY,
  INITIAL_EVALUATION_CANDIDATES,
  IMBALANCE_BENCHMARKS,
  computeAggregatedMetrics,
  evaluatedTransactionsStore,
} from './server/data_store';
import {
  extractBehavioralDeviations,
  predictLogisticRegression,
  predictRandomForest,
  predictXGBoost,
  computeEnsembleProbability,
  computeBehavioralRiskScore,
  computeAdaptiveDecision,
  computeShapExplanation,
  generateDeviationReasons,
  generateComparisonRows,
  computeCustomerHistorySummary,
} from './server/ml_engine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory repositories
let customers: CustomerProfile[] = [...INITIAL_CUSTOMERS];
let transactionHistory: Transaction[] = [...INITIAL_TRANSACTION_HISTORY];

// Default configurations
let currentThresholdConfig: ThresholdConfig = {
  alpha: 0.65, // Fusion weight: S = 0.65*P_ens + 0.35*B(x)
  b1: 0.35,    // Low/Medium breakpoint
  b2: 0.70,    // Medium/High breakpoint
  tauLow: 0.25, // Threshold for High behavioral risk
  tauMid: 0.45, // Threshold for Medium behavioral risk
  tauHigh: 0.65, // Threshold for Low behavioral risk
  fixedBaseline: 0.50, // Standard fixed threshold baseline
};

let currentEnsembleWeights: EnsembleWeights = {
  wLR: 0.20,
  wRF: 0.40,
  wXGB: 0.40,
};

// Seed initial evaluated transactions from customer transaction dataset
function seedEvaluatedTransactions() {
  if (evaluatedTransactionsStore.length === 0) {
    for (const cand of INITIAL_EVALUATION_CANDIDATES) {
      const tx: Transaction = {
        ...cand,
      };
      const customer =
        customers.find((c) => c.id === tx.customerId) || customers[0];
      const devs = extractBehavioralDeviations(tx, customer, transactionHistory);
      const pLR = predictLogisticRegression(tx, devs);
      const pRF = predictRandomForest(tx, devs);
      const pXGB = predictXGBoost(tx, devs);
      const pEns = computeEnsembleProbability(pLR, pRF, pXGB, currentEnsembleWeights);
      const { score: bScore, band: bBand } = computeBehavioralRiskScore(devs);
      const decision = computeAdaptiveDecision(pEns, bScore, currentThresholdConfig);
      const shap = computeShapExplanation(tx, devs, pEns);
      const reasons = generateDeviationReasons(tx, customer, devs, transactionHistory);
      const compRows = generateComparisonRows(tx, customer, devs, transactionHistory);
      const custHistSum = computeCustomerHistorySummary(customer, transactionHistory, tx.timestamp);
      const histTxns = transactionHistory
        .filter((t) => t.customerId === customer.id && new Date(t.timestamp).getTime() < new Date(tx.timestamp).getTime())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const result: AnalysisResult = {
        transaction: tx,
        behavioralDeviations: devs,
        behavioralRiskScore: bScore,
        behavioralRiskBand: bBand,
        modelProbabilities: {
          logisticRegression: pLR,
          randomForest: pRF,
          xgboost: pXGB,
          ensemble: pEns,
        },
        ensembleWeights: { ...currentEnsembleWeights },
        fusedScore: decision.fusedScore,
        applicableThreshold: decision.applicableThreshold,
        fixedThreshold: currentThresholdConfig.fixedBaseline,
        isAdaptiveAlert: decision.isAdaptiveAlert,
        isFixedAlert: decision.isFixedAlert,
        thresholdDiffReason: decision.thresholdDiffReason,
        shapExplanation: shap,
        deviationReasons: reasons,
        comparisonRows: compRows,
        customerHistorySummary: custHistSum,
        historicalTransactions: histTxns,
        pipelineMode: 'live',
        modelVersion: 'FraudGuard-Adaptive-v2.4',
        timestamp: new Date().toISOString(),
      };

      evaluatedTransactionsStore.unshift(result);
    }
  }
}

seedEvaluatedTransactions();

// ======================== API ROUTES ========================

// System status
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    pipelineMode: 'live',
    modelVersion: 'FraudGuard-Adaptive-v2.4',
    featuresCount: 16,
    modelsLoaded: ['LogisticRegression_v2', 'RandomForest_v2', 'XGBoost_v2'],
    explainerLoaded: 'TreeSHAP_v0.44',
    database: 'SQLite / In-Memory Behavioral Log',
    totalTrainedRecords: 284807,
  });
});

// Customers
app.get('/api/customers', (_req: Request, res: Response) => {
  res.json(customers);
});

// Single Customer + History
app.get('/api/customers/:id', (req: Request, res: Response) => {
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  const history = transactionHistory.filter((t) => t.customerId === customer.id);
  res.json({ customer, history });
});

// Scenarios route deprecated: returns empty array
app.get('/api/scenarios', (_req: Request, res: Response) => {
  res.json([]);
});

// Benchmarks
app.get('/api/benchmarks', (_req: Request, res: Response) => {
  res.json(IMBALANCE_BENCHMARKS);
});

// Dashboard Metrics
app.get('/api/metrics', (_req: Request, res: Response) => {
  const metrics = computeAggregatedMetrics();
  res.json(metrics);
});

// Analyzed Transactions Log
app.get('/api/transactions', (req: Request, res: Response) => {
  let list = [...evaluatedTransactionsStore];
  const { riskBand, alertOnly, customerId, search } = req.query;

  if (riskBand && typeof riskBand === 'string') {
    list = list.filter((item) => item.behavioralRiskBand === riskBand);
  }
  if (alertOnly === 'true') {
    list = list.filter((item) => item.isAdaptiveAlert);
  }
  if (customerId && typeof customerId === 'string') {
    list = list.filter((item) => item.transaction.customerId === customerId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.transaction.merchantName.toLowerCase().includes(q) ||
        item.transaction.location.toLowerCase().includes(q) ||
        item.transaction.id.toLowerCase().includes(q)
    );
  }

  res.json({
    total: list.length,
    transactions: list.slice(0, 50),
  });
});

// Main Inference Execution: Analyze Transaction
app.post('/api/analyze-transaction', (req: Request, res: Response) => {
  try {
    const {
      customerId,
      amount,
      currency = 'INR',
      timestamp,
      merchantCategory,
      merchantName,
      location,
      country,
      cardPresent = true,
      channel = 'in_store',
      deviceFingerprint = 'DEV_BROWSER_INSPECTED',
    } = req.body;

    if (!customerId || amount === undefined || !merchantCategory || !location) {
      return res.status(400).json({
        error:
          'Missing required transaction fields: customerId, amount, merchantCategory, location',
      });
    }

    // Lookup customer or create cold start profile if unknown
    let foundCustomer = customers.find((c) => c.id === customerId);
    if (!foundCustomer) {
      foundCustomer = {
        id: customerId,
        name: `Cardholder (${customerId})`,
        accountAgeDays: 1,
        totalHistoricalTxns: 0,
        historicalMeanAmount: 4000.0,
        historicalMedianAmount: 4000.0,
        historicalStdAmount: 2000.0,
        historicalMaxAmount: 4000.0,
        frequentCategories: [],
        frequentLocations: [{ location: 'Bengaluru, KA', country: 'IN', frequency: 1.0 }],
        typicalHoursRange: [9, 21],
        isColdStart: true,
      };
      customers.push(foundCustomer);
    }
    const customer: CustomerProfile = foundCustomer;

    const tx: Transaction = {
      id: `TX_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customerId,
      amount: parseFloat(amount),
      currency,
      timestamp: timestamp || new Date().toISOString(),
      merchantCategory,
      merchantName: merchantName || 'Unspecified Merchant',
      location,
      country: country || 'IN',
      cardPresent: Boolean(cardPresent),
      channel,
      deviceFingerprint,
    };

    // 1. Behavioral features extraction with strict temporal safety
    const devs = extractBehavioralDeviations(tx, customer, transactionHistory);

    // 2. Individual ML models execution
    const pLR = predictLogisticRegression(tx, devs);
    const pRF = predictRandomForest(tx, devs);
    const pXGB = predictXGBoost(tx, devs);

    // 3. Soft-Voting Probability Fusion
    const pEns = computeEnsembleProbability(pLR, pRF, pXGB, currentEnsembleWeights);

    // 4. Explicit Behavioral Risk Score B(x_t)
    const { score: bScore, band: bBand } = computeBehavioralRiskScore(devs);

    // 5. Adaptive Threshold Fusion S(x_t) & Decision tau(B)
    const decision = computeAdaptiveDecision(
      pEns,
      bScore,
      currentThresholdConfig
    );

    // 6. SHAP Explanations
    const shap = computeShapExplanation(tx, devs, pEns);

    // 7. Evidence-based deviation explanations in simple English
    const reasons = generateDeviationReasons(tx, customer, devs, transactionHistory);

    // 8. Normal vs Current comparison matrix
    const compRows = generateComparisonRows(tx, customer, devs, transactionHistory);

    // 9. Customer history summary strictly prior to this transaction
    const custHistSum = computeCustomerHistorySummary(customer, transactionHistory, tx.timestamp);

    // 10. Prior historical transactions for this customer
    const histTxns = transactionHistory
      .filter((t) => t.customerId === customer.id && new Date(t.timestamp).getTime() < new Date(tx.timestamp).getTime())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const result: AnalysisResult = {
      transaction: tx,
      behavioralDeviations: devs,
      behavioralRiskScore: bScore,
      behavioralRiskBand: bBand,
      modelProbabilities: {
        logisticRegression: pLR,
        randomForest: pRF,
        xgboost: pXGB,
        ensemble: pEns,
      },
      ensembleWeights: { ...currentEnsembleWeights },
      fusedScore: decision.fusedScore,
      applicableThreshold: decision.applicableThreshold,
      fixedThreshold: currentThresholdConfig.fixedBaseline,
      isAdaptiveAlert: decision.isAdaptiveAlert,
      isFixedAlert: decision.isFixedAlert,
      thresholdDiffReason: decision.thresholdDiffReason,
      shapExplanation: shap,
      deviationReasons: reasons,
      comparisonRows: compRows,
      customerHistorySummary: custHistSum,
      historicalTransactions: histTxns,
      pipelineMode: 'live',
      modelVersion: 'FraudGuard-Adaptive-v2.4',
      timestamp: new Date().toISOString(),
    };

    // Store in evaluated transactions
    evaluatedTransactionsStore.unshift(result);
    // Keep max 100 in recent memory
    if (evaluatedTransactionsStore.length > 100) {
      evaluatedTransactionsStore.pop();
    }

    // Add to customer's history for subsequent transactions
    transactionHistory.push(tx);

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal inference failure' });
  }
});

// Alias for analyze transaction
app.post('/api/transactions/analyze', (req: Request, res: Response) => {
  // Delegate to /api/analyze-transaction handler logic
  (app._router.handle as any)({ ...req, url: '/api/analyze-transaction', method: 'POST' }, res);
});

// Customer specific history route strictly prior to a given timestamp or now
app.get('/api/customers/:id/transactions', (req: Request, res: Response) => {
  const { id } = req.params;
  const { beforeTimestamp } = req.query;
  const cutoff = beforeTimestamp ? new Date(beforeTimestamp as string).getTime() : Date.now();
  const txns = transactionHistory
    .filter((t) => t.customerId === id && new Date(t.timestamp).getTime() < cutoff)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ customerId: id, total: txns.length, transactions: txns });
});

// Customer behavioral profile summary strictly prior to current moment
app.get('/api/customers/:id/behavior', (req: Request, res: Response) => {
  const { id } = req.params;
  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  const summary = computeCustomerHistorySummary(customer, transactionHistory);
  res.json({ customer, summary });
});

// Threshold configuration
app.get('/api/threshold-config', (_req: Request, res: Response) => {
  res.json(currentThresholdConfig);
});

app.post('/api/threshold-config', (req: Request, res: Response) => {
  const { alpha, b1, b2, tauLow, tauMid, tauHigh, fixedBaseline } = req.body;
  if (alpha !== undefined) currentThresholdConfig.alpha = parseFloat(alpha);
  if (b1 !== undefined) currentThresholdConfig.b1 = parseFloat(b1);
  if (b2 !== undefined) currentThresholdConfig.b2 = parseFloat(b2);
  if (tauLow !== undefined) currentThresholdConfig.tauLow = parseFloat(tauLow);
  if (tauMid !== undefined) currentThresholdConfig.tauMid = parseFloat(tauMid);
  if (tauHigh !== undefined) currentThresholdConfig.tauHigh = parseFloat(tauHigh);
  if (fixedBaseline !== undefined)
    currentThresholdConfig.fixedBaseline = parseFloat(fixedBaseline);

  res.json({
    success: true,
    config: currentThresholdConfig,
    message: 'Adaptive threshold parameters successfully updated.',
  });
});

// Ensemble weights configuration
app.get('/api/ensemble-config', (_req: Request, res: Response) => {
  res.json(currentEnsembleWeights);
});

app.post('/api/ensemble-config', (req: Request, res: Response) => {
  const { wLR, wRF, wXGB } = req.body;
  if (wLR !== undefined && wRF !== undefined && wXGB !== undefined) {
    const total = parseFloat(wLR) + parseFloat(wRF) + parseFloat(wXGB);
    if (Math.abs(total - 1.0) > 0.05) {
      return res.status(400).json({
        error: `Model weights must sum to 1.0 (current sum: ${total.toFixed(2)})`,
      });
    }
    currentEnsembleWeights = {
      wLR: parseFloat(wLR),
      wRF: parseFloat(wRF),
      wXGB: parseFloat(wXGB),
    };
  }
  res.json({
    success: true,
    weights: currentEnsembleWeights,
    message: 'Ensemble model soft-voting weights updated.',
  });
});

// Reset / Seed evaluated transactions from connected customer dataset
app.post('/api/seed-evaluate-presets', (_req: Request, res: Response) => {
  evaluatedTransactionsStore.length = 0;
  seedEvaluatedTransactions();
  res.json({
    success: true,
    count: evaluatedTransactionsStore.length,
    message: 'Evaluated transactions reset to customer evaluation dataset.',
  });
});

// ======================== FRONTEND VITE INTEGRATION ========================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FraudGuard AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
