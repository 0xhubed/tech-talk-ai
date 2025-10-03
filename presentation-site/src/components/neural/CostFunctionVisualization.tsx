"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { ViewModeButtons } from "./shared/ViewModeButtons";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading cost surface…
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
    const noise = (rng() - 0.5) * 3; // noise in range [-1.5, 1.5]
    const y = 3 * x + 5 + noise; // true relationship: y = 3x + 5
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }

  return points;
}

export function CostFunctionVisualization() {
  const [viewMode, setViewMode] = useState<"1d" | "2d" | "3d">("1d");
  const [showOptimal, setShowOptimal] = useState(true);

  // Generate data for cost calculations
  const dataPoints = useMemo(() => generateCleanData(80, 42), []);

  // Calculate optimal parameters
  const optimal = useMemo(() => {
    const xs = dataPoints.map((d) => d.x);
    const ys = dataPoints.map((d) => d.y);
    const xMean = xs.reduce((acc, v) => acc + v, 0) / xs.length;
    const yMean = ys.reduce((acc, v) => acc + v, 0) / ys.length;
    const numerator = xs.reduce((acc, v, i) => acc + (v - xMean) * (ys[i] - yMean), 0);
    const denominator = xs.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
    const w = numerator / denominator;
    const b = yMean - w * xMean;

    // Calculate cost at optimal
    const predictions = dataPoints.map((d) => w * d.x + b);
    const cost = predictions.reduce((acc, pred, i) => acc + Math.pow(pred - dataPoints[i].y, 2), 0) / dataPoints.length;

    return { w: Number(w.toFixed(2)), b: Number(b.toFixed(2)), cost: Number(cost.toFixed(3)) };
  }, [dataPoints]);

  // Calculate cost function
  const calculateCost = (w: number, b: number) => {
    const predictions = dataPoints.map((d) => w * d.x + b);
    return predictions.reduce((acc, pred, i) => acc + Math.pow(pred - dataPoints[i].y, 2), 0) / dataPoints.length;
  };

  // 1D view: Cost vs w (b fixed at optimal)
  const view1D = useMemo(() => {
    const wRange = Array.from({ length: 100 }, (_, i) => 0 + i * 0.06); // w from 0 to 6
    const costs = wRange.map((w) => calculateCost(w, optimal.b));

    const trace: Partial<Data> = {
      type: "scatter",
      mode: "lines",
      x: wRange,
      y: costs,
      line: {
        color: "rgba(35,230,255,0.8)",
        width: 3,
      },
      name: "Cost",
    };

    const optimalTrace: Partial<Data> = showOptimal
      ? {
          type: "scatter",
          mode: "markers",
          x: [optimal.w],
          y: [optimal.cost],
          marker: {
            size: 12,
            color: "rgba(255,200,87,1)",
            symbol: "star",
          },
          name: "Optimal",
        }
      : {};

    const layout: Partial<Layout> = {
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
        title: "Weight (w)",
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

    return { data: showOptimal ? [trace, optimalTrace] : [trace], layout };
  }, [optimal, showOptimal, dataPoints]);

  // 2D view: Contour plot
  const view2D = useMemo(() => {
    const wRange = Array.from({ length: 50 }, (_, i) => 0 + i * 0.12); // w from 0 to 6
    const bRange = Array.from({ length: 50 }, (_, i) => 0 + i * 0.2);  // b from 0 to 10
    const zValues = wRange.map((w) => bRange.map((b) => calculateCost(w, b)));

    const trace: Partial<Data> = {
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

    const optimalTrace: Partial<Data> = showOptimal
      ? {
          type: "scatter",
          mode: "markers",
          x: [optimal.w],
          y: [optimal.b],
          marker: {
            size: 15,
            color: "rgba(255,200,87,1)",
            symbol: "star",
            line: { width: 2, color: "white" },
          },
          name: "Optimal",
        }
      : {};

    const layout: Partial<Layout> = {
      autosize: true,
      height: 400,
      margin: { l: 70, r: 100, t: 32, b: 70 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(12,18,26,0.45)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
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

    return { data: showOptimal ? [trace, optimalTrace] : [trace], layout };
  }, [optimal, showOptimal, dataPoints]);

  // 3D view: Surface plot
  const view3D = useMemo(() => {
    const wRange = Array.from({ length: 40 }, (_, i) => 0 + i * 0.15); // w from 0 to 6
    const bRange = Array.from({ length: 40 }, (_, i) => 0 + i * 0.25); // b from 0 to 10
    const zValues = wRange.map((w) => bRange.map((b) => calculateCost(w, b)));

    const trace: Partial<Data> = {
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

    const optimalTrace: Partial<Data> = showOptimal
      ? {
          type: "scatter3d",
          mode: "markers",
          x: [optimal.w],
          y: [optimal.b],
          z: [optimal.cost],
          marker: {
            size: 8,
            color: "rgba(255,200,87,1)",
            symbol: "diamond",
            line: { width: 2, color: "white" },
          },
          name: "Optimal",
        }
      : {};

    const layout: Partial<Layout> = {
      autosize: true,
      height: 500,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      scene: {
        xaxis: { title: "Weight (w)", gridcolor: "rgba(255,255,255,0.1)" },
        yaxis: { title: "Bias (b)", gridcolor: "rgba(255,255,255,0.1)" },
        zaxis: { title: "Cost", gridcolor: "rgba(255,255,255,0.1)" },
        bgcolor: "rgba(12,18,26,0.45)",
      },
    };

    return { data: showOptimal ? [trace, optimalTrace] : [trace], layout };
  }, [optimal, showOptimal, dataPoints]);

  const config: Partial<Config> = useMemo(
    () => ({
      displaylogo: false,
      responsive: true,
      staticPlot: false,
    }),
    [],
  );

  const getView = () => {
    if (viewMode === "1d") return view1D;
    if (viewMode === "2d") return view2D;
    return view3D;
  };

  const currentView = getView();

  return (
    <FullScreenCard className="glass-panel p-6" title="Cost Function Landscape">
      <div className="mb-6">
        <ViewModeButtons
          modes={[
            { id: "1d", label: "1D (w only)" },
            { id: "2d", label: "2D Contour" },
            { id: "3d", label: "3D Surface" },
          ]}
          active={viewMode}
          onChange={(mode) => setViewMode(mode as "1d" | "2d" | "3d")}
        />
      </div>

      <div className="relative">
        <Plot data={currentView.data} layout={currentView.layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Optimal parameters: w = {optimal.w.toFixed(2)}, b = {optimal.b.toFixed(2)}, MSE = {optimal.cost.toFixed(3)}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showOptimal}
            onChange={(e) => setShowOptimal(e.target.checked)}
            className="w-4 h-4 accent-[rgba(255,200,87,1)]"
          />
          <span className="text-[color:var(--color-text-secondary)]">Show Optimal</span>
        </label>
      </div>

      <div className="mt-6 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          <strong className="text-[color:var(--color-text-primary)]">Cost function: MSE = (1/n)Σ(ŷ - y)²</strong> where ŷ = wx + b.
          The bowl shape indicates a convex function with one global minimum. True relationship: y = 3x + 5.
        </p>
      </div>
    </FullScreenCard>
  );
}
