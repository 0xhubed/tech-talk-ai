"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Config, Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading visualization…
    </div>
  ),
});

type PathPoint = {
  w: number;
  b: number;
  cost: number;
};

function runGradientDescent(
  startW: number,
  startB: number,
  alpha: number,
  maxIters: number = 200
): PathPoint[] {
  const path: PathPoint[] = [];
  let w = startW;
  let b = startB;

  for (let i = 0; i < maxIters; i++) {
    const cost = w * w + 0.5 * b * b;
    path.push({ w, b, cost });

    const gradW = 2 * w;
    const gradB = b;

    // Check for divergence
    if (!isFinite(cost) || cost > 1000) {
      break;
    }

    w = w - alpha * gradW;
    b = b - alpha * gradB;

    // Check convergence
    if (Math.abs(gradW) < 0.001 && Math.abs(gradB) < 0.001) {
      path.push({ w, b, cost: w * w + 0.5 * b * b });
      break;
    }
  }

  return path;
}

export function LearningRateComparison() {
  const startPoint = { w: -2.5, b: 2.0 };

  const scenarios = useMemo(
    () => [
      {
        alpha: 0.01,
        label: "Too Small",
        color: "rgba(251,191,36,0.8)",
        description: "Very slow convergence",
      },
      {
        alpha: 0.15,
        label: "Optimal",
        color: "rgba(34,197,94,0.8)",
        description: "Fast and efficient",
      },
      {
        alpha: 0.95,
        label: "Too Large",
        color: "rgba(239,68,68,0.8)",
        description: "Overshooting, zigzag",
      },
      {
        alpha: 1.5,
        label: "Way Too Large",
        color: "rgba(220,38,38,0.8)",
        description: "Diverges!",
      },
    ],
    []
  );

  const paths = useMemo(
    () =>
      scenarios.map((scenario) =>
        runGradientDescent(startPoint.w, startPoint.b, scenario.alpha)
      ),
    [scenarios, startPoint]
  );

  // Create contour base for all subplots
  const contourBase = useMemo(() => {
    const wRange = Array.from({ length: 40 }, (_, i) => -3 + (i * 6) / 39);
    const bRange = Array.from({ length: 40 }, (_, i) => -3 + (i * 6) / 39);
    const zValues = wRange.map((w) => bRange.map((b) => w * w + 0.5 * b * b));
    return { wRange, bRange, zValues };
  }, []);

  const subplots = useMemo(() => {
    return scenarios.map((scenario, idx) => {
      const path = paths[idx];
      // Check if diverged first (any point with cost > 1000 or infinite)
      const diverged = path.some((p) => !isFinite(p.cost) || p.cost > 1000);

      // For better classification, check path stability: oscillation vs smooth descent
      const isOscillating = path.length > 3 && (() => {
        const lastFew = path.slice(-Math.min(5, path.length));
        const costs = lastFew.map(p => p.cost);
        // Check if costs are bouncing up and down
        let increases = 0;
        for (let i = 1; i < costs.length; i++) {
          if (costs[i] > costs[i-1] * 1.01) increases++;
        }
        return increases > 1;
      })();

      // Only mark as truly converged if smooth descent, not oscillating
      const converged = !diverged && !isOscillating && path.length < 200 && path[path.length - 1].cost < 0.01;

      const contourTrace: Partial<Data> = {
        type: "contour",
        x: contourBase.wRange,
        y: contourBase.bRange,
        z: contourBase.zValues,
        colorscale: [
          [0, "#23e6ff"],
          [0.5, "#3f5efb"],
          [1, "#ff2fb9"],
        ],
        showscale: false,
        contours: {
          coloring: "heatmap",
        },
        opacity: 0.6,
        hoverinfo: "skip",
      };

      const pathTrace: Partial<Data> = {
        type: "scatter",
        mode: "lines+markers",
        x: path.map((p) => p.w),
        y: path.map((p) => p.b),
        line: {
          color: scenario.color,
          width: 2,
        },
        marker: {
          size: 4,
          color: scenario.color,
        },
        showlegend: false,
        hovertemplate: "Step %{pointNumber}<br>w: %{x:.3f}<br>b: %{y:.3f}<extra></extra>",
      };

      const startMarker: Partial<Data> = {
        type: "scatter",
        mode: "markers",
        x: [path[0].w],
        y: [path[0].b],
        marker: {
          size: 10,
          color: "white",
          symbol: "circle",
          line: { width: 2, color: scenario.color },
        },
        showlegend: false,
        hoverinfo: "skip",
      };

      const endMarker: Partial<Data> = {
        type: "scatter",
        mode: "markers",
        x: [path[path.length - 1].w],
        y: [path[path.length - 1].b],
        marker: {
          size: 10,
          color: scenario.color,
          symbol: converged ? "star" : diverged ? "x" : "circle",
          line: { width: 2, color: "white" },
        },
        showlegend: false,
        hoverinfo: "skip",
      };

      const layout: Partial<Layout> = {
        autosize: true,
        height: 280,
        margin: { l: 40, r: 20, t: 50, b: 40 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(12,18,26,0.45)",
        font: {
          family: "var(--font-inter, system-ui)",
          color: "rgba(245,247,250,0.88)",
        },
        title: {
          text: `α = ${scenario.alpha} - ${scenario.label}`,
          font: { size: 13 },
        },
        xaxis: {
          range: [-3, 3],
          zeroline: true,
          zerolinecolor: "rgba(255,255,255,0.2)",
          gridcolor: "rgba(255,255,255,0.05)",
          showticklabels: false,
        },
        yaxis: {
          range: [-3, 3],
          zeroline: true,
          zerolinecolor: "rgba(255,255,255,0.2)",
          gridcolor: "rgba(255,255,255,0.05)",
          scaleanchor: "x",
          showticklabels: false,
        },
        showlegend: false,
      };

      return {
        data: [contourTrace, pathTrace, startMarker, endMarker],
        layout,
        scenario,
        path,
        converged,
        diverged,
      };
    });
  }, [scenarios, paths, contourBase]);

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: true,
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-2">
          Learning Rate Sensitivity: The Goldilocks Problem
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Learning rate (α) controls step size. Too small is slow, too large causes problems. Compare
          four scenarios starting from the same point.
        </p>
      </div>

      {/* Grid of subplots */}
      <div className="grid md:grid-cols-2 gap-4">
        {subplots.map((subplot, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 ${
              subplot.scenario.label === "Optimal"
                ? "border-[rgba(34,197,94,0.5)] bg-[rgba(34,197,94,0.05)]"
                : subplot.diverged
                  ? "border-[rgba(220,38,38,0.5)] bg-[rgba(220,38,38,0.05)]"
                  : "border-[rgba(255,255,255,0.1)] bg-[rgba(12,18,26,0.3)]"
            }`}
          >
            <Plot
              data={subplot.data}
              layout={subplot.layout}
              config={config}
              style={{ width: "100%", height: "100%" }}
            />

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[color:var(--color-text-secondary)]">Steps taken:</span>
                <span className="font-mono font-bold text-[color:var(--color-text-primary)]">
                  {subplot.path.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          📊 Comparison Summary
        </h4>
        <p className="text-xs text-[color:var(--color-text-secondary)] mb-3 italic">
          Note: Fewer steps doesn&apos;t always mean better! Look for smooth, stable convergence.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.1)]">
                <th className="text-left py-2 text-[color:var(--color-text-secondary)]">
                  Learning Rate
                </th>
                <th className="text-left py-2 text-[color:var(--color-text-secondary)]">
                  Category
                </th>
                <th className="text-right py-2 text-[color:var(--color-text-secondary)]">Steps</th>
                <th className="text-right py-2 text-[color:var(--color-text-secondary)]">
                  Final Cost
                </th>
                <th className="text-left py-2 text-[color:var(--color-text-secondary)]">Result</th>
              </tr>
            </thead>
            <tbody>
              {subplots.map((subplot, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-[rgba(255,255,255,0.05)] ${
                    subplot.scenario.label === "Optimal" ? "bg-[rgba(34,197,94,0.1)]" : ""
                  }`}
                >
                  <td className="py-2 font-mono text-[color:var(--color-text-primary)]">
                    {subplot.scenario.alpha}
                  </td>
                  <td className="py-2 text-[color:var(--color-text-secondary)]">
                    {subplot.scenario.label}
                  </td>
                  <td className="py-2 text-right font-mono text-[color:var(--color-text-primary)]">
                    {subplot.path.length}
                  </td>
                  <td className="py-2 text-right font-mono text-[color:var(--color-text-primary)]">
                    {subplot.diverged
                      ? "—"
                      : subplot.path.length > 0
                        ? subplot.path[subplot.path.length - 1].cost.toFixed(4)
                        : "—"}
                  </td>
                  <td className="py-2">
                    {subplot.converged ? (
                      <span className="text-[rgba(34,197,94,1)]">Converged ✅</span>
                    ) : subplot.diverged ? (
                      <span className="text-[rgba(220,38,38,1)]">Diverged ❌</span>
                    ) : (
                      <span className="text-[rgba(251,191,36,1)]">Slow ⏱️</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
            🐌 Too Small (α = 0.01)
          </h4>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            Takes tiny steps. Converges <strong>eventually</strong>, but needs many iterations.
            Inefficient for training large models.
          </p>
        </div>

        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
            ✅ Optimal (α = 0.15)
          </h4>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            Balances speed and stability. Converges quickly in ~25 steps. This is the{" "}
            <strong>&ldquo;Goldilocks zone&rdquo;</strong> for our function.
          </p>
        </div>

        <div className="bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
            ⚠️ Too Large (α = 0.95)
          </h4>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            Massively overshoots the minimum and <strong>zigzags wildly</strong> back and forth. On the
            edge of stability - takes many more steps than optimal. Extremely risky on real loss landscapes!
          </p>
        </div>
      </div>

      {/* Practical implications */}
      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
          🎯 Practical Implications
        </h4>
        <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-1">
          <li>
            • <strong>Rule of thumb:</strong> Start with α ≈ 0.01–0.3, then tune based on
            convergence
          </li>
          <li>
            • <strong>Learning rate scheduling:</strong> Start large, decrease over time (e.g., α =
            α₀ / (1 + t))
          </li>
          <li>
            • <strong>Adaptive methods:</strong> Adam, RMSprop adjust α automatically per parameter
          </li>
          <li>
            • <strong>Grid search:</strong> Try [0.001, 0.01, 0.1, 1.0] and pick what works best
          </li>
        </ul>
      </div>
    </div>
  );
}
