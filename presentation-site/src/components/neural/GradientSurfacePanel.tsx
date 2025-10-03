"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { Config, Data, Layout } from "plotly.js";
import { InlineMath } from "react-katex";
import {
  generateSurfaceGrid,
  gradientDescentPath,
  surfaceValue,
} from "@/lib/gradientSurface";
import {
  useGradientSurfaceStore,
  type GradientSurfaceSnapshot,
} from "@/store/gradientSurfaceStore";
import { MathCopyBlock } from "@/components/ui/MathCopyBlock";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center text-sm text-[color:var(--color-text-secondary)]">
      Loading interactive surface …
    </div>
  ),
});

export type GradientSurfacePanelProps = {
  anchorId?: string;
};

export function GradientSurfacePanel({ anchorId }: GradientSurfacePanelProps) {
  const [learningRate, setLearningRate] = useState(0.2);
  const [stepIndex, setStepIndex] = useState(4);
  const [totalSteps, setTotalSteps] = useState(12);

  const snapshots = useGradientSurfaceStore((state) => state.snapshots);
  const activeSnapshotId = useGradientSurfaceStore((state) => state.activeSnapshotId);
  const setActiveSnapshot = useGradientSurfaceStore((state) => state.setActiveSnapshot);
  const clearSnapshots = useGradientSurfaceStore((state) => state.clearSnapshots);
  const annotations = useGradientSurfaceStore((state) => state.annotations);
  const addAnnotation = useGradientSurfaceStore((state) => state.addAnnotation);
  const removeAnnotation = useGradientSurfaceStore((state) => state.removeAnnotation);
  const clearAnnotations = useGradientSurfaceStore((state) => state.clearAnnotations);

  const activeSnapshot: GradientSurfaceSnapshot | undefined = useMemo(() => {
    if (snapshots.length === 0) return undefined;
    if (activeSnapshotId) {
      return snapshots.find((snapshot) => snapshot.id === activeSnapshotId) ?? snapshots[0];
    }
    return snapshots[0];
  }, [snapshots, activeSnapshotId]);

  useEffect(() => {
    const meta = activeSnapshot?.meta;
    if (meta && meta.source === "neural-controller") {
      setLearningRate(meta.learningRate);
      setTotalSteps(meta.steps);
      setStepIndex((prev) => Math.min(prev, meta.steps));
    }
  }, [activeSnapshot]);

  const { xs, ys, zs } = useMemo(() => generateSurfaceGrid(), []);
  const sharedPathActive = Boolean(activeSnapshot);
  const descentPath = useMemo(
    () =>
      sharedPathActive && activeSnapshot
        ? activeSnapshot.path
        : gradientDescentPath({ learningRate, steps: totalSteps }),
    [activeSnapshot, sharedPathActive, learningRate, totalSteps],
  );
  const effectiveTotalSteps = Math.max(0, descentPath.length - 1);
  const cappedStepIndex = Math.min(stepIndex, effectiveTotalSteps);
  const currentPoint = descentPath[Math.max(0, cappedStepIndex)] ?? descentPath[0];
  const gradientNorm = Math.sqrt(currentPoint.gradientX ** 2 + currentPoint.gradientY ** 2);

  const overlayTraces: Partial<Data>[] = useMemo(() => {
    if (!sharedPathActive) return [];
    return snapshots
      .filter((snapshot) => snapshot.id !== activeSnapshot?.id)
      .map((snapshot, index) => ({
        type: "scatter3d",
        mode: "lines",
        x: snapshot.path.map((point) => point.x),
        y: snapshot.path.map((point) => point.y),
        z: snapshot.path.map((point) => point.z),
        line: {
          color: index % 2 === 0 ? "rgba(63,94,251,0.55)" : "rgba(35,230,255,0.45)",
          width: 3,
        },
        name: snapshot.meta.label ?? `Run ${index + 1}`,
        hovertemplate: "%{text}<extra></extra>",
        text: snapshot.meta.label ?? `Run ${index + 1}`,
      } satisfies Partial<Data>));
  }, [sharedPathActive, snapshots, activeSnapshot]);

  const surfaceTrace: Partial<Data> = {
    type: "surface",
    x: xs,
    y: ys,
    z: zs,
    showscale: false,
    colorscale: [
      [0, "rgba(35,230,255,0.65)"],
      [0.5, "rgba(63,94,251,0.45)"],
      [1, "rgba(255,47,185,0.7)"],
    ],
    opacity: 0.85,
  };

  const descentTrace: Partial<Data> = {
    type: "scatter3d",
    mode: "lines+markers",
    x: descentPath.map((point) => point.x),
    y: descentPath.map((point) => point.y),
    z: descentPath.map((point) => point.z),
    line: {
      color: "rgba(255,200,87,0.92)",
      width: 5,
    },
    marker: {
      size: 4,
      color: "rgba(255,255,255,0.95)",
      line: { width: 1, color: "rgba(12,18,26,1)" },
    },
    name: "Descent path",
    hovertemplate: "Step %{customdata[0]}: x=%{x:.2f}, y=%{y:.2f}, f=%{z:.3f}<extra></extra>",
    customdata: descentPath.map((point) => [point.step]),
  };

  const focusTrace: Partial<Data> = {
    type: "scatter3d",
    mode: "markers",
    x: [currentPoint.x],
    y: [currentPoint.y],
    z: [currentPoint.z],
    marker: {
      size: 10,
      color: "rgba(255,47,185,0.92)",
      symbol: "circle",
    },
    hoverinfo: "skip",
    name: "Active step",
  };

  const gradientTrace: Partial<Data> = {
    type: "scatter3d",
    mode: "lines",
    x: [currentPoint.x, currentPoint.x + currentPoint.gradientX * 0.4],
    y: [currentPoint.y, currentPoint.y + currentPoint.gradientY * 0.4],
    z: [
      currentPoint.z,
      surfaceValue(currentPoint.x + currentPoint.gradientX * 0.4, currentPoint.y + currentPoint.gradientY * 0.4),
    ],
    line: {
      color: "rgba(35,230,255,0.95)",
      width: 4,
    },
    name: "Gradient vector",
    hoverinfo: "skip",
  };

  const annotationTraces: Partial<Data>[] = useMemo(() => {
    if (annotations.length === 0) return [];
    return [
      {
        type: "scatter3d",
        mode: "markers+text",
        x: annotations.map((annotation) => annotation.point.x),
        y: annotations.map((annotation) => annotation.point.y),
        z: annotations.map((annotation) => annotation.point.z),
        marker: {
          size: 9,
          color: annotations.map((annotation) => annotation.color),
          symbol: "diamond",
          line: {
            width: 1.4,
            color: "rgba(12,18,26,0.9)",
          },
        },
        text: annotations.map((annotation) => annotation.label),
        textposition: "top center",
        textfont: {
          size: 12,
          color: "rgba(255,255,255,0.88)",
        },
        name: "Annotations",
        hovertemplate: "%{text}<br>x=%{x:.2f}, y=%{y:.2f}, f=%{z:.3f}<extra>Callout</extra>",
      } satisfies Partial<Data>,
    ];
  }, [annotations]);

  const layout: Partial<Layout> = {
    autosize: true,
    height: 380,
    margin: { l: 0, r: 0, t: 20, b: 0 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    scene: {
      aspectratio: { x: 1, y: 1, z: 0.9 },
      camera: {
        eye: { x: 1.6, y: 1.1, z: 1.1 },
      },
      xaxis: {
        title: "x",
        backgroundcolor: "rgba(12,18,26,0.65)",
        gridcolor: "rgba(255,255,255,0.08)",
        zerolinecolor: "rgba(255,255,255,0.22)",
      },
      yaxis: {
        title: "y",
        backgroundcolor: "rgba(12,18,26,0.65)",
        gridcolor: "rgba(255,255,255,0.08)",
        zerolinecolor: "rgba(255,255,255,0.22)",
      },
      zaxis: {
        title: "f(x, y)",
        backgroundcolor: "rgba(12,18,26,0.65)",
        gridcolor: "rgba(255,255,255,0.08)",
        zerolinecolor: "rgba(255,255,255,0.22)",
      },
    },
    legend: {
      orientation: "h",
      y: -0.12,
      x: 0.5,
      xanchor: "center",
      font: { color: "rgba(255,255,255,0.78)" },
    },
  };

  return (
    <section id={anchorId} className="section-boundary">
      <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-8 px-6 lg:grid-cols-[1fr_minmax(0,1.1fr)] lg:px-8">
        <div className="flex flex-col gap-6">
          <p className="section-title">Gradient Descent Primer</p>
          <h2 className="section-heading text-balance">
            Read the surface, understand the gradient, then walk to the minimum.
          </h2>
          <p className="section-body">
            Before the full training run, use the interactive surface to show how the gradient points uphill. Toggle the
            learning rate and pause on individual steps to explain why overshooting occurs or how smaller steps lengthen
            convergence. The plot supports free rotation, zooming, and on-stage annotations.
          </p>
          {sharedPathActive && activeSnapshot ? (
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-attention)]">
              Synced with {activeSnapshot.meta.label ?? "latest run"} ·
              {" "}
              {new Date(activeSnapshot.meta.timestamp).toLocaleTimeString()}
            </p>
          ) : null}
          <div className="glass-panel relative overflow-hidden p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(35,230,255,0.12),transparent_70%)]" />
            <div className="relative space-y-5">
              <div className="text-sm text-[color:var(--color-text-secondary)]">
                <p className="font-medium text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  Derivative refresher
                </p>
                <MathCopyBlock expression="f(x, y) = x^2 + \tfrac{1}{2} y^2" />
                <MathCopyBlock expression="\\nabla f = [2x,\\ y]" />
                <p>
                  Each step follows <InlineMath math={"(x, y)_{t+1} = (x, y)_t - \\alpha \\nabla f"} /> with learning rate <InlineMath math={"\\alpha"} />.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,26,0.6)] p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">Current step</p>
                  <p className="mt-2 text-lg text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {cappedStepIndex} / {effectiveTotalSteps}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                    Point ({currentPoint.x.toFixed(2)}, {currentPoint.y.toFixed(2)}) · f = {currentPoint.z.toFixed(3)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,26,0.6)] p-4 text-sm">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">Gradient magnitude</p>
                  <p className="mt-2 text-lg text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {gradientNorm.toFixed(3)}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                    Vector [{currentPoint.gradientX.toFixed(2)}, {currentPoint.gradientY.toFixed(2)}]
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">
                  Learning rate ({learningRate.toFixed(2)})
                  <input
                    className="mt-2 w-full accent-[color:var(--color-accent)]"
                    type="range"
                    min={0.05}
                    max={0.45}
                    step={0.01}
                    value={learningRate}
                    onChange={(event) => setLearningRate(Number.parseFloat(event.target.value))}
                    disabled={sharedPathActive && activeSnapshot?.meta.source === "neural-controller"}
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">
                  Active step ({cappedStepIndex})
                  <input
                    className="mt-2 w-full accent-[color:var(--color-highlight)]"
                    type="range"
                    min={0}
                    max={effectiveTotalSteps || 1}
                    step={1}
                    value={cappedStepIndex}
                    onChange={(event) => setStepIndex(Number.parseInt(event.target.value, 10))}
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">
                  Total steps ({sharedPathActive ? effectiveTotalSteps : totalSteps})
                  <input
                    className="mt-2 w-full accent-[color:var(--color-text-secondary)]"
                    type="range"
                    min={6}
                    max={20}
                    step={1}
                    value={sharedPathActive ? effectiveTotalSteps : totalSteps}
                    onChange={(event) => setTotalSteps(Number.parseInt(event.target.value, 10))}
                    disabled={sharedPathActive && activeSnapshot?.meta.source === "neural-controller"}
                  />
                </label>
                {sharedPathActive && activeSnapshot?.meta.source === "neural-controller" ? (
                  <button
                    type="button"
                    className="button-secondary self-start text-xs"
                    onClick={() => {
                      clearSnapshots();
                      clearAnnotations();
                      setStepIndex(4);
                      setLearningRate(0.2);
                      setTotalSteps(12);
                    }}
                  >
                    Reset to manual controls
                  </button>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
                <button
                  type="button"
                  className="button-secondary text-xs"
                  onClick={() => {
                    const defaultLabel = `Step ${cappedStepIndex}`;
                    const raw = window.prompt("Annotation label", defaultLabel);
                    if (!raw) return;
                    const label = raw.trim();
                    if (!label) return;
                    const palette = ["#ff2fb9", "#23e6ff", "#ffc857", "#7c5cff"];
                    const color = palette[(annotations.length + snapshots.length) % palette.length];
                    addAnnotation({
                      id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
                      point: currentPoint,
                      label,
                      color,
                    });
                  }}
                >
                  Add callout at step
                </button>
                {annotations.length > 0 ? (
                  <>
                    <span>|</span>
                    {annotations.map((annotation) => (
                      <button
                        key={annotation.id}
                        type="button"
                        className="rounded-full border border-[rgba(255,255,255,0.16)] px-3 py-1 text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.32)]"
                        onClick={() => removeAnnotation(annotation.id)}
                      >
                        ✕ {annotation.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="button-secondary text-xs"
                      onClick={() => clearAnnotations()}
                    >
                      Clear callouts
                    </button>
                  </>
                ) : null}
              </div>
              {sharedPathActive && snapshots.length > 1 ? (
                <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
                  <span className="uppercase tracking-[0.22em]">Compare runs</span>
                  {snapshots.map((snapshot) => (
                    <button
                      key={snapshot.id}
                      type="button"
                      className={`rounded-full border px-3 py-1 transition ${
                        activeSnapshot?.id === snapshot.id
                          ? "border-[rgba(255,200,87,0.8)] text-[color:var(--color-text-primary)]"
                          : "border-[rgba(255,255,255,0.16)] text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.32)]"
                      }`}
                      onClick={() => setActiveSnapshot(snapshot.id)}
                    >
                      {snapshot.meta.label ?? `lr ${snapshot.meta.learningRate.toFixed(2)}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => {
                      clearSnapshots();
                      clearAnnotations();
                      setStepIndex(4);
                      setLearningRate(0.2);
                      setTotalSteps(12);
                    }}
                  >
                    Clear overlays
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="glass-panel p-4">
          <Plot
            data={[surfaceTrace, ...overlayTraces, descentTrace, focusTrace, gradientTrace, ...annotationTraces]}
            layout={layout}
            config={{
              displaylogo: false,
              responsive: true,
              modeBarButtonsToRemove: ["toggleSpikelines", "resetCameraDefault3d"],
              toImageButtonOptions: {
                filename: "gradient-surface",
                height: 720,
                width: 720,
              },
            } satisfies Partial<Config>}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}
