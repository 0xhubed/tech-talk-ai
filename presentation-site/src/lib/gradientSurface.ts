export type GradientSurfacePoint = {
  step: number;
  x: number;
  y: number;
  z: number;
  gradientX: number;
  gradientY: number;
};

export type GradientSurfaceGrid = {
  xs: number[];
  ys: number[];
  zs: number[][];
};

export type GradientPathOptions = {
  learningRate: number;
  steps: number;
  startX?: number;
  startY?: number;
};

export const X_RANGE = { min: -2.5, max: 2.5, samples: 40 } as const;
export const Y_RANGE = { min: -2.5, max: 2.5, samples: 40 } as const;

export function surfaceValue(x: number, y: number): number {
  return x ** 2 + 0.5 * y ** 2;
}

export function gradientVector(x: number, y: number): readonly [number, number] {
  return [2 * x, y];
}

export function generateSurfaceGrid(
  range: { x?: typeof X_RANGE; y?: typeof Y_RANGE } = {},
): GradientSurfaceGrid {
  const xr = range.x ?? X_RANGE;
  const yr = range.y ?? Y_RANGE;
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[][] = [];

  for (let xi = 0; xi < xr.samples; xi += 1) {
    const x = xr.min + (xi / (xr.samples - 1)) * (xr.max - xr.min);
    xs.push(x);
  }

  for (let yi = 0; yi < yr.samples; yi += 1) {
    const y = yr.min + (yi / (yr.samples - 1)) * (yr.max - yr.min);
    ys.push(y);
  }

  for (let yi = 0; yi < ys.length; yi += 1) {
    const row: number[] = [];
    for (let xi = 0; xi < xs.length; xi += 1) {
      row.push(surfaceValue(xs[xi], ys[yi]));
    }
    zs.push(row);
  }

  return { xs, ys, zs };
}

export function gradientDescentPath({
  learningRate,
  steps,
  startX = -1.6,
  startY = 1.2,
}: GradientPathOptions): GradientSurfacePoint[] {
  const normalizedSteps = Math.max(0, Math.round(steps));
  const path: GradientSurfacePoint[] = [];

  let x = startX;
  let y = startY;

  for (let step = 0; step <= normalizedSteps; step += 1) {
    const z = surfaceValue(x, y);
    const [gradientX, gradientY] = gradientVector(x, y);
    path.push({ step, x, y, z, gradientX, gradientY });
    x -= learningRate * gradientX;
    y -= learningRate * gradientY;
  }

  return path;
}

