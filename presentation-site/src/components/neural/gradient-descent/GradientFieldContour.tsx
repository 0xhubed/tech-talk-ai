"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useCallback } from "react";
import type { Config, Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading visualization…
    </div>
  ),
});

type PathPoint = {
  w: number;
  b: number;
  cost: number;
  gradW: number;
  gradB: number;
};

export function GradientFieldContour() {
  const [startW, setStartW] = useState(-2.5);
  const [startB, setStartB] = useState(2.0);
  const [learningRate, setLearningRate] = useState(0.15);
  const [showArrows, setShowArrows] = useState(true);
  const [showPath, setShowPath] = useState(true);

  // Cost function: J(w,b) = w² + 0.5b²
  const costFunction = useCallback((w: number, b: number) => {
    return w * w + 0.5 * b * b;
  }, []);

  // Gradients: ∂J/∂w = 2w, ∂J/∂b = b
  const gradients = useCallback((w: number, b: number) => {
    return { gradW: 2 * w, gradB: b };
  }, []);

  // Run gradient descent from starting point
  const descentPath = useMemo(() => {
    const path: PathPoint[] = [];
    let w = startW;
    let b = startB;

    for (let i = 0; i < 100; i++) {
      const cost = costFunction(w, b);
      const { gradW, gradB } = gradients(w, b);
      path.push({ w, b, cost, gradW, gradB });

      // Update
      w = w - learningRate * gradW;
      b = b - learningRate * gradB;

      // Stop if converged
      if (Math.abs(gradW) < 0.001 && Math.abs(gradB) < 0.001) break;
    }

    return path;
  }, [startW, startB, learningRate, costFunction, gradients]);

  // Generate contour and gradient field data
  const plotData = useMemo(() => {
    // Contour plot
    const wRange = Array.from({ length: 50 }, (_, i) => -3 + (i * 6) / 49);
    const bRange = Array.from({ length: 50 }, (_, i) => -3 + (i * 6) / 49);
    const zValues = wRange.map((w) => bRange.map((b) => costFunction(w, b)));

    const contourTrace: Partial<Data> = {
      type: "contour",
      x: wRange,
      y: bRange,
      z: zValues,
      colorscale: [
        [0, "#23e6ff"],
        [0.3, "#3f5efb"],
        [0.7, "#7c5cff"],
        [1, "#ff2fb9"],
      ],
      contours: {
        coloring: "heatmap",
        showlabels: true,
        labelfont: { size: 9, color: "white" },
      },
      colorbar: {
        title: "Cost",
        titleside: "right",
      },
      hovertemplate: "w: %{x:.2f}<br>b: %{y:.2f}<br>cost: %{z:.2f}<extra></extra>",
    };

    const traces: Partial<Data>[] = [contourTrace];

    // Gradient arrows (quiver-like)
    if (showArrows) {
      const arrowSpacing = 0.4;
      const arrowW: number[] = [];
      const arrowB: number[] = [];
      const arrowU: number[] = [];
      const arrowV: number[] = [];

      for (let w = -3; w <= 3; w += arrowSpacing) {
        for (let b = -3; b <= 3; b += arrowSpacing) {
          const { gradW, gradB } = gradients(w, b);
          const magnitude = Math.sqrt(gradW * gradW + gradB * gradB);

          if (magnitude > 0.1) {
            // Normalize and scale
            const scale = 0.15;
            arrowW.push(w);
            arrowB.push(b);
            arrowU.push((gradW / magnitude) * scale);
            arrowV.push((gradB / magnitude) * scale);
          }
        }
      }

      // Create arrow annotations
      const arrowAnnotations = arrowW.map((w, i) => ({
        x: w + arrowU[i],
        y: arrowB[i] + arrowV[i],
        ax: w,
        ay: arrowB[i],
        xref: "x" as const,
        yref: "y" as const,
        axref: "x" as const,
        ayref: "y" as const,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 1.5,
        arrowcolor: "rgba(255,255,255,0.4)",
      }));

      // Store annotations for layout
      traces.push({
        type: "scatter",
        x: arrowW,
        y: arrowB,
        mode: "markers",
        marker: {
          size: 1,
          color: "rgba(255,255,255,0.1)",
        },
        showlegend: false,
        hoverinfo: "skip",
      } as Partial<Data>);
    }

    // Descent path
    if (showPath && descentPath.length > 0) {
      const pathTrace: Partial<Data> = {
        type: "scatter",
        mode: "lines+markers",
        x: descentPath.map((p) => p.w),
        y: descentPath.map((p) => p.b),
        line: {
          color: "rgba(255,200,87,1)",
          width: 3,
        },
        marker: {
          size: 6,
          color: "rgba(255,200,87,1)",
          line: { width: 1, color: "white" },
        },
        name: "Descent Path",
        hovertemplate: "Step %{pointNumber}<br>w: %{x:.3f}<br>b: %{y:.3f}<extra></extra>",
      };

      traces.push(pathTrace);

      // Starting point marker
      traces.push({
        type: "scatter",
        mode: "markers",
        x: [descentPath[0].w],
        y: [descentPath[0].b],
        marker: {
          size: 12,
          color: "rgba(255,100,100,1)",
          symbol: "circle",
          line: { width: 2, color: "white" },
        },
        name: "Start",
        hovertemplate: "Start: (%{x:.2f}, %{y:.2f})<extra></extra>",
      } as Partial<Data>);

      // Minimum marker
      traces.push({
        type: "scatter",
        mode: "markers",
        x: [0],
        y: [0],
        marker: {
          size: 15,
          color: "rgba(34,197,94,1)",
          symbol: "star",
          line: { width: 2, color: "white" },
        },
        name: "Minimum",
        hovertemplate: "Minimum: (0, 0)<extra></extra>",
      } as Partial<Data>);
    }

    const layout: Partial<Layout> = {
      autosize: true,
      height: 550,
      margin: { l: 60, r: 100, t: 40, b: 60 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(12,18,26,0.45)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      title: {
        text: "2D Gradient Field: Bird's-Eye View",
        font: { size: 16 },
      },
      xaxis: {
        title: "w (weight)",
        zeroline: true,
        zerolinecolor: "rgba(255,255,255,0.3)",
        gridcolor: "rgba(255,255,255,0.08)",
        range: [-3, 3],
      },
      yaxis: {
        title: "b (bias)",
        zeroline: true,
        zerolinecolor: "rgba(255,255,255,0.3)",
        gridcolor: "rgba(255,255,255,0.08)",
        range: [-3, 3],
        scaleanchor: "x",
      },
      showlegend: true,
      legend: {
        x: 1.05,
        y: 1,
        bgcolor: "rgba(12,18,26,0.8)",
        bordercolor: "rgba(255,255,255,0.1)",
        borderwidth: 1,
      },
    };

    return { data: traces, layout };
  }, [costFunction, gradients, showArrows, showPath, descentPath]);

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
  };

  const resetToDefault = () => {
    setStartW(-2.5);
    setStartB(2.0);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-2">
          2D Gradient Field: See the Landscape
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Contour lines show cost levels (like a topographic map). Gradient arrows point uphill. The
          descent path goes downhill by moving opposite to the arrows.
        </p>
      </div>

      {/* Visualization */}
      <div>
        <Plot
          data={plotData.data}
          layout={plotData.layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Starting point controls */}
        <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
            Starting Point
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[color:var(--color-text-secondary)]">w (weight):</label>
                <span className="text-xs font-mono text-[color:var(--color-text-primary)]">
                  {startW.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={startW}
                onChange={(e) => setStartW(parseFloat(e.target.value))}
                className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[color:var(--color-text-secondary)]">b (bias):</label>
                <span className="text-xs font-mono text-[color:var(--color-text-primary)]">
                  {startB.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.1"
                value={startB}
                onChange={(e) => setStartB(parseFloat(e.target.value))}
                className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
              />
            </div>
            <button
              onClick={resetToDefault}
              className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-[color:var(--color-text-secondary)] transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Parameters and toggles */}
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
            Settings
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-[color:var(--color-text-secondary)]">
                  Learning Rate α:
                </label>
                <span className="text-xs font-mono text-[color:var(--color-text-primary)]">
                  {learningRate.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(34,197,94,1)]"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArrows}
                  onChange={(e) => setShowArrows(e.target.checked)}
                  className="w-4 h-4 accent-[rgba(255,255,255,0.6)]"
                />
                <span className="text-[color:var(--color-text-secondary)]">
                  Show gradient arrows
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPath}
                  onChange={(e) => setShowPath(e.target.checked)}
                  className="w-4 h-4 accent-[rgba(255,200,87,1)]"
                />
                <span className="text-[color:var(--color-text-secondary)]">Show descent path</span>
              </label>
            </div>

            {showPath && descentPath.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                <div className="text-xs text-[color:var(--color-text-secondary)]">
                  Converged in <span className="font-bold text-[color:var(--color-text-primary)]">{descentPath.length}</span> steps
                </div>
                <div className="text-xs text-[color:var(--color-text-secondary)] mt-1">
                  Final cost: <span className="font-mono text-[rgba(34,197,94,1)]">{descentPath[descentPath.length - 1].cost.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
            Reading the Map
          </h4>
          <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-1">
            <li>• Contour lines = places with same cost (like elevation on a map)</li>
            <li>• Arrows point uphill (toward higher cost)</li>
            <li>• Gradient descent goes downhill (opposite of arrows)</li>
            <li>• Path crosses contours perpendicularly</li>
          </ul>
        </div>

        <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
            Why Negative Gradient?
          </h4>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Gradient ∇f points toward steepest <strong>increase</strong> in cost. Since we want to{" "}
            <strong>decrease</strong> cost, we move in the <strong>opposite</strong> direction: -∇f.
            That&apos;s why the update rule has a minus sign!
          </p>
        </div>
      </div>
    </div>
  );
}
