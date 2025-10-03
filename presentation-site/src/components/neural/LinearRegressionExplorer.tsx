"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { ViewModeButtons } from "./shared/ViewModeButtons";
import { ParameterSlider } from "./shared/ParameterSlider";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading interactive visualization…
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
    const noise = (rng() - 0.5) * 6; // noise in range [-3, 3] - increased for more variation
    const y = 3 * x + 5 + noise; // true relationship: y = 3x + 5
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return points;
}

const SAMPLE_SIZE = 80;

export function LinearRegressionExplorer() {
  const [viewMode, setViewMode] = useState<"data" | "model" | "predictions">("data");
  const [mounted, setMounted] = useState(false);
  const dataPoints = useMemo(() => generateCleanData(SAMPLE_SIZE, 42), []);

  // Calculate optimal w and b using least squares
  const optimal = useMemo(() => {
    const xs = dataPoints.map((p) => p.x);
    const ys = dataPoints.map((p) => p.y);
    const xMean = xs.reduce((acc, v) => acc + v, 0) / xs.length;
    const yMean = ys.reduce((acc, v) => acc + v, 0) / ys.length;
    const numerator = xs.reduce((acc, v, i) => acc + (v - xMean) * (ys[i] - yMean), 0);
    const denominator = xs.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
    const w = numerator / denominator;
    const b = yMean - w * xMean;
    return { w: Number(w.toFixed(2)), b: Number(b.toFixed(2)) };
  }, [dataPoints]);

  // User-adjustable parameters
  const [w, setW] = useState(optimal.w);
  const [b, setB] = useState(optimal.b);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate MSE cost
  const cost = useMemo(() => {
    const predictions = dataPoints.map((p) => w * p.x + b);
    const errors = dataPoints.map((p, i) => Math.pow(predictions[i] - p.y, 2));
    const mse = errors.reduce((acc, e) => acc + e, 0) / dataPoints.length;
    return Number(mse.toFixed(3));
  }, [w, b, dataPoints]);

  // Regression line points
  const regressionLine = useMemo(() => {
    const xs = dataPoints.map((p) => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return {
      x: [xMin, xMax],
      y: [w * xMin + b, w * xMax + b],
    };
  }, [w, b, dataPoints]);

  const scatterTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "markers",
      x: dataPoints.map((p) => p.x),
      y: dataPoints.map((p) => p.y),
      text: dataPoints.map((p) => `x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}`),
      marker: {
        size: 7,
        color: dataPoints.map((p) => p.y),
        colorscale: [
          [0, "#23e6ff"],
          [0.5, "#3f5efb"],
          [1, "#ff2fb9"],
        ],
        showscale: false,
        opacity: 0.78,
        line: { width: 1, color: "rgba(12,18,26,0.65)" },
      },
      hovertemplate: "%{text}<extra></extra>",
      name: "Data Points",
    }),
    [dataPoints],
  );

  const modelTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "lines",
      x: regressionLine.x,
      y: regressionLine.y,
      name: "Model",
      line: {
        color: "rgba(255,200,87,0.9)",
        width: 4,
      },
      hoverinfo: "skip",
    }),
    [regressionLine],
  );

  const predictionTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "markers",
      x: dataPoints.map((p) => p.x),
      y: dataPoints.map((p) => w * p.x + b),
      text: dataPoints.map(
        (p) => `Predicted: ${(w * p.x + b).toFixed(2)}<br>Actual: ${p.y.toFixed(2)}`,
      ),
      marker: {
        size: 7,
        color: "rgba(124,92,255,0.6)",
        symbol: "diamond",
        line: { width: 1, color: "rgba(255,255,255,0.3)" },
      },
      hovertemplate: "%{text}<extra></extra>",
      name: "Predictions",
    }),
    [w, b, dataPoints],
  );

  const layout: Partial<Layout> = useMemo(
    () => ({
      autosize: true,
      height: 400,
      margin: { l: 70, r: 28, t: 32, b: 70 },
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
      hovermode: "closest",
      showlegend: false,
    }),
    [],
  );

  const config: Partial<Config> = useMemo(
    () => ({
      displaylogo: false,
      responsive: true,
      staticPlot: false,
      modeBarButtonsToRemove: ["toggleSpikelines"],
    }),
    [],
  );

  const getData = () => {
    if (viewMode === "data") return [scatterTrace];
    if (viewMode === "model") return [scatterTrace, modelTrace];
    return [scatterTrace, modelTrace, predictionTrace];
  };

  const resetToOptimal = () => {
    setW(optimal.w);
    setB(optimal.b);
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Linear Regression Explorer">
      <div className="mb-6">
        <ViewModeButtons
          modes={[
            { id: "data", label: "Data Only" },
            { id: "model", label: "Data + Model" },
            { id: "predictions", label: "Predictions" },
          ]}
          active={viewMode}
          onChange={(mode) => setViewMode(mode as "data" | "model" | "predictions")}
        />
      </div>

      <div className="relative">
        <Plot data={getData()} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>

      {viewMode !== "data" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ParameterSlider
              label="Weight (w)"
              value={w}
              min={0}
              max={6}
              step={0.1}
              onChange={setW}
              formula="f(x) = wx + b"
            />
            <ParameterSlider label="Bias (b)" value={b} min={0} max={10} step={0.1} onChange={setB} />
          </div>

          <div className="flex items-center justify-between bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.2)] rounded-lg p-4">
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">Cost (MSE):</span>
              <span className="ml-2 text-lg font-mono text-[color:var(--color-accent)]">
                {cost.toFixed(3)}
              </span>
            </div>
            <button
              type="button"
              onClick={resetToOptimal}
              className="px-4 py-2 rounded-lg border border-[rgba(255,200,87,0.4)] bg-[rgba(255,200,87,0.1)] hover:bg-[rgba(255,200,87,0.2)] transition text-sm"
            >
              Reset to Best Fit
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          <strong className="text-[color:var(--color-text-primary)]">True relationship: y = 3x + 5</strong> (with noise).
          Adjust w and b to fit the line and minimize cost. Optimal values: w ≈ 3, b ≈ 5.
        </p>
      </div>
    </FullScreenCard>
  );
}
