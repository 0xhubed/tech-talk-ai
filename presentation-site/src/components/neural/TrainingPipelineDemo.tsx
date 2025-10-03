"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { generateHousingData } from "@/lib/housing";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading training visualization…
    </div>
  ),
});

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type TrainingConfig = {
  learningRate: number;
  iterations: number;
};

const PRESETS: { label: string; config: TrainingConfig }[] = [
  { label: "0.01 / 10 iter", config: { learningRate: 0.01, iterations: 10 } },
  { label: "0.1 / 50 iter", config: { learningRate: 0.1, iterations: 50 } },
  { label: "0.5 / 100 iter", config: { learningRate: 0.5, iterations: 100 } },
  { label: "1.0 / 500 iter", config: { learningRate: 1.0, iterations: 500 } },
];

export function TrainingPipelineDemo() {
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState<{ w: number; b: number; cost: number }[]>([]);
  const [finalResults, setFinalResults] = useState<{ w: number; b: number; cost: number; time: number } | null>(null);

  const config = PRESETS[selectedPreset].config;

  // Generate housing data
  const housingData = useMemo(() => {
    const data = generateHousingData({ samples: 100, seed: 42 });
    return data.map((d) => ({
      x: d.squareFeet,
      y: d.price,
    }));
  }, []);

  const calculateCost = (w: number, b: number) => {
    const predictions = housingData.map((d) => w * d.x + b);
    return predictions.reduce((acc, pred, i) => acc + Math.pow(pred - housingData[i].y, 2), 0) / housingData.length;
  };

  const calculateGradients = (w: number, b: number) => {
    const m = housingData.length;
    let gradW = 0;
    let gradB = 0;

    for (const point of housingData) {
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
    let w = 50;
    let b = 10000;

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
      x: housingData.map((d) => d.x),
      y: housingData.map((d) => d.y),
      marker: {
        size: 6,
        color: "rgba(35,230,255,0.6)",
        line: { width: 1, color: "rgba(12,18,26,0.65)" },
      },
      name: "Data",
    }),
    [housingData],
  );

  // Model line trace (current state)
  const modelTrace: Partial<Data> = useMemo(() => {
    if (trainingHistory.length === 0) return {};
    const latest = trainingHistory[trainingHistory.length - 1];
    const xs = housingData.map((d) => d.x);
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
  }, [trainingHistory, housingData]);

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
      title: "Square Feet",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    yaxis: {
      title: "Price",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
      tickprefix: "$",
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
              <div className="font-mono text-[color:var(--color-accent)] mt-1">{Math.round(finalResults.b)}</div>
            </div>
            <div>
              <span className="text-[color:var(--color-text-secondary)]">Final Cost:</span>
              <div className="font-mono text-[color:var(--color-accent)] mt-1">
                ${formatNumber(Math.round(finalResults.cost))}
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
          💡 Watch the prediction line improve as cost decreases with each iteration. Different learning rates and
          iteration counts affect convergence speed.
        </p>
      </div>
    </FullScreenCard>
  );
}
