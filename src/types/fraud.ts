/**
 * FraudGuard AI - Data Contracts & Typings
 * Research-oriented types matching the behavioral and explainable ML framework.
 */

export type RiskBand = 'low' | 'medium' | 'high';

export interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  timestamp: string; // ISO string
  merchantCategory: string;
  merchantName: string;
  location: string;
  country: string;
  cardPresent: boolean;
  channel: 'in_store' | 'ecommerce' | 'mobile_wallet' | 'atm';
  deviceFingerprint?: string;
  timeSincePriorHours?: number;
  historicalClassification?: 'Normal' | 'Suspicious' | 'Verified Legit';
  isGroundTruthFraud?: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  accountAgeDays: number;
  totalHistoricalTxns: number;
  historicalMeanAmount: number;
  historicalMedianAmount: number;
  historicalStdAmount: number;
  historicalMaxAmount: number;
  historicalMinAmount?: number;
  frequentCategories: { category: string; frequency: number }[];
  frequentLocations: { location: string; country: string; frequency: number }[];
  typicalHoursRange: [number, number]; // e.g. [7, 22]
  lastTxnTimestamp?: string;
  isColdStart: boolean;
}

export interface CustomerHistorySummary {
  totalHistoricalTxns: number;
  historicalMeanAmount: number;
  historicalMedianAmount: number;
  historicalStdAmount: number;
  historicalMaxAmount: number;
  historicalMinAmount: number;
  averageFrequencyDays: number;
  timeSinceLastHours: number;
  topCategories: { category: string; count: number; percentage: number }[];
  typicalHoursString: string;
  topLocations: { location: string; count: number; percentage: number }[];
  observationPeriod: string;
  isColdStart: boolean;
  coldStartWarning?: string;
}

export interface BehavioralDeviationReason {
  feature: string;
  displayName: string;
  currentValue: string;
  historicalBaseline: string;
  deviationMagnitude: string;
  riskDirection: 'elevates_risk' | 'mitigates_risk' | 'neutral';
  simpleExplanation: string;
  isFlagged: boolean;
}

export interface BehavioralComparisonRow {
  feature: string;
  historicalBehavior: string;
  currentTransaction: string;
  interpretation: 'Normal' | 'Unusual' | 'Moderate Anomaly' | 'Severe Anomaly' | 'Uncommon' | 'Unusually frequent';
  isAnomalous: boolean;
}

export interface BehavioralDeviations {
  amount_dev_hist_mean: number; // Z-score
  amount_ratio_hist_max: number;
  time_since_last_txn: number; // in hours
  recent_freq_24h: number;
  merchant_cat_deviation: number; // 0 to 1
  location_deviation: number; // 0 to 1
  hour_deviation: number; // 0 to 1
  is_cold_start: boolean;
}

export interface ModelProbabilities {
  logisticRegression: number; // P_lr
  randomForest: number;       // P_rf
  xgboost: number;            // P_xgb
  ensemble: number;           // P_ens = w_lr*P_lr + w_rf*P_rf + w_xgb*P_xgb
}

export interface ShapFeatureContribution {
  feature: string;
  displayName: string;
  value: number | string;
  shapValue: number; // Positive = pushes toward fraud alert; Negative = pushes toward legitimate
  description: string;
}

export interface ShapExplanation {
  baseValue: number; // E[f(x)] expected value
  modelOutput: number; // P_ens
  contributions: ShapFeatureContribution[];
  summaryText: string;
  targetExplained: string;
}

export interface ThresholdConfig {
  alpha: number; // Fusion weight: S = alpha * P_ens + (1 - alpha) * B(x)
  b1: number;    // Breakpoint between Low and Medium risk
  b2: number;    // Breakpoint between Medium and High risk
  tauLow: number;  // Threshold for High behavioral risk (e.g. 0.25)
  tauMid: number;  // Threshold for Medium behavioral risk (e.g. 0.45)
  tauHigh: number; // Threshold for Low behavioral risk (e.g. 0.65)
  fixedBaseline: number; // Fixed threshold baseline (e.g. 0.50)
}

export interface EnsembleWeights {
  wLR: number;
  wRF: number;
  wXGB: number;
}

export interface AnalysisResult {
  transaction: Transaction;
  behavioralDeviations: BehavioralDeviations;
  behavioralRiskScore: number; // B(x_t) in [0, 1]
  behavioralRiskBand: RiskBand;
  modelProbabilities: ModelProbabilities;
  ensembleWeights: EnsembleWeights;
  fusedScore: number; // S(x_t)
  applicableThreshold: number; // tau(B)
  fixedThreshold: number; // fixed baseline
  isAdaptiveAlert: boolean; // S(x_t) >= tau(B)
  isFixedAlert: boolean; // P_ens >= fixedBaseline
  thresholdDiffReason: string;
  shapExplanation: ShapExplanation;
  deviationReasons: BehavioralDeviationReason[];
  comparisonRows: BehavioralComparisonRow[];
  customerHistorySummary: CustomerHistorySummary;
  historicalTransactions: Transaction[];
  pipelineMode: 'live' | 'demo' | 'unavailable';
  modelVersion: string;
  timestamp: string;
}

export interface MetricSummary {
  totalProcessed: number;
  fraudAlertsCount: number;
  legitimateCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  fraudRecall: number;
  precision: number;
  f1Score: number;
  prAuc: number;
  falseNegativeRate: number;
  falsePositiveRate: number;
  alertsByDeviation: {
    name: string;
    count: number;
    description: string;
  }[];
  volumeOverTime: {
    hour: string;
    total: number;
    alerts: number;
    legit: number;
  }[];
  performanceByHistoryGroup: {
    group: string;
    f1Score: number;
    recall: number;
    precision: number;
    count: number;
  }[];
}

export interface ImbalanceBenchmark {
  technique: string;
  recall: number;
  precision: number;
  f1Score: number;
  prAuc: number;
  rocAuc: number;
  falseNegativeRate: number;
  description: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  tag: string;
  description: string;
  customerName: string;
  transaction: Omit<Transaction, 'id'>;
  expectedOutcome: string;
}
