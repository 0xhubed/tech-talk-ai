"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { generateHousingData } from "@/lib/housing";
import { ViewModeButtons } from "./shared/ViewModeButtons";
import { VCRControls } from "./shared/VCRControls";
import { ParameterSlider } from "./shared/ParameterSlider";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading gradient descent…
    </div>
  ),
});

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type GradientStep = {
  w: number;
  b: number;
  cost: number;
  gradW: number;
  gradB: number;
};

export function GradientDescentExplorer() {
  const [viewMode, setViewMode] = useState<"path" | "steps" | "both">("path");
  const [learningRate, setLearningRate] = useState(0.1);
  const [startPoint, setStartPoint] = useState<"random" | "custom" | "worst">("worst");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate housing data
  const housingData = useMemo(() => {
    const data = generateHousingData({ samples: 100, seed: 42 });
    return data.map((d) => ({
      x: d.squareFeet,
      y: d.price,
    }));
  }, []);

  // Calculate optimal parameters
  const optimal = useMemo(() => {
    const xs = housingData.map((d) => d.x);
    const ys = housingData.map((d) => d.y);
    const xMean = xs.reduce((acc, v) => acc + v, 0) / xs.length;
    const yMean = ys.reduce((acc, v) => acc + v, 0) / ys.length;
    const numerator = xs.reduce((acc, v, i) => acc + (v - xMean) * (ys[i] - yMean), 0);
    const denominator = xs.reduce((acc, v) => acc + (v - xMean) ** 2, 0) || 1;
    const w = numerator / denominator;
    const b = yMean - w * xMean;
    return { w, b };
  }, [housingData]);

  // Cost function
  const calculateCost = (w: number, b: number) => {
    const predictions = housingData.map((d) => w * d.x + b);
    return predictions.reduce((acc, pred, i) => acc + Math.pow(pred - housingData[i].y, 2), 0) / housingData.length;
  };

  // Calculate gradients
  const calculateGradients = (w: number, b: number) => {
    const m = housingData.length;
    let gradW = 0;
    let gradB = 0;

    for (const point of housingData) {
      const prediction = w * point.x + b;
      const error = prediction - point.y;
      gradW += (error * point.x) / m;
      gradB += error / m;
    }

    return { gradW, gradB };
  };

  // Generate gradient descent path
  const descentPath = useMemo(() => {
    const steps: GradientStep[] = [];
    let w = startPoint === "worst" ? 50 : startPoint === "random" ? 100 : optimal.w + 50;
    let b = startPoint === "worst" ? 10000 : startPoint === "random" ? 20000 : optimal.b + 10000;

    for (let i = 0; i < 30; i++) {
      const cost = calculateCost(w, b);
      const { gradW, gradB } = calculateGradients(w, b);
      steps.push({ w, b, cost, gradW, gradB });

      // Update parameters
      w = w - learningRate * gradW;
      b = b - learningRate * gradB;

      // Stop if converged
      if (Math.abs(gradW) < 0.1 && Math.abs(gradB) < 1) break;
    }

    return steps;
  }, [housingData, learningRate, startPoint, optimal]);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= descentPath.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying, descentPath.length]);

  // 3D surface data
  const surfaceData = useMemo(() => {
    const wRange = Array.from({ length: 30 }, (_, i) => optimal.w - 60 + i * 4);
    const bRange = Array.from({ length: 30 }, (_, i) => optimal.b - 30000 + i * 2000);
    const zValues = wRange.map((w) => bRange.map((b) => calculateCost(w, b)));

    const surface: Partial<Data> = {
      type: "surface",
      x: wRange,
      y: bRange,
      z: zValues,
      colorscale: [
        [0, "#23e6ff"],
        [0.5, "#3f5efb"],
        [1, "#ff2fb9"],
      ],
      opacity: 0.8,
      showscale: false,
    };

    const pathTrace: Partial<Data> = {
      type: "scatter3d",
      mode: "lines+markers",
      x: descentPath.slice(0, currentStep + 1).map((s) => s.w),
      y: descentPath.slice(0, currentStep + 1).map((s) => s.b),
      z: descentPath.slice(0, currentStep + 1).map((s) => s.cost),
      line: {
        color: "rgba(255,200,87,1)",
        width: 6,
      },
      marker: {
        size: 5,
        color: "rgba(255,200,87,1)",
      },
      name: "Descent Path",
    };

    const currentMarker: Partial<Data> = {
      type: "scatter3d",
      mode: "markers",
      x: [descentPath[currentStep].w],
      y: [descentPath[currentStep].b],
      z: [descentPath[currentStep].cost],
      marker: {
        size: 10,
        color: "rgba(255,200,87,1)",
        symbol: "diamond",
        line: { width: 2, color: "white" },
      },
      name: "Current",
    };

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
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.3 },
        },
      },
    };

    return { data: [surface, pathTrace, currentMarker], layout };
  }, [descentPath, currentStep, optimal]);

  const config: Partial<Config> = useMemo(
    () => ({
      displaylogo: false,
      responsive: true,
      staticPlot: false,
    }),
    [],
  );

  const currentStepData = descentPath[currentStep];

  const resetPath = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <FullScreenCard className="glass-panel p-6" title="Gradient Descent Explorer">
      <div className="mb-6">
        <ViewModeButtons
          modes={[
            { id: "path", label: "Path on Surface" },
            { id: "steps", label: "Iteration Steps" },
            { id: "both", label: "Both" },
          ]}
          active={viewMode}
          onChange={(mode) => setViewMode(mode as "path" | "steps" | "both")}
        />
      </div>

      {(viewMode === "path" || viewMode === "both") && (
        <div className="relative mb-6">
          <Plot
            data={surfaceData.data}
            layout={surfaceData.layout}
            config={config}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {(viewMode === "steps" || viewMode === "both") && (
        <div className="mb-6 space-y-3 max-h-[400px] overflow-y-auto">
          {descentPath.slice(0, currentStep + 1).map((step, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${
                idx === currentStep
                  ? "border-[rgba(255,200,87,0.6)] bg-[rgba(255,200,87,0.1)]"
                  : "border-[rgba(255,255,255,0.1)] bg-[rgba(12,18,26,0.3)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[color:var(--color-text-primary)]">Step {idx + 1}</span>
                <span className="text-xs text-[color:var(--color-text-secondary)]">
                  Cost: ${formatNumber(Math.round(step.cost))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">w = </span>
                  <span className="font-mono text-[color:var(--color-accent)]">{step.w.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">b = </span>
                  <span className="font-mono text-[color:var(--color-accent)]">{Math.round(step.b)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">∇w = </span>
                  <span className="font-mono text-xs">{step.gradW.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">∇b = </span>
                  <span className="font-mono text-xs">{step.gradB.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <ParameterSlider
          label="Learning Rate (α)"
          value={learningRate}
          min={0.01}
          max={1.0}
          step={0.01}
          onChange={(v) => {
            setLearningRate(v);
            setCurrentStep(0);
            setIsPlaying(false);
          }}
        />

        <div className="flex items-center gap-3 text-xs">
          <span className="uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)]">Starting Point</span>
          {(["worst", "random", "custom"] as const).map((point) => (
            <button
              key={point}
              type="button"
              className={`rounded-full border px-3 py-1 transition ${
                startPoint === point
                  ? "border-[rgba(255,47,185,0.65)] bg-[rgba(255,47,185,0.12)] text-[color:var(--color-text-primary)]"
                  : "border-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.3)]"
              }`}
              onClick={() => {
                setStartPoint(point);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            >
              {point.charAt(0).toUpperCase() + point.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <VCRControls
          current={currentStep}
          total={descentPath.length}
          onStep={setCurrentStep}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onReset={resetPath}
          isPlaying={isPlaying}
        />
      </div>

      <div className="mb-6 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.2)] rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[color:var(--color-text-secondary)]">Current w:</span>
            <span className="ml-2 font-mono text-[color:var(--color-accent)]">{currentStepData.w.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[color:var(--color-text-secondary)]">Current b:</span>
            <span className="ml-2 font-mono text-[color:var(--color-accent)]">{Math.round(currentStepData.b)}</span>
          </div>
          <div>
            <span className="text-[color:var(--color-text-secondary)]">Cost:</span>
            <span className="ml-2 font-mono text-[color:var(--color-accent)]">
              ${formatNumber(Math.round(currentStepData.cost))}
            </span>
          </div>
          <div>
            <span className="text-[color:var(--color-text-secondary)]">Gradient:</span>
            <span className="ml-2 font-mono text-xs">
              ∇w={currentStepData.gradW.toFixed(2)}, ∇b={currentStepData.gradB.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          💡 Larger learning rates take bigger steps but might overshoot the minimum. Watch how the algorithm navigates
          to the optimal parameters.
        </p>
      </div>
    </FullScreenCard>
  );
}
