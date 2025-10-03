"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading comparison…
    </div>
  ),
});

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Seeded random number generator for consistent results
function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type DatasetType = "linear" | "quadratic" | "sigmoid" | "sine";

export function LinearVsNeuralComparison() {
  const [datasetType, setDatasetType] = useState<DatasetType>("quadratic");

  // Generate different dataset types with seeded randomness
  const dataset = useMemo(() => {
    const points = 100;
    const x = Array.from({ length: points }, (_, i) => (i / points) * 10);
    const rng = createRng(42); // Fixed seed for consistency
    let y: number[];

    switch (datasetType) {
      case "linear":
        y = x.map((xi) => 2 * xi + 5 + (rng() - 0.5) * 2);
        break;
      case "quadratic":
        y = x.map((xi) => 0.5 * xi ** 2 - 3 * xi + 10 + (rng() - 0.5) * 3);
        break;
      case "sigmoid":
        y = x.map((xi) => 20 / (1 + Math.exp(-(xi - 5))) + (rng() - 0.5) * 1);
        break;
      case "sine":
        y = x.map((xi) => 10 + 5 * Math.sin(xi) + (rng() - 0.5) * 1);
        break;
    }

    return { x, y };
  }, [datasetType]);

  // Fit linear model
  const linearFit = useMemo(() => {
    const { x, y } = dataset;
    const n = x.length;
    const xMean = x.reduce((acc, v) => acc + v, 0) / n;
    const yMean = y.reduce((acc, v) => acc + v, 0) / n;
    const numerator = x.reduce((acc, v, i) => acc + (v - xMean) * (y[i] - yMean), 0);
    const denominator = x.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    const predictions = x.map((xi) => slope * xi + intercept);
    const mse = predictions.reduce((acc, pred, i) => acc + Math.pow(pred - y[i], 2), 0) / n;

    return {
      x,
      y: predictions,
      mse,
    };
  }, [dataset]);

  // Simulate neural network fit (polynomial approximation for non-linear data)
  const neuralFit = useMemo(() => {
    const { x, y } = dataset;
    const n = x.length;
    let predictions: number[];

    switch (datasetType) {
      case "linear":
        // NN can fit linear perfectly too
        const xMean = x.reduce((acc, v) => acc + v, 0) / n;
        const yMean = y.reduce((acc, v) => acc + v, 0) / n;
        const numerator = x.reduce((acc, v, i) => acc + (v - xMean) * (y[i] - yMean), 0);
        const denominator = x.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;
        predictions = x.map((xi) => slope * xi + intercept);
        break;
      case "quadratic":
        // Polynomial fit for quadratic
        predictions = x.map((xi) => 0.5 * xi ** 2 - 3 * xi + 10);
        break;
      case "sigmoid":
        // Sigmoid approximation
        predictions = x.map((xi) => 20 / (1 + Math.exp(-(xi - 5))));
        break;
      case "sine":
        // Sine approximation
        predictions = x.map((xi) => 10 + 5 * Math.sin(xi));
        break;
    }

    const mse = predictions.reduce((acc, pred, i) => acc + Math.pow(pred - y[i], 2), 0) / n;

    return {
      x,
      y: predictions,
      mse,
    };
  }, [dataset, datasetType]);

  const scatterTrace: Partial<Data> = {
    type: "scatter",
    mode: "markers",
    x: dataset.x,
    y: dataset.y,
    marker: {
      size: 5,
      color: "rgba(35,230,255,0.6)",
      line: { width: 1, color: "rgba(12,18,26,0.65)" },
    },
    name: "Data",
  };

  const linearTrace: Partial<Data> = {
    type: "scatter",
    mode: "lines",
    x: linearFit.x,
    y: linearFit.y,
    line: {
      color: "rgba(255,47,185,0.8)",
      width: 3,
    },
    name: "Linear Model",
  };

  const neuralTrace: Partial<Data> = {
    type: "scatter",
    mode: "lines",
    x: neuralFit.x,
    y: neuralFit.y,
    line: {
      color: "rgba(124,92,255,0.8)",
      width: 3,
    },
    name: "Neural Network",
  };

  const linearLayout: Partial<Layout> = {
    autosize: true,
    height: 300,
    margin: { l: 60, r: 20, t: 30, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
    },
    title: {
      text: "Linear Model",
      font: { size: 14 },
    },
    xaxis: {
      title: "x",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    yaxis: {
      title: "y",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    showlegend: false,
  };

  const neuralLayout: Partial<Layout> = {
    ...linearLayout,
    title: {
      text: "Neural Network",
      font: { size: 14 },
    },
  };

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: false,
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Linear vs Neural Network">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
          <span className="uppercase tracking-[0.22em]">Data Type</span>
          {(["linear", "quadratic", "sigmoid", "sine"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`rounded-full border px-4 py-2 transition ${
                datasetType === type
                  ? "border-[rgba(35,230,255,0.6)] bg-[rgba(35,230,255,0.2)] text-white"
                  : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
              }`}
              onClick={() => setDatasetType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div>
          <Plot
            data={[scatterTrace, linearTrace]}
            layout={linearLayout}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="mt-3 text-center">
            <span className="text-sm text-[color:var(--color-text-secondary)]">MSE: </span>
            <span className="text-lg font-mono text-[rgba(255,47,185,1)]">${formatNumber(Math.round(linearFit.mse))}</span>
          </div>
        </div>
        <div>
          <Plot
            data={[scatterTrace, neuralTrace]}
            layout={neuralLayout}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />
          <div className="mt-3 text-center">
            <span className="text-sm text-[color:var(--color-text-secondary)]">MSE: </span>
            <span className="text-lg font-mono text-[rgba(124,92,255,1)]">${formatNumber(Math.round(neuralFit.mse))}</span>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          💡 Linear regression works for straight-line relationships. Neural networks learn curves and complex patterns!
          {datasetType === "linear"
            ? " Both models perform similarly on linear data."
            : " Notice how the neural network fits the non-linear pattern much better."}
        </p>
      </div>
    </FullScreenCard>
  );
}
