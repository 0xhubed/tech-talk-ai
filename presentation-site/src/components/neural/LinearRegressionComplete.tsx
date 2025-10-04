"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading visualization…
    </div>
  ),
});

// Seeded random number generator
function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function LinearRegressionComplete() {
  const [showResiduals, setShowResiduals] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);

  // Generate data: y = 2x + 3 + noise
  const data = useMemo(() => {
    const rng = createRng(42);
    const points = [];
    for (let i = 0; i < 30; i++) {
      const x = i / 3;
      const noise = (rng() - 0.5) * 8; // Increased from 4 to 8 for more visible errors
      const y = 2 * x + 3 + noise;
      points.push({ x, y });
    }
    return points;
  }, []);

  // Calculate best fit using least squares
  const { w, b } = useMemo(() => {
    const n = data.length;
    const sumX = data.reduce((acc, p) => acc + p.x, 0);
    const sumY = data.reduce((acc, p) => acc + p.y, 0);
    const sumXY = data.reduce((acc, p) => acc + p.x * p.y, 0);
    const sumX2 = data.reduce((acc, p) => acc + p.x * p.x, 0);

    const w = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - w * sumX) / n;

    return { w, b };
  }, [data]);

  // Calculate MSE
  const mse = useMemo(() => {
    const errors = data.map((p) => Math.pow(w * p.x + b - p.y, 2));
    return errors.reduce((acc, e) => acc + e, 0) / data.length;
  }, [data, w, b]);

  // Line trace
  const xs = data.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const traces: Partial<Data>[] = [
    // Scatter points
    {
      type: "scatter",
      mode: "markers",
      x: data.map((p) => p.x),
      y: data.map((p) => p.y),
      marker: {
        size: 10,
        color: "rgba(35,230,255,0.8)",
        line: { width: 2, color: "rgba(255,255,255,0.4)" },
      },
      name: "Data Points",
      hovertemplate: "x=%{x:.1f}<br>y=%{y:.1f}<extra></extra>",
    },
    // Best fit line
    {
      type: "scatter",
      mode: "lines",
      x: [xMin, xMax],
      y: [w * xMin + b, w * xMax + b],
      line: {
        color: "rgba(255,200,87,1)",
        width: 4,
      },
      name: "Best Fit Line",
      hoverinfo: "skip",
    },
  ];

  // Add residual lines if toggled
  if (showResiduals) {
    data.forEach((point) => {
      const predicted = w * point.x + b;
      traces.push({
        type: "scatter",
        mode: "lines",
        x: [point.x, point.x],
        y: [point.y, predicted],
        line: {
          color: "rgba(255,47,185,0.7)", // Increased opacity from 0.4 to 0.7
          width: 3, // Increased from 2 to 3
          dash: "solid", // Changed from "dot" to solid for better visibility
        },
        showlegend: false,
        hoverinfo: "skip",
      });
    });
  }

  const layout: Partial<Layout> = {
    autosize: true,
    height: 400,
    margin: { l: 60, r: 20, t: 20, b: 60 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
      size: 14,
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

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: false,
  };

  return (
    <section id="linear-regression-intro" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="badge">Foundation</span>
          <h2 className="section-heading mt-4">
            What is Linear Regression?
          </h2>
          <p className="section-body max-w-3xl mx-auto">
            Linear regression finds the best straight line through data points. It's the simplest form of supervised learning
            and the foundation for understanding all machine learning models.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: Interactive Visualization */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Interactive Visualization
            </h3>

            <div className="relative mb-6">
              <Plot data={traces} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setShowResiduals(!showResiduals)}
                className={`px-4 py-2 rounded-lg border transition ${
                  showResiduals
                    ? "border-[rgba(255,47,185,0.6)] bg-[rgba(255,47,185,0.2)] text-white"
                    : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
                }`}
              >
                {showResiduals ? "✓ " : ""}Show Errors
              </button>

              <button
                type="button"
                onClick={() => setShowNetwork(!showNetwork)}
                className={`px-4 py-2 rounded-lg border transition ${
                  showNetwork
                    ? "border-[rgba(124,92,255,0.6)] bg-[rgba(124,92,255,0.2)] text-white"
                    : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
                }`}
              >
                {showNetwork ? "✓ " : ""}Network View
              </button>

              <div className="ml-auto bg-[rgba(12,18,26,0.6)] border border-[rgba(35,230,255,0.3)] rounded-lg px-4 py-2">
                <span className="text-sm text-[color:var(--color-text-secondary)]">Equation: </span>
                <span className="font-mono text-[color:var(--color-accent)]">
                  y = {w.toFixed(2)}x + {b.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Network Diagram */}
            {showNetwork && (
              <div className="bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.3)] rounded-lg p-6">
                <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-6">
                  Neural Network View: Single Neuron
                </h4>

                <div className="flex items-center justify-center gap-6 py-4 overflow-x-auto">
                  {/* Input */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(35,230,255,0.2)] border-2 border-[rgba(35,230,255,0.6)] flex items-center justify-center">
                      <span className="text-xl font-bold text-[color:var(--color-accent)]">x</span>
                    </div>
                    <p className="text-xs text-[color:var(--color-text-secondary)] mt-2">Input</p>
                  </div>

                  {/* Arrow with weight */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <svg width="70" height="4">
                      <line x1="0" y1="2" x2="70" y2="2" stroke="rgba(255,200,87,0.8)" strokeWidth="3" />
                      <polygon points="70,2 62,0 62,4" fill="rgba(255,200,87,0.8)" />
                    </svg>
                    <div className="mt-2 bg-[rgba(255,200,87,0.2)] border border-[rgba(255,200,87,0.6)] rounded px-2 py-1 whitespace-nowrap">
                      <span className="text-xs font-mono text-[color:var(--color-text-primary)]">× w={w.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Sum node */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(124,92,255,0.2)] border-2 border-[rgba(124,92,255,0.6)] flex items-center justify-center">
                      <span className="text-2xl font-bold text-[color:var(--color-text-primary)]">Σ</span>
                    </div>
                    <p className="text-xs text-[color:var(--color-text-secondary)] mt-2">Sum</p>
                  </div>

                  {/* Bias arrow */}
                  <div className="flex flex-col items-center -ml-2 flex-shrink-0">
                    <svg width="50" height="50">
                      <line x1="25" y1="0" x2="25" y2="50" stroke="rgba(255,47,185,0.6)" strokeWidth="2" strokeDasharray="4,4" />
                      <polygon points="25,50 23,42 27,42" fill="rgba(255,47,185,0.6)" />
                    </svg>
                    <div className="bg-[rgba(255,47,185,0.2)] border border-[rgba(255,47,185,0.6)] rounded px-2 py-1 -mt-6 whitespace-nowrap">
                      <span className="text-xs font-mono text-[color:var(--color-text-primary)]">+ b={b.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Arrow to output */}
                  <div className="flex flex-col items-center -ml-4 flex-shrink-0">
                    <svg width="70" height="4">
                      <line x1="0" y1="2" x2="70" y2="2" stroke="rgba(46,213,115,0.8)" strokeWidth="3" />
                      <polygon points="70,2 62,0 62,4" fill="rgba(46,213,115,0.8)" />
                    </svg>
                  </div>

                  {/* Output */}
                  <div className="text-center flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[rgba(46,213,115,0.2)] border-2 border-[rgba(46,213,115,0.6)] flex items-center justify-center">
                      <span className="text-xl font-bold text-[color:var(--color-text-primary)]">ŷ</span>
                    </div>
                    <p className="text-xs text-[color:var(--color-text-secondary)] mt-2">Output</p>
                  </div>
                </div>

                <p className="text-sm text-center text-[color:var(--color-text-secondary)] mt-4">
                  Linear regression = single neuron with <strong className="text-[color:var(--color-text-primary)]">2 parameters</strong> (w and b)
                </p>
              </div>
            )}
          </div>

          {/* Right: Key Concepts Cards */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-6">
              <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="text-[color:var(--color-accent)]">01</span>
                The Equation
              </h4>
              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 mb-3">
                <p className="font-mono text-lg text-[color:var(--color-accent)]">
                  f(x) = wx + b
                </p>
              </div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                <strong className="text-[color:var(--color-text-primary)]">w</strong> (weight) controls the slope<br />
                <strong className="text-[color:var(--color-text-primary)]">b</strong> (bias) shifts the line up/down
              </p>
            </div>

            <div className="glass-panel p-6">
              <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="text-[color:var(--color-accent)]">02</span>
                The Goal
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Find <strong className="text-[color:var(--color-text-primary)]">w</strong> and{" "}
                <strong className="text-[color:var(--color-text-primary)]">b</strong> that minimize
                the distance from all points to the line. This distance is measured by{" "}
                <strong className="text-[color:var(--color-accent)]">MSE = {mse.toFixed(2)}</strong>
              </p>
            </div>

            <div className="glass-panel p-6">
              <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="text-[color:var(--color-accent)]">03</span>
                Why It Matters
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                This is the <strong className="text-[color:var(--color-text-primary)]">foundation of all AI</strong>.
                ChatGPT has 175 billion parameters, but uses the{" "}
                <strong className="text-[color:var(--color-accent)]">same math you're learning here</strong> -
                just repeated billions of times.
              </p>
            </div>

            <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                💡 <strong className="text-[color:var(--color-text-primary)]">Try the controls:</strong>{" "}
                Toggle "Show Errors" to see how far each point is from the line. Toggle "Network View" to see
                this as a single-neuron neural network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
