"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Config, Data, Layout } from "plotly.js";
import {
  calculateMSE,
  calculateRMSE,
  calculateR2,
  calculateBaselineMSE,
  calculateOptimalParameters,
  calculatePredictions,
  type DataPoint,
} from "@/lib/costFunctions";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading visualization…
    </div>
  ),
});

// Seeded RNG for consistent data generation
function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// Generate housing-like data with realistic prices
function generateHousingData(count: number, seed: number): DataPoint[] {
  const rng = createRng(seed);
  const points: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    // x represents square feet (in thousands): 1.0 = 1000 sqft
    const sqft = 0.8 + rng() * 2.2; // 800-3000 sqft
    const noise = (rng() - 0.5) * 40000; // ±$20k noise
    // Price formula: roughly $150k base + $100k per 1000 sqft
    const price = 150000 + sqft * 100000 + noise;
    points.push({
      x: Number(sqft.toFixed(2)),
      y: Math.max(50000, Number(price.toFixed(0))),
    });
  }

  return points;
}

export function RealWorldImpactPanel() {
  const data = useMemo(() => generateHousingData(100, 42), []);
  const optimal = useMemo(() => calculateOptimalParameters(data), [data]);
  const predictions = useMemo(
    () => calculatePredictions(data, optimal.w, optimal.b),
    [data, optimal]
  );

  // Calculate metrics
  const mse = useMemo(() => calculateMSE(data, optimal.w, optimal.b), [data, optimal]);
  const rmse = useMemo(() => calculateRMSE(data, optimal.w, optimal.b), [data, optimal]);
  const r2 = useMemo(() => calculateR2(data, optimal.w, optimal.b), [data, optimal]);
  const baselineMSE = useMemo(() => calculateBaselineMSE(data), [data]);

  // Calculate real-world impact
  const avgAbsError = useMemo(
    () =>
      predictions.reduce((sum, p) => sum + Math.abs(p.error), 0) / predictions.length,
    [predictions]
  );

  const portfolioSize = 500;
  const totalPortfolioError = avgAbsError * portfolioSize;
  const defaultRate = 0.05;
  const potentialLoss = totalPortfolioError * defaultRate;

  // Error distribution for histogram
  const errorDistribution = useMemo(() => {
    const errors = predictions.map((p) => p.error);
    const trace: Partial<Data> = {
      type: "histogram",
      x: errors,
      nbinsx: 30,
      marker: {
        color: "rgba(35,230,255,0.7)",
        line: {
          color: "rgba(35,230,255,1)",
          width: 1,
        },
      },
      name: "Error Distribution",
    };

    const layout: Partial<Layout> = {
      autosize: true,
      height: 300,
      margin: { l: 60, r: 20, t: 40, b: 60 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(12,18,26,0.45)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      title: {
        text: "Error Distribution",
        font: { size: 14 },
      },
      xaxis: {
        title: "Prediction Error ($)",
        zeroline: true,
        zerolinecolor: "rgba(255,255,255,0.3)",
        gridcolor: "rgba(255,255,255,0.08)",
      },
      yaxis: {
        title: "Frequency",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
      },
      showlegend: false,
      shapes: [
        {
          type: "line",
          x0: 0,
          x1: 0,
          y0: 0,
          y1: 1,
          yref: "paper",
          line: {
            color: "rgba(255,200,87,1)",
            width: 2,
            dash: "dash",
          },
        },
      ],
    };

    return { data: [trace], layout };
  }, [predictions]);

  // Percentage within tolerance
  const tolerance = 0.1; // 10%
  const withinTolerance = useMemo(() => {
    const count = predictions.filter((p) => {
      const percentError = Math.abs(p.error) / p.actual;
      return percentError <= tolerance;
    }).length;
    return (count / predictions.length) * 100;
  }, [predictions]);

  const improvement = ((baselineMSE - mse) / baselineMSE) * 100;

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">
          Real-World Impact Analysis
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Translate abstract MSE values into concrete business metrics for housing price predictions
        </p>
      </div>

      {/* Financial Impact */}
      <div className="bg-gradient-to-r from-[rgba(239,68,68,0.1)] to-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.3)] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
          <span className="text-xl">💰</span>
          Financial Impact Calculator
        </h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-[rgba(12,18,26,0.4)] rounded p-3">
              <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                Average Prediction Error
              </div>
              <div className="text-2xl font-mono font-bold text-[rgba(255,200,87,1)]">
                ${avgAbsError.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
                per house
              </div>
            </div>
            <div className="bg-[rgba(12,18,26,0.4)] rounded p-3">
              <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                Portfolio Size
              </div>
              <div className="text-2xl font-mono font-bold text-[color:var(--color-text-primary)]">
                {portfolioSize}
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">houses</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[rgba(12,18,26,0.4)] rounded p-3">
              <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                Total Portfolio Error
              </div>
              <div className="text-2xl font-mono font-bold text-[rgba(239,68,68,1)]">
                ${totalPortfolioError.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
                cumulative risk
              </div>
            </div>
            <div className="bg-[rgba(12,18,26,0.4)] rounded p-3">
              <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                Potential Losses ({(defaultRate * 100).toFixed(0)}% default rate)
              </div>
              <div className="text-2xl font-mono font-bold text-[rgba(239,68,68,1)]">
                ${potentialLoss.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
                if bank portfolio
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Distribution */}
      <div>
        <Plot
          data={errorDistribution.data}
          layout={errorDistribution.layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
        />
        <div className="mt-3 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[color:var(--color-text-secondary)]">
              Predictions within ±{tolerance * 100}% tolerance:
            </span>
            <span className="text-lg font-mono font-bold text-[rgba(34,197,94,1)]">
              {withinTolerance.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Model Performance Benchmarks
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                Baseline (Mean Prediction)
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)]">
                Simply predict average price for all houses
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-[color:var(--color-text-secondary)]">
                MSE: {(baselineMSE / 1e9).toFixed(2)}B
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)]">
                RMSE: ${Math.sqrt(baselineMSE).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
          </div>

          <div className="h-px bg-[rgba(255,255,255,0.1)]"></div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                Your Model (Linear Regression)
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)]">
                Learned relationship between size and price
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-mono font-bold text-[rgba(34,197,94,1)]">
                MSE: {(mse / 1e9).toFixed(2)}B
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)]">
                RMSE: ${rmse.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </div>
            </div>
          </div>

          <div className="bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] rounded p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[color:var(--color-text-primary)]">
              Improvement over baseline
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[rgba(34,197,94,1)]">
                {improvement.toFixed(1)}%
              </span>
              <span className="text-lg">✅</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-[color:var(--color-text-secondary)]">
              R² Score (variance explained):
            </span>
            <span className="text-lg font-mono font-bold text-[rgba(255,200,87,1)]">
              {r2.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 text-center">
          <div className="text-xs text-[color:var(--color-text-secondary)] mb-2">
            Mean Squared Error
          </div>
          <div className="text-xl font-mono font-bold text-[rgba(255,200,87,1)]">
            {(mse / 1e9).toFixed(3)}B
          </div>
          <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
            squared dollars
          </div>
        </div>

        <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 text-center">
          <div className="text-xs text-[color:var(--color-text-secondary)] mb-2">
            Root Mean Squared Error
          </div>
          <div className="text-xl font-mono font-bold text-[rgba(35,230,255,1)]">
            ${rmse.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
          <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
            actual dollars
          </div>
        </div>

        <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 text-center">
          <div className="text-xs text-[color:var(--color-text-secondary)] mb-2">
            Mean Absolute Error
          </div>
          <div className="text-xl font-mono font-bold text-[rgba(34,197,94,1)]">
            ${avgAbsError.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
          <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
            typical error
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
          🎯 What&apos;s a &ldquo;Good&rdquo; Cost?
        </h4>
        <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-1">
          <li>• No universal threshold - depends on data scale and business context</li>
          <li>• Always compare to baselines (random, mean prediction)</li>
          <li>• RMSE is in same units as target variable (easier to interpret than MSE)</li>
          <li>
            • Focus on % improvement over naive approaches (
            {improvement.toFixed(0)}% better in this case)
          </li>
        </ul>
      </div>
    </div>
  );
}
