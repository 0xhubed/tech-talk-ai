"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading training visualization…
    </div>
  ),
});

// Seeded random number generator for consistent results
function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

type DataPoint = {
  x: number;
  y: number;
};

// Generate clean mathematical data: y = 3x + 5 + noise
function generateCleanData(count: number, seed: number): DataPoint[] {
  const rng = createRng(seed);
  const points: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const x = (i / count) * 10; // x ranges from 0 to 10
    const noise = (rng() - 0.5) * 6; // noise in range [-3, 3]
    const y = 3 * x + 5 + noise; // true relationship: y = 3x + 5
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return points;
}

type TrainingConfig = {
  learningRate: number;
  iterations: number;
};

const PRESETS: { label: string; config: TrainingConfig }[] = [
  { label: "0.01 / 20 iter", config: { learningRate: 0.01, iterations: 20 } },
  { label: "0.05 / 50 iter", config: { learningRate: 0.05, iterations: 50 } },
  { label: "0.1 / 100 iter", config: { learningRate: 0.1, iterations: 100 } },
  { label: "0.2 / 200 iter", config: { learningRate: 0.2, iterations: 200 } },
];

export function TrainingPipelineDemo() {
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<{ w: number; b: number; cost: number }[]>([]);
  const [finalResults, setFinalResults] = useState<{ w: number; b: number; cost: number; time: number } | null>(null);

  const config = PRESETS[selectedPreset].config;

  // Generate clean mathematical data
  const dataPoints = useMemo(() => generateCleanData(80, 42), []);

  const calculateCost = (w: number, b: number) => {
    const predictions = dataPoints.map((d) => w * d.x + b);
    return predictions.reduce((acc, pred, i) => acc + Math.pow(pred - dataPoints[i].y, 2), 0) / dataPoints.length;
  };

  const calculateGradients = (w: number, b: number) => {
    const m = dataPoints.length;
    let gradW = 0;
    let gradB = 0;

    for (const point of dataPoints) {
      const prediction = w * point.x + b;
      const error = prediction - point.y;
      gradW += (error * point.x) / m;
      gradB += error / m;
    }

    return { gradW, gradB };
  };

  const trainModel = async () => {
    setIsTraining(true);
    setProgress(0);
    setFinalResults(null);
    const history: { w: number; b: number; cost: number }[] = [];

    const startTime = Date.now();
    let w = 0.5;  // Start with small w for y = 3x + 5
    let b = 1.0;  // Start with small b

    for (let i = 0; i < config.iterations; i++) {
      const cost = calculateCost(w, b);
      history.push({ w, b, cost });

      const { gradW, gradB } = calculateGradients(w, b);
      w = w - config.learningRate * gradW;
      b = b - config.learningRate * gradB;

      setProgress(((i + 1) / config.iterations) * 100);
      setTrainingHistory([...history]);

      // Add delay for visualization
      await new Promise((resolve) => setTimeout(resolve, Math.min(50, 1000 / config.iterations)));
    }

    const endTime = Date.now();
    const finalCost = calculateCost(w, b);
    setFinalResults({
      w,
      b,
      cost: finalCost,
      time: (endTime - startTime) / 1000,
    });
    setIsTraining(false);
  };

  const reset = () => {
    setProgress(0);
    setTrainingHistory([]);
    setFinalResults(null);
  };

  // Data scatter trace
  const scatterTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "markers",
      x: dataPoints.map((d) => d.x),
      y: dataPoints.map((d) => d.y),
      marker: {
        size: 6,
        color: "rgba(35,230,255,0.6)",
        line: { width: 1, color: "rgba(12,18,26,0.65)" },
      },
      name: "Data",
    }),
    [dataPoints],
  );

  // Model line trace (current state)
  const modelTrace: Partial<Data> = useMemo(() => {
    if (trainingHistory.length === 0) return {};
    const latest = trainingHistory[trainingHistory.length - 1];
    const xs = dataPoints.map((d) => d.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);

    return {
      type: "scatter",
      mode: "lines",
      x: [xMin, xMax],
      y: [latest.w * xMin + latest.b, latest.w * xMax + latest.b],
      line: {
        color: "rgba(255,200,87,0.9)",
        width: 4,
      },
      name: "Model",
    };
  }, [trainingHistory, dataPoints]);

  // Cost over time trace
  const costTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "lines",
      x: trainingHistory.map((_, i) => i + 1),
      y: trainingHistory.map((h) => h.cost),
      line: {
        color: "rgba(255,47,185,0.8)",
        width: 3,
      },
      name: "Cost",
    }),
    [trainingHistory],
  );

  const dataLayout: Partial<Layout> = {
    autosize: true,
    height: 300,
    margin: { l: 60, r: 20, t: 20, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
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

  const costLayout: Partial<Layout> = {
    autosize: true,
    height: 300,
    margin: { l: 60, r: 20, t: 20, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
    },
    xaxis: {
      title: "Iteration",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    yaxis: {
      title: "Cost (MSE)",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    showlegend: false,
  };

  const plotConfig: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: false,
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Complete Training Pipeline">
      <h3 className="text-lg text-[color:var(--color-text-primary)] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
        Settings
      </h3>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            className={`rounded-lg border px-4 py-2 transition text-sm ${
              selectedPreset === idx
                ? "border-[rgba(35,230,255,0.6)] bg-[rgba(35,230,255,0.2)] text-white"
                : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
            }`}
            onClick={() => {
              setSelectedPreset(idx);
              reset();
            }}
            disabled={isTraining}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <div>
          <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] mb-3">Data + Model Line</h4>
          <Plot
            data={trainingHistory.length > 0 ? [scatterTrace, modelTrace] : [scatterTrace]}
            layout={dataLayout}
            config={plotConfig}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div>
          <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] mb-3">Cost Over Time</h4>
          <Plot
            data={trainingHistory.length > 0 ? [costTrace] : []}
            layout={costLayout}
            config={plotConfig}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={trainModel}
          disabled={isTraining}
          className="px-6 py-3 rounded-lg bg-[rgba(35,230,255,0.2)] border border-[rgba(35,230,255,0.6)] hover:bg-[rgba(35,230,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {isTraining ? "Training..." : "▶ Train Model"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isTraining}
          className="px-6 py-3 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ↻ Reset
        </button>
      </div>

      {isTraining && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-[color:var(--color-text-secondary)]">Progress</span>
            <span className="text-[color:var(--color-text-primary)]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[rgba(35,230,255,0.8)] to-[rgba(124,92,255,0.8)] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
            Iteration {Math.round((progress / 100) * config.iterations)}/{config.iterations}
          </p>
        </div>
      )}

      {finalResults && (
        <div className="mb-6 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.2)] rounded-lg p-4">
          <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] mb-3">Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[color:var(--color-text-secondary)]">Final w:</span>
              <div className="font-mono text-[color:var(--color-accent)] mt-1">{finalResults.w.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[color:var(--color-text-secondary)]">Final b:</span>
              <div className="font-mono text-[color:var(--color-accent)] mt-1">{finalResults.b.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-[color:var(--color-text-secondary)]">Final Cost (MSE):</span>
              <div className="font-mono text-[color:var(--color-accent)] mt-1">
                {finalResults.cost.toFixed(3)}
              </div>
            </div>
            <div>
              <span className="text-[color:var(--color-text-secondary)]">Time:</span>
              <div className="font-mono text-[color:var(--color-accent)] mt-1">{finalResults.time.toFixed(1)}s</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          <strong className="text-[color:var(--color-text-primary)]">Training on y = 3x + 5</strong> (with noise).
          Watch the prediction line improve as MSE decreases with each iteration. Different learning rates affect convergence speed—
          higher rates converge faster but may overshoot, while lower rates are more stable but slower.
        </p>
      </div>
    </FullScreenCard>
  );
}
