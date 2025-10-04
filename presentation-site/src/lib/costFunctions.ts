/**
 * Cost Functions Library
 *
 * Provides implementations of various cost/loss functions used in machine learning,
 * along with utilities for calculating predictions, errors, and metrics.
 */

export type DataPoint = {
  x: number;
  y: number;
};

export type Prediction = {
  x: number;
  actual: number;
  predicted: number;
  error: number;
  squaredError: number;
};

/**
 * Calculate predictions for linear regression: y = w*x + b
 */
export function calculatePredictions(
  data: DataPoint[],
  w: number,
  b: number
): Prediction[] {
  return data.map((point) => {
    const predicted = w * point.x + b;
    const error = predicted - point.y;
    return {
      x: point.x,
      actual: point.y,
      predicted,
      error,
      squaredError: error * error,
    };
  });
}

/**
 * Mean Squared Error (MSE)
 * Most common cost function for regression
 */
export function calculateMSE(data: DataPoint[], w: number, b: number): number {
  if (data.length === 0) return 0;

  const sumSquaredErrors = data.reduce((sum, point) => {
    const prediction = w * point.x + b;
    const error = prediction - point.y;
    return sum + error * error;
  }, 0);

  return sumSquaredErrors / data.length;
}

/**
 * Mean Absolute Error (MAE)
 * Less sensitive to outliers than MSE
 */
export function calculateMAE(data: DataPoint[], w: number, b: number): number {
  if (data.length === 0) return 0;

  const sumAbsoluteErrors = data.reduce((sum, point) => {
    const prediction = w * point.x + b;
    const error = prediction - point.y;
    return sum + Math.abs(error);
  }, 0);

  return sumAbsoluteErrors / data.length;
}

/**
 * Huber Loss
 * Combines MSE and MAE - quadratic for small errors, linear for large errors
 */
export function calculateHuber(
  data: DataPoint[],
  w: number,
  b: number,
  delta: number = 1.0
): number {
  if (data.length === 0) return 0;

  const sumLoss = data.reduce((sum, point) => {
    const prediction = w * point.x + b;
    const error = prediction - point.y;
    const absError = Math.abs(error);

    if (absError <= delta) {
      return sum + 0.5 * error * error;
    } else {
      return sum + delta * (absError - 0.5 * delta);
    }
  }, 0);

  return sumLoss / data.length;
}

/**
 * Calculate optimal parameters using ordinary least squares
 */
export function calculateOptimalParameters(data: DataPoint[]): {
  w: number;
  b: number;
  cost: number;
} {
  if (data.length === 0) return { w: 0, b: 0, cost: 0 };

  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const xMean = xs.reduce((acc, v) => acc + v, 0) / xs.length;
  const yMean = ys.reduce((acc, v) => acc + v, 0) / ys.length;

  const numerator = xs.reduce(
    (acc, v, i) => acc + (v - xMean) * (ys[i] - yMean),
    0
  );
  const denominator = xs.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;

  const w = numerator / denominator;
  const b = yMean - w * xMean;
  const cost = calculateMSE(data, w, b);

  return { w, b, cost };
}

/**
 * Calculate RMSE (Root Mean Squared Error)
 * In same units as target variable
 */
export function calculateRMSE(data: DataPoint[], w: number, b: number): number {
  return Math.sqrt(calculateMSE(data, w, b));
}

/**
 * Calculate R² (coefficient of determination)
 * Proportion of variance explained by the model
 */
export function calculateR2(data: DataPoint[], w: number, b: number): number {
  if (data.length === 0) return 0;

  const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length;

  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares

  data.forEach((point) => {
    const prediction = w * point.x + b;
    const error = prediction - point.y;
    ssRes += error * error;
    ssTot += (point.y - yMean) * (point.y - yMean);
  });

  if (ssTot === 0) return 0;
  return 1 - ssRes / ssTot;
}

/**
 * Generate cost surface for visualization
 */
export function generateCostSurface(
  data: DataPoint[],
  wRange: number[],
  bRange: number[],
  costFunction: (data: DataPoint[], w: number, b: number) => number = calculateMSE
): number[][] {
  return wRange.map((w) => bRange.map((b) => costFunction(data, w, b)));
}

/**
 * Calculate gradient of MSE with respect to w and b
 */
export function calculateGradient(
  data: DataPoint[],
  w: number,
  b: number
): { dw: number; db: number } {
  if (data.length === 0) return { dw: 0, db: 0 };

  let dw = 0;
  let db = 0;

  data.forEach((point) => {
    const prediction = w * point.x + b;
    const error = prediction - point.y;
    dw += error * point.x;
    db += error;
  });

  dw = (2 * dw) / data.length;
  db = (2 * db) / data.length;

  return { dw, db };
}

/**
 * Calculate baseline MSE (predicting mean)
 * Used for comparison to show model improvement
 */
export function calculateBaselineMSE(data: DataPoint[]): number {
  if (data.length === 0) return 0;

  const yMean = data.reduce((sum, point) => sum + point.y, 0) / data.length;
  const sumSquaredErrors = data.reduce((sum, point) => {
    const error = yMean - point.y;
    return sum + error * error;
  }, 0);

  return sumSquaredErrors / data.length;
}

/**
 * Get error magnitude category for color coding
 */
export function getErrorCategory(
  error: number,
  maxError: number
): "small" | "medium" | "large" {
  const absError = Math.abs(error);
  const normalizedError = absError / maxError;

  if (normalizedError < 0.33) return "small";
  if (normalizedError < 0.67) return "medium";
  return "large";
}
