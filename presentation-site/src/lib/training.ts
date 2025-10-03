export type TrainingDatasetOption = {
  id: string;
  label: string;
  size: number;
  featureCount: number;
  description: string;
  notes: string;
};

export type NormalizationOption = {
  id: string;
  label: string;
  description: string;
};

export type HyperparameterSpace = {
  learningRates: number[];
  batchSizes: number[];
  momentumValues: number[];
  epochRange: [number, number];
};

export type TrainingConfig = {
  datasetId: string;
  learningRate: number;
  batchSize: number;
  momentum: number;
  epochs: number;
  normalization: string[];
};

export const trainingDatasets: TrainingDatasetOption[] = [
  {
    id: "baseline",
    label: "Baseline housing",
    size: 500,
    featureCount: 4,
    description: "Deterministic seed 42 with seasonal effects and interaction terms.",
    notes: "Use for walkthrough of raw vs normalized inputs.",
  },
  {
    id: "normalized",
    label: "Normalized mix",
    size: 500,
    featureCount: 6,
    description: "Z-score normalized features with engineered ratios and log transforms.",
    notes: "Pairs well with momentum sweeps.",
  },
  {
    id: "noisy",
    label: "Noisy seasonality",
    size: 750,
    featureCount: 6,
    description: "Higher variance generator with amplified seasonal swing and outliers.",
    notes: "Stress test learning rate schedule live.",
  },
];

export const normalizationOptions: NormalizationOption[] = [
  {
    id: "standardize",
    label: "Standardize",
    description: "Zero mean, unit variance for each feature.",
  },
  {
    id: "minmax",
    label: "Min-max",
    description: "Rescale features to [0, 1] span.",
  },
  {
    id: "robust",
    label: "Robust",
    description: "Median center with IQR scaling for outliers.",
  },
];

export const hyperparameterSpace: HyperparameterSpace = {
  learningRates: [0.001, 0.01, 0.05, 0.1],
  batchSizes: [16, 32, 64, 128],
  momentumValues: [0, 0.5, 0.9],
  epochRange: [50, 500],
};

export const defaultTrainingConfig: TrainingConfig = {
  datasetId: "baseline",
  learningRate: 0.05,
  batchSize: 32,
  momentum: 0.9,
  epochs: 250,
  normalization: ["standardize"],
};
