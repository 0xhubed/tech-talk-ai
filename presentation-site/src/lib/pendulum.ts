export type PendulumTrial = {
  length: number;
  observedPeriod: number;
};

export type PendulumConfig = {
  gravity?: number;
  noiseSigma?: number;
  seed?: number;
};

export type LossSurfaceConfig = {
  kRange?: [number, number];
  pRange?: [number, number];
  steps?: number;
};

export type LossSurfaceCell = {
  k: number;
  p: number;
  rmse: number;
  kIndex: number;
  pIndex: number;
};

export type LossSurfaceResult = {
  steps: number;
  kRange: [number, number];
  pRange: [number, number];
  cells: LossSurfaceCell[];
};

export type PendulumReasoningStep = {
  id: string;
  role: "planner" | "observation" | "analysis" | "action";
  heading: string;
  content: string;
  tokens: number;
};

const DEFAULT_PENDULUM: Required<PendulumConfig> = {
  gravity: 9.81,
  noiseSigma: 0.02,
  seed: 17,
};

export const DEFAULT_EXPERIMENT_LENGTHS = [0.5, 0.8, 1.2, 1.6, 2.1];
export const DEFAULT_EXPERIMENT_NOISE = DEFAULT_PENDULUM.noiseSigma;

function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function simulatePendulumTrials(lengths: number[], config: PendulumConfig = {}): PendulumTrial[] {
  const { gravity, noiseSigma, seed } = { ...DEFAULT_PENDULUM, ...config };
  const random = createRng(seed);

  return lengths.map((length) => {
    const truePeriod = 2 * Math.PI * Math.sqrt(length / gravity);
    const noisyPeriod = truePeriod * (1 + (random() * 2 - 1) * noiseSigma);
    return {
      length,
      observedPeriod: noisyPeriod,
    };
  });
}

export function fitPendulumParameters(trials: PendulumTrial[]) {
  // Simple log-log regression to estimate k and p in T = k * L^p
  const xs = trials.map((trial) => Math.log(trial.length));
  const ys = trials.map((trial) => Math.log(trial.observedPeriod));
  const n = trials.length;

  const sumX = xs.reduce((acc, value) => acc + value, 0);
  const sumY = ys.reduce((acc, value) => acc + value, 0);
  const sumXY = xs.reduce((acc, value, index) => acc + value * ys[index], 0);
  const sumXX = xs.reduce((acc, value) => acc + value * value, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const p = slope;
  const k = Math.exp(intercept);

  return { k, p };
}

const DEFAULT_SURFACE: Required<LossSurfaceConfig> = {
  kRange: [5.8, 6.6],
  pRange: [0.45, 0.55],
  steps: 32,
};

export function computeLossSurface(trials: PendulumTrial[], config: LossSurfaceConfig = {}): LossSurfaceResult {
  const { kRange, pRange, steps } = { ...DEFAULT_SURFACE, ...config };
  const [kMin, kMax] = kRange;
  const [pMin, pMax] = pRange;
  const cells: LossSurfaceCell[] = [];

  if (steps < 2 || trials.length === 0) {
    return { steps: Math.max(steps, 2), kRange, pRange, cells };
  }

  const toValue = (min: number, max: number, index: number) =>
    min + ((max - min) * index) / (steps - 1);

  for (let i = 0; i < steps; i += 1) {
    const k = toValue(kMin, kMax, i);
    for (let j = 0; j < steps; j += 1) {
      const p = toValue(pMin, pMax, j);
      const rmse = Math.sqrt(
        trials.reduce((acc, trial) => {
          const prediction = k * Math.pow(trial.length, p);
          const error = prediction - trial.observedPeriod;
          return acc + error * error;
        }, 0) / trials.length,
      );

      cells.push({ k, p, rmse, kIndex: i, pIndex: j });
    }
  }

  return { steps, kRange, pRange, cells };
}

export function generateReasoningStream(
  trials: PendulumTrial[],
  fit: { k: number; p: number },
  options: { noiseSigma: number; nextLengthSuggestion?: number } = { noiseSigma: DEFAULT_PENDULUM.noiseSigma },
): PendulumReasoningStep[] {
  const { noiseSigma, nextLengthSuggestion } = options;
  if (trials.length === 0) {
    return [
      {
        id: "planner-empty",
        role: "planner",
        heading: "Planner",
        content: "Awaiting initial measurements before estimating pendulum parameters.",
        tokens: 18,
      },
    ];
  }

  const latest = trials[trials.length - 1];
  const lengths = trials.map((trial) => trial.length);
  const uniqueLengths = Array.from(new Set(lengths));
  const range = Math.max(...lengths) - Math.min(...lengths);
  const coverageDescriptor = range > 1.2 ? "broad" : range > 0.6 ? "moderate" : "narrow";
  const residual = Math.abs(fit.k * Math.pow(latest.length, fit.p) - latest.observedPeriod);
  const suggestedLength = nextLengthSuggestion ?? Number((Math.max(...lengths) + 0.35).toFixed(2));

  const steps: PendulumReasoningStep[] = [
    {
      id: "planner-overview",
      role: "planner",
      heading: "Planner",
      content: `Queue contains ${trials.length} trials across ${uniqueLengths.length} unique lengths with ${coverageDescriptor} coverage. Targeting T = k·L^p with noisy observations (σ=${noiseSigma.toFixed(2)}).`,
      tokens: 42,
    },
    {
      id: "observation-latest",
      role: "observation",
      heading: "Observation",
      content: `Latest measurement at ${latest.length.toFixed(2)} m produced T=${latest.observedPeriod.toFixed(3)} s. Residual vs current hypothesis is ${residual.toFixed(3)} s.`,
      tokens: 36,
    },
    {
      id: "analysis-fit",
      role: "analysis",
      heading: "Analysis",
      content: `Regression update yields k=${fit.k.toFixed(3)}, p=${fit.p.toFixed(3)}. Confidence improves as residual variance drops; monitoring exponent drift below ±0.01.`,
      tokens: 41,
    },
    {
      id: "action-next",
      role: "action",
      heading: "Next Action",
      content: `Schedule next trial near ${suggestedLength.toFixed(2)} m to extend long-length coverage and tighten the loss basin around the optimum.`,
      tokens: 38,
    },
  ];

  return steps;
}
