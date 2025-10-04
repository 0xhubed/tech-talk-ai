"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { InlineMath } from "react-katex";
import {
  calculatePredictions,
  calculateOptimalParameters,
  type DataPoint,
} from "@/lib/costFunctions";
import { MathCopyBlock } from "@/components/ui/MathCopyBlock";

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

// Generate simple dataset
function generateData(count: number, seed: number): DataPoint[] {
  const rng = createRng(seed);
  const points: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const x = (i / count) * 10;
    const noise = (rng() - 0.5) * 3;
    const y = 3 * x + 5 + noise;
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return points;
}

export function ErrorBreakdownVisualizer() {
  const data = useMemo(() => generateData(50, 42), []);
  const optimal = useMemo(() => calculateOptimalParameters(data), [data]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const predictions = useMemo(
    () => calculatePredictions(data, optimal.w, optimal.b),
    [data, optimal]
  );

  // Select 6 sample points to display in cards
  const sampleIndices = useMemo(() => [0, 10, 20, 30, 40, 49], []);
  const samplePredictions = useMemo(
    () => sampleIndices.map((i) => predictions[i]),
    [predictions, sampleIndices]
  );

  // Calculate aggregated values
  const totalSquaredError = useMemo(
    () => predictions.reduce((sum, p) => sum + p.squaredError, 0),
    [predictions]
  );

  const mse = totalSquaredError / predictions.length;

  // Bar chart of squared errors
  const errorBarChart = useMemo(() => {
    const trace: Partial<Data> = {
      type: "bar",
      x: predictions.map((_, i) => i + 1),
      y: predictions.map((p) => p.squaredError),
      marker: {
        color: predictions.map((p) => {
          const normalized = p.squaredError / Math.max(...predictions.map((p2) => p2.squaredError));
          if (normalized < 0.33) return "rgba(34,197,94,0.7)";
          if (normalized < 0.67) return "rgba(251,191,36,0.7)";
          return "rgba(239,68,68,0.7)";
        }),
      },
      hovertemplate: "Point %{x}<br>Squared Error: %{y:.2f}<extra></extra>",
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
        text: "Squared Errors for All Data Points",
        font: { size: 14 },
      },
      xaxis: {
        title: "Data Point",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
      },
      yaxis: {
        title: "Squared Error",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
      },
      showlegend: false,
      shapes: [
        {
          type: "line",
          x0: 0,
          x1: predictions.length + 1,
          y0: mse,
          y1: mse,
          line: {
            color: "rgba(255,200,87,1)",
            width: 2,
            dash: "dash",
          },
        },
      ],
      annotations: [
        {
          x: predictions.length / 2,
          y: mse,
          text: `Mean (MSE) = ${mse.toFixed(2)}`,
          showarrow: false,
          yshift: 10,
          font: {
            color: "rgba(255,200,87,1)",
            size: 12,
          },
        },
      ],
    };

    return { data: [trace], layout };
  }, [predictions, mse]);

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
  };

  const steps = [
    { label: "1. Calculate Predictions", formula: "\\hat{y}_i = w \\cdot x_i + b" },
    { label: "2. Calculate Errors", formula: "e_i = \\hat{y}_i - y_i" },
    { label: "3. Square Errors", formula: "e_i^2 = (\\hat{y}_i - y_i)^2" },
    { label: "4. Sum Squared Errors", formula: "\\sum_{i=1}^{n} e_i^2" },
    { label: "5. Average (MSE)", formula: "MSE = \\frac{1}{n} \\sum_{i=1}^{n} (\\hat{y}_i - y_i)^2" },
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-2">
          Error Breakdown: From Predictions to Cost
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          See how individual prediction errors combine to form the final MSE cost value
        </p>
      </div>

      {/* Step-by-step formula */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          MSE Calculation Steps
        </h4>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-2 rounded transition-colors cursor-pointer ${
                currentStep === index
                  ? "bg-[rgba(255,200,87,0.15)] border border-[rgba(255,200,87,0.3)]"
                  : "hover:bg-[rgba(255,255,255,0.05)]"
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === index
                    ? "bg-[rgba(255,200,87,1)] text-black"
                    : "bg-[rgba(255,255,255,0.1)] text-[color:var(--color-text-secondary)]"
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[color:var(--color-text-primary)]">
                  {step.label}
                </div>
                <div className="mt-1">
                  <InlineMath math={step.formula} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sample error cards */}
      <div>
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          Sample Calculations (6 of {predictions.length} points)
        </h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {samplePredictions.map((pred, index) => (
            <div
              key={index}
              className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3"
            >
              <div className="text-xs font-semibold text-[color:var(--color-text-primary)] mb-2">
                Point #{sampleIndices[index] + 1}
              </div>
              <div className="space-y-1 text-xs text-[color:var(--color-text-secondary)]">
                <div className="flex justify-between">
                  <span>x:</span>
                  <span className="font-mono">{pred.x.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual y:</span>
                  <span className="font-mono">{pred.actual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Predicted ŷ:</span>
                  <span className="font-mono">{pred.predicted.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[rgba(255,255,255,0.1)] pt-1">
                  <span>Error:</span>
                  <span className={`font-mono ${pred.error > 0 ? "text-red-400" : "text-green-400"}`}>
                    {pred.error > 0 ? "+" : ""}
                    {pred.error.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Squared Error:</span>
                  <span className="font-mono text-[rgba(255,200,87,1)]">
                    {pred.squaredError.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar chart showing all squared errors */}
      <div>
        <Plot
          data={errorBarChart.data}
          layout={errorBarChart.layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Final aggregation */}
      <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          Final Aggregation
        </h4>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
              Sum of Squared Errors
            </div>
            <div className="text-xl font-mono font-bold text-[color:var(--color-text-primary)]">
              {totalSquaredError.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
              Number of Points
            </div>
            <div className="text-xl font-mono font-bold text-[color:var(--color-text-primary)]">
              {predictions.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">Mean (MSE)</div>
            <div className="text-xl font-mono font-bold text-[rgba(255,200,87,1)]">
              {mse.toFixed(3)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <MathCopyBlock
            expression={`MSE = \\frac{${totalSquaredError.toFixed(2)}}{${predictions.length}} = ${mse.toFixed(3)}`}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
          Why Square Errors?
        </h4>
        <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-1">
          <li>• Larger errors penalized exponentially more than small errors</li>
          <li>• Makes the cost function smooth and differentiable everywhere</li>
          <li>• Positive and negative errors don&apos;t cancel out</li>
          <li>• Mathematically convenient for gradient descent optimization</li>
        </ul>
      </div>
    </div>
  );
}
