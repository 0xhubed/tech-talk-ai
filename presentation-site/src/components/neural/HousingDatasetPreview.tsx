"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { generateHousingData } from "@/lib/housing";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading interactive scatter …
    </div>
  ),
});

// Consistent number formatting to avoid hydration mismatch
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
const BEDROOM_COLORS = ["#23e6ff", "#7c5cff", "#ff2fb9", "#ffc857", "#4ade80"];

export function HousingDatasetPreview() {
  const [viewMode, setViewMode] = useState<"absolute" | "perSqFt">("absolute");
  const [colorMode, setColorMode] = useState<"price" | "bedrooms">("price");
  const [mounted, setMounted] = useState(false);
  const previewPoints = useMemo(() => buildPreviewPoints(SAMPLE_SIZE, 77), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const mean = (values: number[]) => values.reduce((acc, value) => acc + value, 0) / Math.max(values.length, 1);
    if (previewPoints.length === 0) {
      return {
        squareFeet: { min: 0, max: 0, mean: 0 },
        price: { min: 0, max: 0, mean: 0 },
        pricePerSqFt: { min: 0, max: 0, mean: 0 },
      };
    }

    const squareFeetValues = previewPoints.map((point) => point.squareFeet);
    const priceValues = previewPoints.map((point) => point.price);
    const pricePerSqFtValues = previewPoints.map((point) => point.price / point.squareFeet);

    return {
      squareFeet: {
        min: Math.min(...squareFeetValues),
        max: Math.max(...squareFeetValues),
        mean: mean(squareFeetValues),
      },
      price: {
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
        mean: mean(priceValues),
      },
      pricePerSqFt: {
        min: Math.min(...pricePerSqFtValues),
        max: Math.max(...pricePerSqFtValues),
        mean: mean(pricePerSqFtValues),
      },
    };
  }, [previewPoints]);

  const regression = useMemo(() => {
    if (previewPoints.length === 0) {
      return { slope: 0, intercept: 0, x: [] as number[], y: [] as number[] };
    }
    const xs = previewPoints.map((point) => point.squareFeet);
    const ys = previewPoints.map((point) =>
      viewMode === "absolute" ? point.price : point.price / point.squareFeet,
    );
    const xMean = xs.reduce((acc, value) => acc + value, 0) / xs.length;
    const yMean = ys.reduce((acc, value) => acc + value, 0) / ys.length;
    const numerator = xs.reduce((acc, value, index) => acc + (value - xMean) * (ys[index] - yMean), 0);
    const denominator = xs.reduce((acc, value) => acc + (value - xMean) ** 2, 0) || 1;
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;
    const x = [Math.min(...xs), Math.max(...xs)];
    const y = x.map((value) => slope * value + intercept);
    return { slope, intercept, x, y };
  }, [previewPoints, viewMode]);

  const scatterTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "markers",
      x: previewPoints.map((point) => point.squareFeet),
      y: previewPoints.map((point) =>
        viewMode === "absolute" ? point.price : point.price / point.squareFeet,
      ),
      text: previewPoints.map((point) =>
        viewMode === "absolute"
          ? `$${formatNumber(point.price)} @ ${point.squareFeet} sq ft`
          : `$${formatNumber(Math.round(point.price / point.squareFeet))}/sq ft, ${point.squareFeet} sq ft`,
      ),
      marker: {
        size: 7,
        color:
          colorMode === "price"
            ? previewPoints.map((point) =>
                viewMode === "absolute" ? point.price : point.price / point.squareFeet,
              )
            : previewPoints.map((point) => BEDROOM_COLORS[(point.bedrooms - 1) % BEDROOM_COLORS.length]),
        colorscale:
          colorMode === "price"
            ? [
                [0, "#23e6ff"],
                [0.5, "#3f5efb"],
                [1, "#ff2fb9"],
              ]
            : undefined,
        cmin: colorMode === "price" ? undefined : undefined,
        cmax: colorMode === "price" ? undefined : undefined,
        showscale: colorMode === "price",
        opacity: 0.78,
        line: { width: 1, color: "rgba(12,18,26,0.65)" },
      },
      hovertemplate: "%{text}<extra></extra>",
      name: "Samples",
    }),
    [previewPoints, viewMode, colorMode],
  );

  const regressionTrace: Partial<Data> = useMemo(
    () => ({
      type: "scatter",
      mode: "lines",
      x: regression.x,
      y: regression.y,
      name: "Trend",
      line: {
        color: "rgba(255,200,87,0.9)",
        width: 4,
      },
      hoverinfo: "skip",
    }),
    [regression.x, regression.y],
  );

  const layout: Partial<Layout> = useMemo(
    () => ({
      autosize: true,
      height: 360,
      margin: { l: 70, r: 28, t: 32, b: 70 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(12,18,26,0.45)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      xaxis: {
        title: "Square footage",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
        tickformat: ",d",
      },
      yaxis: {
        title: viewMode === "absolute" ? "Price (USD)" : "Price per sq ft (USD)",
        zeroline: false,
        gridcolor: "rgba(255,255,255,0.08)",
        tickprefix: "$",
        tickformat: ",",
      },
      hovermode: "closest",
      legend: {
        orientation: "h",
        x: 0.5,
        y: -0.2,
        xanchor: "center",
      },
    }),
    [viewMode],
  );

  const config: Partial<Config> = useMemo(
    () => ({
      displaylogo: false,
      responsive: true,
      staticPlot: false,
      modeBarButtonsToRemove: ["toggleSpikelines"],
      toImageButtonOptions: {
        filename: "housing-dataset-scatter",
        height: 720,
        width: 1080,
      },
    }),
    [],
  );

  return (
    <FullScreenCard className="glass-panel p-6" title="Housing dataset snapshot">
      <div className="flex items-center justify-between">
        <h3
          className="text-lg text-[color:var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          Housing dataset snapshot
        </h3>
        <span className="badge">{SAMPLE_SIZE} samples</span>
      </div>
      <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
        Deterministic generator blending square footage, bedrooms, distance, and seasonal effects. Toggle views to
        explore the dataset live, then reopen the paired notebook later to reproduce every chart.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
        <span className="uppercase tracking-[0.22em]">View</span>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 transition ${
            viewMode === "absolute"
              ? "border-[rgba(255,47,185,0.65)] bg-[rgba(255,47,185,0.12)] text-[color:var(--color-text-primary)]"
              : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.3)]"
          }`}
          onClick={() => setViewMode("absolute")}
        >
          Price
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 transition ${
            viewMode === "perSqFt"
              ? "border-[rgba(255,47,185,0.65)] bg-[rgba(255,47,185,0.12)] text-[color:var(--color-text-primary)]"
              : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.3)]"
          }`}
          onClick={() => setViewMode("perSqFt")}
        >
          Price / sq ft
        </button>
        <span className="ml-4 uppercase tracking-[0.22em]">Color by</span>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 transition ${
            colorMode === "price"
              ? "border-[rgba(35,230,255,0.65)] bg-[rgba(35,230,255,0.12)] text-[color:var(--color-text-primary)]"
              : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.3)]"
          }`}
          onClick={() => setColorMode("price")}
        >
          Price value
        </button>
        <button
          type="button"
          className={`rounded-full border px-3 py-1 transition ${
            colorMode === "bedrooms"
              ? "border-[rgba(35,230,255,0.65)] bg-[rgba(35,230,255,0.12)] text-[color:var(--color-text-primary)]"
              : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.3)]"
          }`}
          onClick={() => setColorMode("bedrooms")}
        >
          Bedrooms
        </button>
      </div>
      <div className="relative mt-6">
        <Plot
          data={[scatterTrace, regressionTrace]}
          layout={layout}
          config={config}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="mt-6 grid gap-4 text-sm text-[color:var(--color-text-secondary)] sm:grid-cols-3">
        <div className="rounded-2xl border border-[rgba(35,230,255,0.24)] bg-[rgba(35,230,255,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Square footage</p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">
            {mounted ? formatNumber(Math.round(stats.squareFeet.mean)) : Math.round(stats.squareFeet.mean)} sq ft avg
          </p>
          <p className="mt-1 text-[0.75rem]">
            Range {mounted ? formatNumber(Math.round(stats.squareFeet.min)) : Math.round(stats.squareFeet.min)} – {mounted ? formatNumber(Math.round(stats.squareFeet.max)) : Math.round(stats.squareFeet.max)}
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,47,185,0.24)] bg-[rgba(255,47,185,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">
            {viewMode === "absolute" ? "Price" : "Price per sq ft"}
          </p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">
            {viewMode === "absolute"
              ? `$${mounted ? formatNumber(Math.round(stats.price.mean)) : Math.round(stats.price.mean)}`
              : `$${mounted ? formatNumber(Math.round(stats.pricePerSqFt.mean)) : Math.round(stats.pricePerSqFt.mean)}`}
          </p>
          <p className="mt-1 text-[0.75rem]">
            {viewMode === "absolute"
              ? `Range $${mounted ? formatNumber(Math.round(stats.price.min)) : Math.round(stats.price.min)} – $${mounted ? formatNumber(Math.round(stats.price.max)) : Math.round(stats.price.max)}`
              : `Range $${mounted ? formatNumber(Math.round(stats.pricePerSqFt.min)) : Math.round(stats.pricePerSqFt.min)} – $${mounted ? formatNumber(Math.round(stats.pricePerSqFt.max)) : Math.round(stats.pricePerSqFt.max)} per sq ft`}
          </p>
        </div>
        <div className="rounded-2xl border border-[rgba(255,200,87,0.24)] bg-[rgba(255,200,87,0.08)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Regression</p>
          <p className="mt-2 text-lg text-[color:var(--color-text-primary)]">
            {viewMode === "absolute"
              ? `price = ${regression.slope.toFixed(2)} ⋅ sqft + ${regression.intercept.toFixed(0)}`
              : `price/sqft = ${regression.slope.toFixed(4)} ⋅ sqft + ${regression.intercept.toFixed(2)}`}
          </p>
          <p className="mt-1 text-[0.75rem]">Use the notebook CTA to re-run this fit live.</p>
        </div>
      </div>
      {colorMode === "bedrooms" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[0.7rem] text-[color:var(--color-text-secondary)]">
          <span className="uppercase tracking-[0.22em]">Legend</span>
          {[1, 2, 3, 4, 5].map((beds) => (
            <span key={`legend-bed-${beds}`} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: BEDROOM_COLORS[(beds - 1) % BEDROOM_COLORS.length] }}
              />
              {beds} bed{beds > 1 ? "s" : ""}
            </span>
          ))}
        </div>
      ) : null}
    </FullScreenCard>
  );
}
