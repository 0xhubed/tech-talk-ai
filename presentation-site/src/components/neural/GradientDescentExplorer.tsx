"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
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

type GradientStep = {
  x: number;
  y: number;
  cost: number;
  gradX: number;
  gradY: number;
};

export function GradientDescentExplorer() {
  const [viewMode, setViewMode] = useState<"path" | "steps" | "both">("path");
  const [learningRate, setLearningRate] = useState(0.15);
  const [startPoint, setStartPoint] = useState<"far" | "medium" | "near">("far");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simple bowl-shaped cost function: f(x,y) = x² + 0.5y²
  const calculateCost = (x: number, y: number) => {
    return x * x + 0.5 * y * y;
  };

  // Gradient of f(x,y) = [2x, y]
  const calculateGradients = (x: number, y: number) => {
    return {
      gradX: 2 * x,
      gradY: y,
    };
  };

  // Generate gradient descent path
  const descentPath = useMemo(() => {
    const steps: GradientStep[] = [];

    // Define starting points: far, medium, or near the minimum (0, 0)
    const startPositions = {
      far: { x: -2.5, y: 2.0 },
      medium: { x: -1.5, y: 1.2 },
      near: { x: -0.8, y: 0.6 },
    };

    let { x, y } = startPositions[startPoint];

    for (let i = 0; i < 50; i++) {
      const cost = calculateCost(x, y);
      const { gradX, gradY } = calculateGradients(x, y);
      steps.push({ x, y, cost, gradX, gradY });

      // Update parameters using gradient descent
      x = x - learningRate * gradX;
      y = y - learningRate * gradY;

      // Stop if converged (gradient is very small)
      if (Math.abs(gradX) < 0.001 && Math.abs(gradY) < 0.001) break;
    }

    return steps;
  }, [learningRate, startPoint]);

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
    // Create a nice bowl-shaped surface from -3 to 3 in both dimensions
    const xRange = Array.from({ length: 40 }, (_, i) => -3 + i * (6 / 39));
    const yRange = Array.from({ length: 40 }, (_, i) => -3 + i * (6 / 39));
    const zValues = xRange.map((x) => yRange.map((y) => calculateCost(x, y)));

    const surface: Partial<Data> = {
      type: "surface",
      x: xRange,
      y: yRange,
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
      x: descentPath.slice(0, currentStep + 1).map((s) => s.x),
      y: descentPath.slice(0, currentStep + 1).map((s) => s.y),
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
      x: [descentPath[currentStep].x],
      y: [descentPath[currentStep].y],
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
      height: 550,
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: "var(--font-inter, system-ui)",
        color: "rgba(245,247,250,0.88)",
      },
      scene: {
        aspectratio: { x: 1.6, y: 1.6, z: 0.7 },
        xaxis: { title: "x", gridcolor: "rgba(255,255,255,0.1)" },
        yaxis: { title: "y", gridcolor: "rgba(255,255,255,0.1)" },
        zaxis: { title: "f(x, y)", gridcolor: "rgba(255,255,255,0.1)" },
        bgcolor: "rgba(12,18,26,0.45)",
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.3 },
        },
      },
    };

    return { data: [surface, pathTrace, currentMarker], layout };
  }, [descentPath, currentStep]);

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
        <div className="relative mb-6 w-full max-w-[1400px] mx-auto">
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
                  f(x, y) = {step.cost.toFixed(4)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">x = </span>
                  <span className="font-mono text-[color:var(--color-accent)]">{step.x.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">y = </span>
                  <span className="font-mono text-[color:var(--color-accent)]">{step.y.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">∇x = </span>
                  <span className="font-mono text-xs">{step.gradX.toFixed(4)}</span>
                </div>
                <div>
                  <span className="text-[color:var(--color-text-secondary)]">∇y = </span>
                  <span className="font-mono text-xs">{step.gradY.toFixed(4)}</span>
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
          min={0.05}
          max={0.5}
          step={0.01}
          onChange={(v) => {
            setLearningRate(v);
            setCurrentStep(0);
            setIsPlaying(false);
          }}
        />

        <div className="flex items-center gap-3 text-xs">
          <span className="uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)]">Starting Point</span>
          {(["far", "medium", "near"] as const).map((point) => (
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

      {/* Understanding the Gradient (Derivative) */}
      <div className="mb-6 bg-[rgba(63,94,251,0.08)] border border-[rgba(63,94,251,0.3)] rounded-lg p-5">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3 uppercase tracking-[0.2em]">
          Understanding the Gradient (Derivative)
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4 border border-[rgba(255,255,255,0.1)]">
            <p className="text-sm text-[color:var(--color-text-secondary)] mb-3">
              <strong className="text-[color:var(--color-text-primary)]">What is a derivative?</strong>
              <br />
              The derivative tells us the <em>slope</em> or <em>rate of change</em> at any point.
              For our function <strong>f(x, y) = x² + 0.5y²</strong>, the gradient is a vector pointing uphill.
            </p>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[color:var(--color-text-secondary)]">∂f/∂x =</span>
                <span className="text-[rgba(35,230,255,1)]">2x</span>
                <span className="text-[color:var(--color-text-secondary)]">(slope in x)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[color:var(--color-text-secondary)]">∂f/∂y =</span>
                <span className="text-[rgba(35,230,255,1)]">y</span>
                <span className="text-[color:var(--color-text-secondary)]">(slope in y)</span>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4 border border-[rgba(255,255,255,0.1)]">
            <p className="text-xs font-semibold text-[color:var(--color-text-primary)] mb-2 uppercase tracking-[0.18em]">
              1D Example: f(x) = x²
            </p>
            <svg viewBox="0 0 200 120" className="w-full" style={{ maxHeight: "140px" }}>
              <defs>
                <linearGradient id="curve-grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,47,185,0.8)" />
                  <stop offset="100%" stopColor="rgba(124,92,255,0.8)" />
                </linearGradient>
              </defs>
              {/* Axes */}
              <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="20" y1="100" x2="20" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              {/* Parabola f(x) = x² */}
              <path
                d="M 20,100 Q 100,25 180,100"
                fill="none"
                stroke="url(#curve-grad)"
                strokeWidth="2.5"
              />
              {/* Point on curve */}
              <circle cx="70" cy="55" r="3" fill="rgba(255,200,87,1)" />
              {/* Tangent line (derivative/slope) */}
              <line
                x1="40"
                y1="75"
                x2="100"
                y2="35"
                stroke="rgba(35,230,255,0.9)"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              {/* Labels */}
              <text x="100" y="115" fontSize="9" fill="rgba(255,255,255,0.6)" textAnchor="middle">x</text>
              <text x="12" y="25" fontSize="9" fill="rgba(255,255,255,0.6)" textAnchor="end">f(x)</text>
              <text x="115" y="30" fontSize="8" fill="rgba(35,230,255,1)">slope = 2x</text>
            </svg>
            <p className="text-xs text-[color:var(--color-text-secondary)] mt-2">
              Tangent line (cyan) shows slope. For f(x)=x², derivative is 2x.
            </p>
          </div>
          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4 border border-[rgba(255,255,255,0.1)]">
            <p className="text-sm text-[color:var(--color-text-secondary)] mb-3">
              <strong className="text-[color:var(--color-text-primary)]">At current step:</strong>
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[color:var(--color-text-secondary)]">Position:</span>
                <span className="font-mono text-[color:var(--color-accent)]">
                  ({currentStepData.x.toFixed(3)}, {currentStepData.y.toFixed(3)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--color-text-secondary)]">∂f/∂x:</span>
                <span className="font-mono text-[rgba(35,230,255,1)]">{currentStepData.gradX.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--color-text-secondary)]">∂f/∂y:</span>
                <span className="font-mono text-[rgba(35,230,255,1)]">{currentStepData.gradY.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--color-text-secondary)]">Cost f(x,y):</span>
                <span className="font-mono text-[color:var(--color-accent)]">{currentStepData.cost.toFixed(4)}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                <p className="text-xs text-[color:var(--color-text-secondary)]">
                  <strong className="text-[rgba(255,200,87,1)]">Next step:</strong> Move <em>opposite</em> to gradient:
                  <br />
                  x ← x - α·(∂f/∂x)
                  <br />
                  = {currentStepData.x.toFixed(3)} - {learningRate.toFixed(2)}·{currentStepData.gradX.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          <strong className="text-[color:var(--color-text-primary)]">f(x, y) = x² + 0.5y²</strong> — A smooth bowl-shaped surface with minimum at (0, 0).
          Larger learning rates take bigger steps but might overshoot. Watch how the algorithm navigates toward the minimum.
        </p>
      </div>
    </FullScreenCard>
  );
}
