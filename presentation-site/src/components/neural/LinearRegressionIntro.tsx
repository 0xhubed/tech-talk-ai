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

// Seeded random number generator for consistent results
function createRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function LinearRegressionIntro() {
  // Generate simple data: y = 2x + 3 + noise
  const data = useMemo(() => {
    const rng = createRng(42);
    const points = [];
    for (let i = 0; i < 30; i++) {
      const x = i / 3;
      const noise = (rng() - 0.5) * 4;
      const y = 2 * x + 3 + noise;
      points.push({ x, y });
    }
    return points;
  }, []);

  // Best fit line
  const fitLine = useMemo(() => {
    const xs = data.map((p) => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return {
      x: [xMin, xMax],
      y: [2 * xMin + 3, 2 * xMax + 3],
    };
  }, [data]);

  const scatterTrace: Partial<Data> = {
    type: "scatter",
    mode: "markers",
    x: data.map((p) => p.x),
    y: data.map((p) => p.y),
    marker: {
      size: 8,
      color: "rgba(35,230,255,0.7)",
      line: { width: 1, color: "rgba(255,255,255,0.3)" },
    },
    name: "Data Points",
  };

  const lineTrace: Partial<Data> = {
    type: "scatter",
    mode: "lines",
    x: fitLine.x,
    y: fitLine.y,
    line: {
      color: "rgba(255,200,87,1)",
      width: 4,
    },
    name: "Best Fit Line",
  };

  const layout: Partial<Layout> = {
    autosize: true,
    height: 350,
    margin: { l: 60, r: 20, t: 20, b: 50 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
    },
    xaxis: {
      title: "x (input)",
      zeroline: false,
      gridcolor: "rgba(255,255,255,0.08)",
    },
    yaxis: {
      title: "y (output)",
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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left: Visualization */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Finding the Line of Best Fit
            </h3>
            <Plot
              data={[scatterTrace, lineTrace]}
              layout={layout}
              config={config}
              style={{ width: "100%", height: "100%" }}
            />
            <p className="text-sm text-[color:var(--color-text-secondary)] mt-4 text-center">
              The goal: minimize the distance between the line and all data points
            </p>
          </div>

          {/* Right: Key Concepts */}
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
                Find the values of <strong className="text-[color:var(--color-text-primary)]">w</strong> and{" "}
                <strong className="text-[color:var(--color-text-primary)]">b</strong> that create the line
                which best fits the data. "Best fit" means minimizing prediction errors.
              </p>
            </div>

            <div className="glass-panel p-6">
              <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-3 flex items-center gap-2">
                <span className="text-[color:var(--color-accent)]">03</span>
                Why It Matters
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Linear regression is the building block for all machine learning. Master this,
                and you'll understand neural networks, deep learning, and even transformers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
