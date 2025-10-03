"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { InlineMath } from "react-katex";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import type { ScalingPoint } from "@/lib/scaling";
import { generateScalingCurve } from "@/lib/scaling";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading scaling law chart …
    </div>
  ),
});

type ScalingLawCardProps = {
  noiseLevels?: number[];
};

function buildScalingSeries(noise: number): ScalingPoint[] {
  return generateScalingCurve({ noise });
}

export function ScalingLawCard({ noiseLevels = [0.08, 0.12, 0.2] }: ScalingLawCardProps) {
  const [noise, setNoise] = useState(noiseLevels[0] ?? 0.1);
  const points = useMemo(() => buildScalingSeries(noise), [noise]);

  const scatterTrace: Partial<Data> = {
    type: "scatter",
    mode: "markers+lines",
    x: points.map((point) => point.compute),
    y: points.map((point) => point.loss),
    text: points.map(
      (point) =>
        `Compute ${point.compute.toExponential(2)}\nDataset ${point.dataset.toExponential(2)}\nParams ${point.parameters.toExponential(2)}\nLoss ${point.loss.toPrecision(3)}`,
    ),
    marker: {
      size: 8,
      color: points.map((point) => point.parameters),
      colorscale: [[0, "#23e6ff"], [0.5, "#7c5cff"], [1, "#ff2fb9"]],
      line: { width: 1, color: "rgba(12,18,26,0.7)" },
    },
    line: {
      color: "rgba(255,255,255,0.6)",
      width: 2,
    },
    hovertemplate: "%{text}<extra></extra>",
    name: "Scaling curve",
  };

  const layout: Partial<Layout> = {
    autosize: true,
    height: 360,
    margin: { l: 70, r: 28, t: 20, b: 68 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(12,18,26,0.45)",
    font: {
      family: "var(--font-inter, system-ui)",
      color: "rgba(245,247,250,0.88)",
    },
    xaxis: {
      type: "log",
      title: "Compute budget (FLOPs)",
      tickformat: "~e",
      gridcolor: "rgba(255,255,255,0.08)",
      zeroline: false,
    },
    yaxis: {
      type: "log",
      title: "Validation loss",
      tickformat: "~e",
      gridcolor: "rgba(255,255,255,0.08)",
      zeroline: false,
    },
    hovermode: "closest",
    legend: { orientation: "h", x: 0.5, y: -0.2, xanchor: "center" },
  };

  const config: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    staticPlot: false,
    modeBarButtonsToRemove: ["toggleSpikelines"],
    toImageButtonOptions: {
      filename: "scaling-law",
      height: 720,
      width: 1080,
    },
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Scaling law intuition">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">Compute vs. loss</p>
          <h3
            className="text-lg text-[color:var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Power-law behaviour across model scale and data budget
          </h3>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            Toggle the noise slider to show how imperfect scaling exponents warp the frontier. Use the notebook CTA to
            regenerate this curve with real measurements from the papers you cite.
          </p>
        </div>
        <div className="rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(12,18,26,0.5)] px-4 py-2 text-xs text-[color:var(--color-text-secondary)]">
          Loss follows <InlineMath math={"L(N, D, C) = aN^{-\\alpha} + bD^{-\\beta} + cC^{-\\gamma}"} />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
        <span className="uppercase tracking-[0.22em]">Noise preset</span>
        {noiseLevels.map((level) => (
          <button
            key={`noise-${level}`}
            type="button"
            className={`rounded-full border px-3 py-1 transition ${
              Math.abs(noise - level) < 0.0001
                ? "border-[rgba(255,47,185,0.65)] bg-[rgba(255,47,185,0.12)] text-[color:var(--color-text-primary)]"
                : "border-[rgba(255,255,255,0.16)] text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.3)]"
            }`}
            onClick={() => setNoise(level)}
          >
            {level.toFixed(2)} noise
          </button>
        ))}
      </div>
      <div className="relative mt-6">
        <Plot data={[scatterTrace]} layout={layout} config={config} style={{ width: "100%", height: "100%" }} />
      </div>
      <div className="mt-6 grid gap-4 text-sm text-[color:var(--color-text-secondary)] sm:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(35,230,255,0.24)] bg-[rgba(35,230,255,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Current noise</p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">{noise.toFixed(2)}</p>
          <p className="mt-1 text-[0.75rem]">Higher values emulate data corruption or evaluation drift.</p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,47,185,0.24)] bg-[rgba(255,47,185,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Best compute</p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">
            {points[0] ? points[0].compute.toExponential(2) : "–"}
          </p>
          <p className="mt-1 text-[0.75rem]">Highlighted region matches the demo callout on stage.</p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,200,87,0.24)] bg-[rgba(255,200,87,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Notebook link</p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">
            <a className="underline" href="/notebooks/scaling-laws.html" target="_blank" rel="noreferrer">
              Open scaling notebook
            </a>
          </p>
          <p className="mt-1 text-[0.75rem]">Replay curve fitting with citations and raw measurements.</p>
        </div>
      </div>
    </FullScreenCard>
  );
}
