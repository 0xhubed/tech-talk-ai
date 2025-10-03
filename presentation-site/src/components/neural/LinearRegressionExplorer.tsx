"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { generateHousingData } from "@/lib/housing";
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

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type PreviewPoint = {
  squareFeet: number;
  price: number;
};

function buildPreviewPoints(count: number, seed: number): PreviewPoint[] {
  return generateHousingData({ samples: count, seed }).map((sample) => ({
    squareFeet: Math.round(sample.squareFeet),
    price: Math.round(sample.price),
  }));
}

const SAMPLE_SIZE = 160;

export function LinearRegressionExplorer() {
  const [viewMode, setViewMode] = useState<"data" | "model" | "predictions">("model");
  const [mounted, setMounted] = useState(false);
  const previewPoints = useMemo(() => buildPreviewPoints(SAMPLE_SIZE, 77), []);

  // Calculate optimal w and b
  const optimal = useMemo(() => {
    const xs = previewPoints.map((p) => p.squareFeet);
    const ys = previewPoints.map((p) => p.price);
    const xMean = xs.reduce((acc, v) => acc + v, 0) / xs.length;
    const yMean = ys.reduce((acc, v) => acc + v, 0) / ys.length;
    const numerator = xs.reduce((acc, v, i) => acc + (v - xMean) * (ys[i] - yMean), 0);
    const denominator = xs.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
    const w = numerator / denominator;
    const b = yMean - w * xMean;
    return { w: Math.round(w * 10) / 10, b: Math.round(b) };
  }, [previewPoints]);

  // User-adjustable parameters
  const [w, setW] = useState(optimal.w);
  const [b, setB] = useState(optimal.b);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate MSE cost
  const cost = useMemo(() => {
    const predictions = previewPoints.map((p) => w * p.squareFeet + b);
    const errors = previewPoints.map((p, i) => Math.pow(predictions[i] - p.price, 2));
    const mse = errors.reduce((acc, e) => acc + e, 0) / previewPoints.length;
    return Math.round(mse);
  }, [w, b, previewPoints]);

  // Regression line points
  const regressionLine = useMemo(() => {
    const xs = previewPoints.map((p) => p.squareFeet);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return {
      x: [xMin, xMax],
      y: [w * xMin + b, w * xMax + b],
    };
  }, [w, b, previewPoints]);

  const scatterTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "markers",
      x: previewPoints.map((p) => p.squareFeet),
      y: previewPoints.map((p) => p.price),
      text: previewPoints.map((p) => `$${formatNumber(p.price)} @ ${p.squareFeet} sq ft`),
      marker: {
        size: 7,
        color: previewPoints.map((p) => p.price),
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
      name: "Samples",
    }),
    [previewPoints],
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
      x: previewPoints.map((p) => p.squareFeet),
      y: previewPoints.map((p) => w * p.squareFeet + b),
      text: previewPoints.map(
        (p) => `Predicted: $${formatNumber(Math.round(w * p.squareFeet + b))}<br>Actual: $${formatNumber(p.price)}`,
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
    [w, b, previewPoints],
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
        title: "Square Feet",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
        tickformat: ",d",
      },
      yaxis: {
        title: "Price (USD)",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
        tickprefix: "$",
        tickformat: ",",
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
              max={300}
              step={5}
              onChange={setW}
              formula="f(x) = wx + b"
            />
            <ParameterSlider label="Bias (b)" value={b} min={-50000} max={50000} step={1000} onChange={setB} />
          </div>

          <div className="flex items-center justify-between bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.2)] rounded-lg p-4">
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">Cost (MSE):</span>
              <span className="ml-2 text-lg font-mono text-[color:var(--color-accent)]">
                ${mounted ? formatNumber(cost) : cost}
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
          💡 Different w and b values create different prediction lines. Adjust the sliders to find values that
          minimize the cost!
        </p>
      </div>
    </FullScreenCard>
  );
}
