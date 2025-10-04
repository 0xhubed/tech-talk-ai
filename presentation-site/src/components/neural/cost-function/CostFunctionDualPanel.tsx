"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import {
  calculateMSE,
  calculatePredictions,
  calculateOptimalParameters,
  type DataPoint,
} from "@/lib/costFunctions";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
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

// Generate simple dataset: y = 3x + 5 + noise
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

export function CostFunctionDualPanel() {
  const data = useMemo(() => generateData(50, 42), []);
  const optimal = useMemo(() => calculateOptimalParameters(data), [data]);

  // Start with suboptimal parameters to show improvement
  const [w, setW] = useState(2.0);
  const [b, setB] = useState(8.0);
  const [showErrorBars, setShowErrorBars] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  const currentCost = useMemo(() => calculateMSE(data, w, b), [data, w, b]);
  const predictions = useMemo(() => calculatePredictions(data, w, b), [data, w, b]);

  const animateToOptimal = useCallback(() => {
    const steps = 50;
    const wStep = (optimal.w - w) / steps;
    const bStep = (optimal.b - b) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(interval);
        setW(optimal.w);
        setB(optimal.b);
      } else {
        setW((prev) => prev + wStep);
        setB((prev) => prev + bStep);
      }
    }, 20);
  }, [w, b, optimal]);

  // Left panel: Predictions with error bars
  const predictionPlot = useMemo(() => {
    const dataTrace: Partial<Data> = {
      type: "scatter",
      mode: "markers",
      x: data.map((d) => d.x),
      y: data.map((d) => d.y),
      marker: {
        size: 6,
        color: "rgba(35,230,255,0.6)",
      },
      name: "Actual",
    };

    const predictionLine: Partial<Data> = {
      type: "scatter",
      mode: "lines",
      x: [0, 10],
      y: [b, w * 10 + b],
      line: {
        color: "rgba(255,200,87,1)",
        width: 3,
      },
      name: "Prediction",
    };

    const errorBars: Partial<Data>[] = showErrorBars
      ? predictions.map((pred) => {
          const errorMagnitude = Math.abs(pred.error);
          const maxError = Math.max(...predictions.map((p) => Math.abs(p.error)));
          const normalizedError = errorMagnitude / maxError;

          let color;
          if (normalizedError < 0.33) color = "rgba(34,197,94,0.6)"; // green
          else if (normalizedError < 0.67) color = "rgba(251,191,36,0.6)"; // yellow
          else color = "rgba(239,68,68,0.6)"; // red

          return {
            type: "scatter",
            mode: "lines",
            x: [pred.x, pred.x],
            y: [pred.actual, pred.predicted],
            line: {
              color,
              width: 2,
            },
            showlegend: false,
            hoverinfo: "text",
            text: `Error: ${pred.error.toFixed(2)}`,
          } as Partial<Data>;
        })
      : [];

    const layout: Partial<Layout> = {
      autosize: true,
      height: 400,
      margin: { l: 60, r: 20, t: 40, b: 60 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(12,18,26,0.45)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      title: {
        text: "Predictions vs Actual",
        font: { size: 14 },
      },
      xaxis: {
        title: "x",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
        range: [0, 10],
      },
      yaxis: {
        title: "y",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
      },
      showlegend: true,
      legend: {
        x: 0.02,
        y: 0.98,
        bgcolor: "rgba(12,18,26,0.8)",
      },
    };

    return {
      data: [dataTrace, predictionLine, ...errorBars],
      layout,
    };
  }, [data, w, b, showErrorBars, predictions]);

  // Right panel: Cost landscape
  const costPlot = useMemo(() => {
    if (viewMode === "2d") {
      const wRange = Array.from({ length: 50 }, (_, i) => 0 + i * 0.12);
      const bRange = Array.from({ length: 50 }, (_, i) => 0 + i * 0.2);
      const zValues = wRange.map((wi) => bRange.map((bi) => calculateMSE(data, wi, bi)));

      const contourTrace: Partial<Data> = {
        type: "contour",
        x: wRange,
        y: bRange,
        z: zValues,
        colorscale: [
          [0, "#23e6ff"],
          [0.5, "#3f5efb"],
          [1, "#ff2fb9"],
        ],
        contours: {
          coloring: "heatmap",
        },
        colorbar: {
          title: "Cost",
          titleside: "right",
        },
      };

      const currentPosTrace: Partial<Data> = {
        type: "scatter",
        mode: "markers",
        x: [w],
        y: [b],
        marker: {
          size: 15,
          color: "rgba(255,200,87,1)",
          symbol: "circle",
          line: { width: 2, color: "white" },
        },
        name: "Current",
      };

      const optimalTrace: Partial<Data> = {
        type: "scatter",
        mode: "markers",
        x: [optimal.w],
        y: [optimal.b],
        marker: {
          size: 12,
          color: "rgba(34,197,94,1)",
          symbol: "star",
          line: { width: 2, color: "white" },
        },
        name: "Optimal",
      };

      const layout: Partial<Layout> = {
        autosize: true,
        height: 400,
        margin: { l: 60, r: 100, t: 40, b: 60 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(12,18,26,0.45)",
        font: {
          family: "var(--font-inter, system-ui)",
          color: "rgba(245,247,250,0.88)",
        },
        title: {
          text: "Cost Landscape",
          font: { size: 14 },
        },
        xaxis: {
          title: "Weight (w)",
          zeroline: false,
          gridcolor: "rgba(255,255,255,0.08)",
        },
        yaxis: {
          title: "Bias (b)",
          zeroline: false,
          gridcolor: "rgba(255,255,255,0.08)",
        },
        showlegend: false,
      };

      return {
        data: [contourTrace, currentPosTrace, optimalTrace],
        layout,
      };
    } else {
      // 3D view
      const wRange = Array.from({ length: 40 }, (_, i) => 0 + i * 0.15);
      const bRange = Array.from({ length: 40 }, (_, i) => 0 + i * 0.25);
      const zValues = wRange.map((wi) => bRange.map((bi) => calculateMSE(data, wi, bi)));

      const surfaceTrace: Partial<Data> = {
        type: "surface",
        x: wRange,
        y: bRange,
        z: zValues,
        colorscale: [
          [0, "#23e6ff"],
          [0.5, "#3f5efb"],
          [1, "#ff2fb9"],
        ],
        colorbar: {
          title: "Cost",
          titleside: "right",
        },
      };

      const currentPosTrace: Partial<Data> = {
        type: "scatter3d",
        mode: "markers",
        x: [w],
        y: [b],
        z: [currentCost],
        marker: {
          size: 8,
          color: "rgba(255,200,87,1)",
          symbol: "circle",
          line: { width: 2, color: "white" },
        },
        name: "Current",
      };

      const optimalPosTrace: Partial<Data> = {
        type: "scatter3d",
        mode: "markers",
        x: [optimal.w],
        y: [optimal.b],
        z: [optimal.cost],
        marker: {
          size: 8,
          color: "rgba(34,197,94,1)",
          symbol: "diamond",
          line: { width: 2, color: "white" },
        },
        name: "Optimal",
      };

      const layout: Partial<Layout> = {
        autosize: true,
        height: 400,
        margin: { l: 0, r: 0, t: 40, b: 0 },
        paper_bgcolor: "rgba(0,0,0,0)",
        font: {
          family: "var(--font-inter, system-ui)",
          color: "rgba(245,247,250,0.88)",
        },
        title: {
          text: "Cost Landscape",
          font: { size: 14 },
        },
        scene: {
          xaxis: { title: "Weight (w)", gridcolor: "rgba(255,255,255,0.1)" },
          yaxis: { title: "Bias (b)", gridcolor: "rgba(255,255,255,0.1)" },
          zaxis: { title: "Cost", gridcolor: "rgba(255,255,255,0.1)" },
          bgcolor: "rgba(12,18,26,0.45)",
        },
      };

      return {
        data: [surfaceTrace, currentPosTrace, optimalPosTrace],
        layout,
      };
    }
  }, [data, w, b, currentCost, optimal, viewMode]);

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Interactive Cost Function Explorer">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Weight slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[color:var(--color-text-primary)]">
                Weight (w)
              </label>
              <span className="text-sm text-[color:var(--color-text-secondary)] font-mono">
                {w.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="0.1"
              value={w}
              onChange={(e) => setW(parseFloat(e.target.value))}
              className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
            />
          </div>

          {/* Bias slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[color:var(--color-text-primary)]">
                Bias (b)
              </label>
              <span className="text-sm text-[color:var(--color-text-secondary)] font-mono">
                {b.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value))}
              className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={animateToOptimal}
            className="px-4 py-2 bg-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.3)] border border-[rgba(34,197,94,0.5)] rounded-lg text-sm font-medium text-[color:var(--color-text-primary)] transition-colors"
          >
            Animate to Optimal
          </button>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showErrorBars}
              onChange={(e) => setShowErrorBars(e.target.checked)}
              className="w-4 h-4 accent-[rgba(255,200,87,1)]"
            />
            <span className="text-[color:var(--color-text-secondary)]">Show Error Bars</span>
          </label>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "2d"
                  ? "bg-[rgba(35,230,255,0.2)] border border-[rgba(35,230,255,0.5)] text-[color:var(--color-text-primary)]"
                  : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[color:var(--color-text-secondary)]"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === "3d"
                  ? "bg-[rgba(35,230,255,0.2)] border border-[rgba(35,230,255,0.5)] text-[color:var(--color-text-primary)]"
                  : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[color:var(--color-text-secondary)]"
              }`}
            >
              3D
            </button>
          </div>
        </div>

        {/* Cost display */}
        <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">Current MSE:</span>
              <span className="ml-2 text-lg font-mono font-bold text-[rgba(255,200,87,1)]">
                {currentCost.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-sm text-[color:var(--color-text-secondary)]">Optimal MSE:</span>
              <span className="ml-2 text-lg font-mono font-bold text-[rgba(34,197,94,1)]">
                {optimal.cost.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual plot panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[rgba(12,18,26,0.3)] rounded-lg p-2">
          <Plot
            data={predictionPlot.data}
            layout={predictionPlot.layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <div className="bg-[rgba(12,18,26,0.3)] rounded-lg p-2">
          <Plot
            data={costPlot.data}
            layout={costPlot.layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          <strong className="text-[color:var(--color-text-primary)]">
            See the Connection:
          </strong>{" "}
          As you adjust w and b, watch how the prediction line changes (left), which changes the
          errors (vertical bars), which changes the cost value and your position on the cost
          landscape (right). The bowl shape guarantees a single global minimum.
        </p>
      </div>
    </FullScreenCard>
  );
}
