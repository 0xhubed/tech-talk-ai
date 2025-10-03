"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import {
  computeLossSurface,
  fitPendulumParameters,
  generateReasoningStream,
  simulatePendulumTrials,
  type LossSurfaceResult,
  DEFAULT_EXPERIMENT_LENGTHS,
  DEFAULT_EXPERIMENT_NOISE,
} from "@/lib/pendulum";

const NOISE_PRESETS = [0, 0.02, 0.05, 0.08] as const;
const GROUND_TRUTH = {
  k: 2 * Math.PI,
  p: 0.5,
};

function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

type LossSurfacePreviewProps = {
  surface: LossSurfaceResult;
  fit: { k: number; p: number };
  noise: number;
};

function LossSurfacePreview({ surface, fit, noise }: LossSurfacePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bestCell = useMemo(() => {
    if (surface.cells.length === 0) return undefined;
    return surface.cells.reduce((best, cell) => (cell.rmse < best.rmse ? cell : best), surface.cells[0]);
  }, [surface]);

  const rmseBounds = useMemo(() => {
    if (surface.cells.length === 0) return undefined;
    const values = surface.cells.map((cell) => cell.rmse);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [surface]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 1;
    const height = Math.max(280, Math.round(width * 0.72));
    const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 32, right: 32, bottom: 56, left: 66 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    ctx.fillStyle = "rgba(12,18,26,0.6)";
    ctx.fillRect(0, 0, width, height);

    if (surface.cells.length === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "16px var(--font-inter, system-ui)";
      ctx.textAlign = "center";
      ctx.fillText("Add more trials to preview the loss surface", width / 2, height / 2);
      ctx.restore();
      return;
    }

    const [kMin, kMax] = surface.kRange;
    const [pMin, pMax] = surface.pRange;
    const minLoss = rmseBounds?.min ?? Math.min(...surface.cells.map((cell) => cell.rmse));
    const maxLoss = rmseBounds?.max ?? Math.max(...surface.cells.map((cell) => cell.rmse));
    const cellWidth = innerWidth / surface.steps;
    const cellHeight = innerHeight / surface.steps;

    const toX = (k: number) => padding.left + ((k - kMin) / (kMax - kMin || 1)) * innerWidth;
    const toY = (p: number) => padding.top + (1 - (p - pMin) / (pMax - pMin || 1)) * innerHeight;

    surface.cells.forEach((cell) => {
      const x = padding.left + cell.kIndex * cellWidth;
      const y = padding.top + (surface.steps - 1 - cell.pIndex) * cellHeight;
      const ratioValue = (cell.rmse - minLoss) / (maxLoss - minLoss || 1);
      const hue = 200 - ratioValue * 160;
      const light = 62 - ratioValue * 22;
      ctx.fillStyle = `hsla(${hue}, 85%, ${light}%, 0.72)`;
      ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1);
    });

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(padding.left, padding.top, innerWidth, innerHeight);

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "12px var(--font-inter, system-ui)";
    const tickCount = 4;
    for (let i = 0; i < tickCount; i += 1) {
      const t = i / (tickCount - 1 || 1);
      const kValue = kMin + t * (kMax - kMin);
      const x = padding.left + t * innerWidth;
      ctx.textAlign = "center";
      ctx.fillText(kValue.toFixed(2), x, height - 32);
    }

    ctx.textAlign = "right";
    for (let i = 0; i < tickCount; i += 1) {
      const t = i / (tickCount - 1 || 1);
      const pValue = pMin + t * (pMax - pMin);
      const y = padding.top + (1 - t) * innerHeight;
      ctx.fillText(pValue.toFixed(2), padding.left - 10, y + 4);
    }

    const drawMarker = (k: number, p: number, fillColor: string, strokeColor: string, label: string) => {
      if (k < kMin || k > kMax || p < pMin || p > pMax) return;
      const x = toX(k);
      const y = toY(p);
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "12px var(--font-inter, system-ui)";
      ctx.textAlign = x > width - 80 ? "right" : "left";
      ctx.fillText(label, x > width - 80 ? x - 12 : x + 12, y - 12);
    };

    if (bestCell) {
      drawMarker(bestCell.k, bestCell.p, "rgba(255,200,87,0.25)", "rgba(255,200,87,0.95)", "Grid optimum");
    }
    drawMarker(fit.k, fit.p, "rgba(255,47,185,0.25)", "rgba(255,47,185,0.95)", "Current fit");
    drawMarker(GROUND_TRUTH.k, GROUND_TRUTH.p, "rgba(35,230,255,0.25)", "rgba(35,230,255,0.95)", "Ground truth");

    ctx.fillStyle = "rgba(255,255,255,0.58)";
    ctx.font = "14px var(--font-inter, system-ui)";
    ctx.textAlign = "center";
    ctx.fillText("Pendulum loss surface (RMSE)", padding.left + innerWidth / 2, padding.top - 10);
    ctx.fillText("k (scalar multiplier)", padding.left + innerWidth / 2, height - 12);

    ctx.save();
    ctx.translate(18, padding.top + innerHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Exponent p", 0, 0);
    ctx.restore();

    ctx.restore();
  }, [surface, fit, bestCell, rmseBounds]);

  useEffect(() => {
    draw();
    const container = containerRef.current;
    if (typeof ResizeObserver !== "undefined" && container) {
      const observer = new ResizeObserver(() => {
        draw();
      });
      observer.observe(container);
      return () => observer.disconnect();
    }

    return undefined;
  }, [draw]);

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Loss surface preview</h4>
        <span className="badge">Noise σ {formatPercentage(noise)}</span>
      </div>
      <div className="relative mt-3 flex-1 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)]">
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-x-5 bottom-4 flex flex-wrap justify-between gap-3 text-[0.7rem] text-[color:var(--color-text-secondary)]">
          <span>
            RMSE range {rmseBounds ? `${rmseBounds.min.toFixed(4)} – ${rmseBounds.max.toFixed(4)}` : "–"}
          </span>
          <span>Compare fit (magenta) vs truth (cyan)</span>
          <span>Highlight the slope near the optimum</span>
        </div>
      </div>
    </div>
  );
}

export type PendulumSandboxProps = {
  anchorId?: string;
};

export function PendulumSandbox({ anchorId }: PendulumSandboxProps) {
  const [lengths, setLengths] = useState(DEFAULT_EXPERIMENT_LENGTHS);
  const [noise, setNoise] = useState(DEFAULT_EXPERIMENT_NOISE);
  const trials = useMemo(() => simulatePendulumTrials(lengths, { noiseSigma: noise, seed: 17 }), [lengths, noise]);
  const fit = useMemo(() => fitPendulumParameters(trials), [trials]);
  const lossSurface = useMemo(
    () => computeLossSurface(trials, { steps: 36, kRange: [5.9, 6.7], pRange: [0.45, 0.55] }),
    [trials],
  );
  const nextSuggestedLength = useMemo(() => Number((Math.max(...lengths) + 0.35).toFixed(2)), [lengths]);
  const reasoningSteps = useMemo(
    () => generateReasoningStream(trials, fit, { noiseSigma: noise, nextLengthSuggestion: nextSuggestedLength }),
    [trials, fit, noise, nextSuggestedLength],
  );

  const addTrial = () => {
    const nextLength = Number((0.4 + Math.random() * 2.4).toFixed(2));
    setLengths((prev) => [...prev, nextLength]);
  };

  const resetExperiments = () => {
    setLengths(DEFAULT_EXPERIMENT_LENGTHS);
    setNoise(DEFAULT_EXPERIMENT_NOISE);
  };

  return (
    <section className="section-boundary" id={anchorId ?? "sandbox"}>
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <FullScreenCard className="glass-panel p-6" title="Pendulum experiment queue">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3
                className="text-lg text-[color:var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Pendulum experiment queue
              </h3>
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                Agent selects lengths, observes noisy periods, and updates the k, p fit in the hypothesis T = k * L^p.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="button-secondary"
                onClick={resetExperiments}
              >
                Reset queue
              </button>
              <button
                type="button"
                className="button-primary"
                onClick={addTrial}
              >
                Add experiment
              </button>
            </div>
          </div>
          <div className="token-divider" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.5)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Measurement buffer</h4>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
                    <label htmlFor="noise-slider" className="uppercase tracking-[0.2em] text-[color:var(--color-text-primary)]">
                      Noise σ
                    </label>
                    <span>{formatPercentage(noise)}</span>
                  </div>
                </div>
                <input
                  id="noise-slider"
                  type="range"
                  min={0}
                  max={0.12}
                  step={0.01}
                  value={noise}
                  onChange={(event) => setNoise(Number(event.target.value))}
                  className="mt-4 w-full accent-[var(--color-accent)]"
                  aria-label="Adjust noise sigma for measurements"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {NOISE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNoise(preset)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        Math.abs(noise - preset) < 0.001
                          ? "border-[rgba(35,230,255,0.8)] bg-[rgba(35,230,255,0.15)] text-[color:var(--color-text-primary)]"
                          : "border-[rgba(255,255,255,0.15)] bg-transparent text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.3)]"
                      }`}
                    >
                      {formatPercentage(preset)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.5)]">
                <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.5fr)] gap-3 border-b border-[rgba(255,255,255,0.08)] px-4 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                  <span>Trial</span>
                  <span>Length (m)</span>
                  <span>Observed T (s)</span>
                  <span>Agent log</span>
                </div>
                <div className="max-h-64 overflow-auto px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
                  {trials.map((trial, index) => (
                    <div
                      key={`trial-${index}`}
                      className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.5fr)] gap-3 py-2"
                    >
                      <span>{index + 1}</span>
                      <span>{trial.length.toFixed(2)}</span>
                      <span>{trial.observedPeriod.toFixed(3)}</span>
                      <span>
                        {index === trials.length - 1
                          ? "Latest measurement feeding regression"
                          : index % 2 === 0
                          ? "Maintaining exploration"
                          : "Held for convergence check"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm text-[color:var(--color-text-secondary)] sm:grid-cols-3">
                <div className="rounded-2xl border border-[rgba(35,230,255,0.2)] bg-[rgba(35,230,255,0.08)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Estimated k</p>
                  <p className="mt-1 text-xl text-[color:var(--color-text-primary)]">{fit.k.toFixed(3)}</p>
                  <p className="mt-1 text-[0.75rem]">Ground truth {GROUND_TRUTH.k.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-[rgba(255,47,185,0.2)] bg-[rgba(255,47,185,0.08)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Estimated p</p>
                  <p className="mt-1 text-xl text-[color:var(--color-text-primary)]">{fit.p.toFixed(3)}</p>
                  <p className="mt-1 text-[0.75rem]">Target exponent {GROUND_TRUTH.p}</p>
                </div>
                <div className="rounded-2xl border border-[rgba(255,200,87,0.25)] bg-[rgba(255,200,87,0.08)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">Experiment load</p>
                  <p className="mt-1 text-xl text-[color:var(--color-text-primary)]">{trials.length} trials</p>
                  <p className="mt-1 text-[0.75rem]">Increase noise to showcase robustness</p>
                </div>
              </div>
            </div>
            <LossSurfacePreview surface={lossSurface} fit={fit} noise={noise} />
          </div>
          <div className="token-divider" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.5)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Reasoning stream</h4>
                  <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                    Captured LangGraph planner/tool loop summarised for the audience. Mirror this transcript with the
                    studio trace when you hand off to the notebook.
                  </p>
                </div>
                <a
                  className="button-secondary text-xs"
                  href="/notebooks/langgraph-pendulum.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in LangGraph Studio
                </a>
              </div>
              <ol className="mt-4 space-y-3">
                {reasoningSteps.map((step, index) => (
                  <li
                    key={step.id}
                    className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.6)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(35,230,255,0.16)] text-sm text-[color:var(--color-accent)]">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)]">
                            {step.heading}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--color-text-primary)]">{step.content}</p>
                        </div>
                      </div>
                      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                        {step.tokens} tok
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-[rgba(35,230,255,0.2)] bg-[rgba(35,230,255,0.08)] p-5 text-sm text-[color:var(--color-text-secondary)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-primary)]">
                Studio alignment notes
              </p>
              <ul className="mt-3 space-y-2">
                <li>• Step markers map to planner/tool nodes inside LangGraph Studio.</li>
                <li>• Tokens column mirrors streamed deltas so you can narrate latency budgeting.</li>
                <li>• Use the notebook CTA to replay the exact prompt/response pair for the latest trial batch.</li>
              </ul>
            </div>
          </div>
        </FullScreenCard>
      </div>
    </section>
  );
}
