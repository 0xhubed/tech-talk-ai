export type ScalingPoint = {
  compute: number;
  dataset: number;
  parameters: number;
  loss: number;
};

export type ScalingLawConfig = {
  alpha?: number;
  beta?: number;
  gamma?: number;
  points?: number;
};

const DEFAULT_SCALING: Required<ScalingLawConfig> = {
  alpha: 0.1,
  beta: 0.27,
  gamma: 0.2,
  points: 36,
};

export function generateScalingCurve(config: ScalingLawConfig = {}): ScalingPoint[] {
  const { alpha, beta, gamma, points } = { ...DEFAULT_SCALING, ...config };
  const computeRange = [1e2, 1e6];
  const datasetRange = [1e3, 1e7];
  const paramRange = [1e4, 1e9];

  const toLogSpace = (min: number, max: number, index: number, maxIndex: number) => {
    const ratio = index / maxIndex;
    return Math.exp(Math.log(min) * (1 - ratio) + Math.log(max) * ratio);
  };

  return Array.from({ length: points }, (_, idx) => {
    const compute = toLogSpace(computeRange[0], computeRange[1], idx, points - 1);
    const dataset = toLogSpace(datasetRange[0], datasetRange[1], idx, points - 1);
    const parameters = toLogSpace(paramRange[0], paramRange[1], idx, points - 1);

    const loss = Math.pow(parameters, -alpha) + Math.pow(dataset, -beta) + Math.pow(compute, -gamma);
    return {
      compute,
      dataset,
      parameters,
      loss,
    };
  });
}
