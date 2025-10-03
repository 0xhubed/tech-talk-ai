import type {
  NormalizationOption,
  TrainingConfig,
  TrainingDatasetOption,
} from "@/lib/training";

export type TrainingRunPoint = {
  epoch: number;
  trainingLoss: number;
  validationLoss: number;
};

export type TrainingRunSummary = {
  points: TrainingRunPoint[];
  finalTrainingLoss: number;
  finalValidationLoss: number;
  meanAbsoluteError: number;
  rSquared: number;
  overfitIndex: number;
  notes: string[];
};

const DEFAULT_SEED = 1234;

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function datasetDifficulty(datasetId: string) {
  switch (datasetId) {
    case "normalized":
      return { startingLoss: 0.62, floorLoss: 0.18, noiseFactor: 0.85 };
    case "noisy":
      return { startingLoss: 0.92, floorLoss: 0.24, noiseFactor: 1.35 };
    default:
      return { startingLoss: 0.78, floorLoss: 0.2, noiseFactor: 1 };
  }
}

function normalizationBoost(selected: NormalizationOption[]) {
  if (selected.length === 0) return 1;
  const base = 0.92;
  const additional = selected.length * 0.04;
  return Math.max(0.78, base - additional);
}

function schedulingIntensity(learningRate: number, momentum: number) {
  const lrEffect = Math.min(learningRate / 0.05, 2.4);
  const momentumEffect = 1 + momentum * 0.9;
  return { speed: 1.2 * lrEffect * momentumEffect, oscillation: Math.max(0, lrEffect - 1.3) * 0.12 };
}

function computeR2(trainLoss: number, valLoss: number) {
  const baseline = 1.4;
  const residual = (trainLoss + valLoss) / 2;
  const r2 = 1 - residual / baseline;
  return Math.max(0.45, Math.min(0.98, r2));
}

export function simulateTrainingRun({
  config,
  dataset,
  normalization,
  seed = DEFAULT_SEED,
}: {
  config: TrainingConfig;
  dataset: TrainingDatasetOption;
  normalization: NormalizationOption[];
  seed?: number;
}): TrainingRunSummary {
  const rng = createRng(seed + config.epochs + Math.floor(config.learningRate * 1000));
  const { startingLoss, floorLoss, noiseFactor } = datasetDifficulty(dataset.id);
  const normBoost = normalizationBoost(normalization);
  const { speed, oscillation } = schedulingIntensity(config.learningRate, config.momentum);

  const epochSteps = Math.min(90, Math.max(24, Math.round(config.epochs / Math.max(config.batchSize / 16, 1)) + 24));
  const epochIncrement = config.epochs / (epochSteps - 1);

  const points: TrainingRunPoint[] = [];
  let lastTrain = startingLoss;
  let lastVal = startingLoss * 1.06;

  for (let index = 0; index < epochSteps; index += 1) {
    const progress = index / (epochSteps - 1 || 1);
    const decayStrength = speed * (0.8 + normalization.length * 0.08);
    const stabilizedProgress = Math.pow(progress, 0.85 + normalization.length * 0.04);
    const baseTrain =
      floorLoss + (startingLoss - floorLoss) * Math.exp(-decayStrength * stabilizedProgress * normBoost);

    const oscillationTerm = Math.sin(progress * Math.PI * (1 + oscillation)) * 0.02 * oscillation;
    const noise = (rng() - 0.5) * 0.03 * noiseFactor;

    const trainLoss = Math.max(floorLoss, baseTrain + oscillationTerm + noise);
    const validationPenalty =
      0.015 * (1 + noiseFactor) + (config.learningRate > 0.07 ? 0.01 : 0) + (normalization.length === 0 ? 0.02 : 0);
    const validationNoise = (rng() - 0.5) * 0.025 * noiseFactor;
    const valLoss = Math.max(floorLoss + 0.015, trainLoss + validationPenalty + validationNoise);

    lastTrain = trainLoss;
    lastVal = valLoss;

    points.push({
      epoch: Math.round(index * epochIncrement),
      trainingLoss: Number(trainLoss.toFixed(4)),
      validationLoss: Number(valLoss.toFixed(4)),
    });
  }

  const mae = (lastVal + lastTrain) / 2;
  const overfitIndex = Math.max(0, lastVal - lastTrain);
  const summaryNotes = [
    normalization.length > 0 ? "Normalization compresses the loss floor." : "Raw features leave a wider loss basin.",
    config.learningRate > 0.07 ? "Aggressive learning rate introduces oscillations—call this out live." : "Stable learning rate—smooth convergence.",
    dataset.id === "noisy" ? "Noisy dataset keeps validation loss elevated; highlight robustness." : "Validation within target band.",
  ];

  return {
    points,
    finalTrainingLoss: Number(lastTrain.toFixed(4)),
    finalValidationLoss: Number(lastVal.toFixed(4)),
    meanAbsoluteError: Number(mae.toFixed(4)),
    rSquared: Number(computeR2(lastTrain, lastVal).toFixed(3)),
    overfitIndex: Number(overfitIndex.toFixed(4)),
    notes: summaryNotes,
  };
}
