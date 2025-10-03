"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import {
  type HyperparameterSpace,
  type NormalizationOption,
  type TrainingConfig,
  type TrainingDatasetOption,
} from "@/lib/training";
import {
  simulateTrainingRun,
  type TrainingRunPoint,
  type TrainingRunSummary,
} from "@/lib/trainingSimulation";
import { gradientDescentPath } from "@/lib/gradientSurface";
import { useGradientSurfaceStore } from "@/store/gradientSurfaceStore";

const CURVE_WIDTH = 420;
const CURVE_HEIGHT = 240;

function formatNumber(value: number) {
  return value % 1 === 0 ? value.toString() : value.toFixed(3);
}

function formatDelta(value: number) {
  const magnitude = Math.abs(value);
  if (magnitude === 0) {
    return "±0.000";
  }
  const sign = value > 0 ? "+" : "-";
  return `${sign}${magnitude.toFixed(3)}`;
}

type TrainingCurvePreviewProps = {
  points: TrainingRunPoint[];
  highlightEpoch: number;
  learningRate: number;
};

function TrainingCurvePreview({ points, highlightEpoch, learningRate }: TrainingCurvePreviewProps) {
  if (points.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-3xl border border-dashed border-[rgba(255,255,255,0.12)] text-sm text-[color:var(--color-text-secondary)]">
        Configure a dataset to preview the loss curve.
      </div>
    );
  }

  const epochs = points.map((point) => point.epoch);
  const trainingLoss = points.map((point) => point.trainingLoss);
  const validationLoss = points.map((point) => point.validationLoss);
  const maxEpoch = Math.max(...epochs, 1);
  const minLoss = Math.min(...trainingLoss, ...validationLoss);
  const maxLoss = Math.max(...trainingLoss, ...validationLoss);
  const padding = { top: 30, right: 28, bottom: 54, left: 58 };
  const innerWidth = CURVE_WIDTH - padding.left - padding.right;
  const innerHeight = CURVE_HEIGHT - padding.top - padding.bottom;

  const pointToPath = (series: number[]) =>
    series
      .map((value, index) => {
        const epoch = epochs[index];
        const x = padding.left + (epoch / maxEpoch) * innerWidth;
        const normalized = (value - minLoss) / (maxLoss - minLoss || 1);
        const y = padding.top + (1 - normalized) * innerHeight;
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  const trainingPath = pointToPath(trainingLoss);
  const validationPath = pointToPath(validationLoss);

  const markerEpoch = Math.min(highlightEpoch, maxEpoch);
  const markerX = padding.left + (markerEpoch / maxEpoch) * innerWidth;
  const learningPulse = Math.min(1, learningRate / 0.1);

  return (
    <svg viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`} className="w-full" role="img" aria-label="Training curve preview">
      <defs>
        <linearGradient id="curve-train" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,47,185,0.45)" />
          <stop offset="100%" stopColor="rgba(255,47,185,0)" />
        </linearGradient>
        <linearGradient id="curve-val" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(35,230,255,0.4)" />
          <stop offset="100%" stopColor="rgba(35,230,255,0)" />
        </linearGradient>
      </defs>
      <rect
        x={padding.left}
        y={padding.top}
        width={innerWidth}
        height={innerHeight}
        rx={22}
        fill="rgba(12,18,26,0.5)"
        stroke="rgba(255,255,255,0.08)"
      />
      <path d={`${trainingPath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`} fill="url(#curve-train)" opacity={0.55} />
      <path d={`${validationPath} L ${padding.left + innerWidth} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`} fill="url(#curve-val)" opacity={0.6} />
      <path d={trainingPath} stroke="rgba(255,47,185,0.85)" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={validationPath} stroke="rgba(35,230,255,0.82)" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="12 6" />
      <line
        x1={markerX}
        x2={markerX}
        y1={padding.top}
        y2={padding.top + innerHeight}
        stroke="rgba(255,200,87,0.6)"
        strokeWidth={2}
        strokeDasharray="6 6"
      />
      <circle
        cx={markerX}
        cy={padding.top + innerHeight * 0.18}
        r={8 + learningPulse * 6}
        fill="rgba(255,200,87,0.2)"
        stroke="rgba(255,200,87,0.8)"
        strokeWidth={1.5}
      />
      <g fontFamily="var(--font-inter, system-ui)" fontSize="12" fill="rgba(255,255,255,0.55)">
        <text x={padding.left + innerWidth / 2} y={CURVE_HEIGHT - 18} textAnchor="middle">
          Epochs (0 → {maxEpoch})
        </text>
        <text x={padding.left - 20} y={padding.top - 12} textAnchor="end">
          Loss
        </text>
        <text x={padding.left + innerWidth - 6} y={padding.top + 16} textAnchor="end" fill="rgba(255,47,185,0.72)">
          Train
        </text>
        <text x={padding.left + innerWidth - 6} y={padding.top + 34} textAnchor="end" fill="rgba(35,230,255,0.7)">
          Val
        </text>
      </g>
    </svg>
  );
}

type TrainingRunRecord = {
  id: string;
  summary: TrainingRunSummary;
  config: TrainingConfig;
  datasetLabel: string;
  normalizationLabels: string[];
  timestamp: number;
};

type NeuralTrainingControllerProps = {
  datasets: TrainingDatasetOption[];
  normalizationOptions: NormalizationOption[];
  hyperparameterSpace: HyperparameterSpace;
  initialConfig: TrainingConfig;
  onConfigChange?: (config: TrainingConfig) => void;
  onRunTraining?: (config: TrainingConfig) => void;
  onResetConfig?: (config: TrainingConfig) => void;
};

export function NeuralTrainingController({
  datasets,
  normalizationOptions,
  hyperparameterSpace,
  initialConfig,
  onConfigChange,
  onRunTraining,
  onResetConfig,
}: NeuralTrainingControllerProps) {
  const addGradientSnapshot = useGradientSurfaceStore((state) => state.addSnapshot);
  const clearGradientSnapshots = useGradientSurfaceStore((state) => state.clearSnapshots);
  const clearGradientAnnotations = useGradientSurfaceStore((state) => state.clearAnnotations);
  const [config, setConfig] = useState(initialConfig);
  const [runHistory, setRunHistory] = useState<TrainingRunRecord[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [comparisonRunId, setComparisonRunId] = useState<string | null>(null);

  useEffect(() => {
    setConfig({ ...initialConfig, normalization: [...initialConfig.normalization] });
  }, [initialConfig]);

  useEffect(() => {
    if (comparisonRunId && !runHistory.some((record) => record.id === comparisonRunId)) {
      setComparisonRunId(null);
    }
  }, [comparisonRunId, runHistory]);


  const updateConfig = useCallback(
    (updater: (prev: TrainingConfig) => TrainingConfig) => {
      setConfig((prev) => {
        const next = updater(prev);
        onConfigChange?.(next);
        return next;
      });
    },
    [onConfigChange],
  );

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === config.datasetId) ?? datasets[0],
    [config.datasetId, datasets],
  );

  const selectedNormalizationOptions = useMemo(
    () => normalizationOptions.filter((option) => config.normalization.includes(option.id)),
    [config.normalization, normalizationOptions],
  );

  const simulation = useMemo(
    () => simulateTrainingRun({ config, dataset: selectedDataset, normalization: selectedNormalizationOptions }),
    [config, selectedDataset, selectedNormalizationOptions],
  );

  const epochRange = hyperparameterSpace.epochRange;

  const isNormalizationActive = useMemo(() => config.normalization.length > 0, [config.normalization]);

  const handleReset = () => {
    const resetConfig = { ...initialConfig, normalization: [...initialConfig.normalization] };
    setConfig(resetConfig);
    setRunHistory([]);
    setSelectedRunId(null);
    setComparisonRunId(null);
    onResetConfig?.(resetConfig);
    clearGradientSnapshots();
    clearGradientAnnotations();
  };

  const handleRunTrainingClick = () => {
    const summaryClone: TrainingRunSummary = {
      ...simulation,
      points: simulation.points.map((point) => ({ ...point })),
      notes: [...simulation.notes],
    };
    const configSnapshot: TrainingConfig = { ...config, normalization: [...config.normalization] };
    const record: TrainingRunRecord = {
      id: `${Date.now()}-${Math.round(Math.random() * 1000000)}`,
      summary: summaryClone,
      config: configSnapshot,
      datasetLabel: selectedDataset.label,
      normalizationLabels: selectedNormalizationOptions.map((option) => option.label),
      timestamp: Date.now(),
    };
    const updatedHistory = [record, ...runHistory].slice(0, 5);
    setRunHistory(updatedHistory);
    setSelectedRunId(record.id);
    if (!comparisonRunId && updatedHistory.length > 1) {
      setComparisonRunId(updatedHistory[1].id);
    }
    onRunTraining?.(configSnapshot);

    const derivedSteps = Math.min(20, Math.max(6, Math.round(configSnapshot.epochs / 2)));
    const path = gradientDescentPath({ learningRate: configSnapshot.learningRate, steps: derivedSteps });
    addGradientSnapshot({
      id: record.id,
      path,
      meta: {
        learningRate: configSnapshot.learningRate,
        steps: derivedSteps,
        source: "neural-controller",
        timestamp: record.timestamp,
        label: `${selectedDataset.label} • lr=${formatNumber(configSnapshot.learningRate)}`,
      },
    });
  };

  const configSummary = useMemo(
    () => [
      `${selectedDataset.label} dataset (${selectedDataset.size} samples) • ${selectedDataset.featureCount} engineered features`,
      `Learning rate ${formatNumber(config.learningRate)}, batch size ${config.batchSize}, momentum ${formatNumber(config.momentum)}`,
      isNormalizationActive
        ? `Normalization: ${selectedNormalizationOptions.map((option) => option.label).join(", ")}`
        : "Normalization disabled",
    ],
    [
      config.learningRate,
      config.batchSize,
      config.momentum,
      isNormalizationActive,
      selectedNormalizationOptions,
      selectedDataset,
    ],
  );

  const activeRun = useMemo(() => {
    if (runHistory.length === 0) {
      return null;
    }
    if (selectedRunId) {
      const match = runHistory.find((record) => record.id === selectedRunId);
      if (match) return match;
    }
    return runHistory[0];
  }, [runHistory, selectedRunId]);

  const comparisonRun = useMemo(() => {
    if (!comparisonRunId) {
      return null;
    }
    return runHistory.find((record) => record.id === comparisonRunId) ?? null;
  }, [comparisonRunId, runHistory]);

  useEffect(() => {
    if (comparisonRunId && activeRun && comparisonRunId === activeRun.id) {
      setComparisonRunId(null);
    }
  }, [activeRun, comparisonRunId]);

  const activeRunMeta = useMemo(() => {
    if (!activeRun) {
      return null;
    }
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return {
      capturedAt: formatter.format(new Date(activeRun.timestamp)),
    };
  }, [activeRun]);

  const comparisonDelta = useMemo(() => {
    if (!activeRun || !comparisonRun) {
      return null;
    }
    return {
      trainingLoss: activeRun.summary.finalTrainingLoss - comparisonRun.summary.finalTrainingLoss,
      validationLoss: activeRun.summary.finalValidationLoss - comparisonRun.summary.finalValidationLoss,
      mae: activeRun.summary.meanAbsoluteError - comparisonRun.summary.meanAbsoluteError,
      overfitIndex: activeRun.summary.overfitIndex - comparisonRun.summary.overfitIndex,
      rSquared: activeRun.summary.rSquared - comparisonRun.summary.rSquared,
    };
  }, [activeRun, comparisonRun]);

  return (
    <FullScreenCard className="glass-panel p-6" title="Neural training controller blueprint">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-[520px]">
          <h3
            className="text-lg text-[color:var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Neural training controller blueprint
          </h3>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            Configure deterministic dataset slices, toggle normalization pipelines, and prime gradient descent settings
            before launching the live training demo.
          </p>
        </div>
        <span className="badge">Live Sync</span>
      </div>
      <div className="token-divider" />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Dataset selection</h4>
              <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                Seed locked for reproducibility
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {datasets.map((dataset) => {
                const isActive = dataset.id === config.datasetId;
                return (
                  <button
                    key={dataset.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        datasetId: dataset.id,
                      }))
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-[rgba(35,230,255,0.7)] bg-[rgba(35,230,255,0.12)] text-[color:var(--color-text-primary)]"
                        : "border-[rgba(255,255,255,0.12)] bg-transparent text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.24)]"
                    }`}
                  >
                    <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {dataset.label}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
                      {dataset.description}
                    </p>
                    <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                      {dataset.size} rows • {dataset.featureCount} features
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[color:var(--color-text-secondary)]">{selectedDataset.notes}</p>
          </div>
          <div>
            <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Normalization pipelines</h4>
            <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">
              Stack multiple transforms to demonstrate their compound effect on convergence.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {normalizationOptions.map((option) => {
                const active = config.normalization.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => {
                        const nextSet = new Set(prev.normalization);
                        if (nextSet.has(option.id)) {
                          nextSet.delete(option.id);
                        } else {
                          nextSet.add(option.id);
                        }
                        const ordered = normalizationOptions
                          .map((item) => item.id)
                          .filter((id) => nextSet.has(id));
                        return {
                          ...prev,
                          normalization: ordered,
                        };
                      })
                    }
                    className={`rounded-full border px-4 py-2 text-xs transition ${
                      active
                        ? "border-[rgba(255,47,185,0.7)] bg-[rgba(255,47,185,0.12)] text-[color:var(--color-text-primary)]"
                        : "border-[rgba(255,255,255,0.12)] bg-transparent text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.24)]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid gap-3 text-xs text-[color:var(--color-text-secondary)] sm:grid-cols-3">
              {normalizationOptions.map((option) => (
                <p key={`${option.id}-desc`} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,26,0.55)] p-3">
                  <span className="block text-[color:var(--color-text-primary)]">{option.label}</span>
                  {option.description}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-base font-medium text-[color:var(--color-text-primary)]">Gradient descent settings</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Learning rate</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hyperparameterSpace.learningRates.map((rate) => (
                    <button
                      key={`lr-${rate}`}
                      type="button"
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          learningRate: rate,
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs ${
                        rate === config.learningRate
                          ? "border-[rgba(255,47,185,0.7)] bg-[rgba(255,47,185,0.16)] text-[color:var(--color-text-primary)]"
                          : "border-[rgba(255,255,255,0.12)] text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.24)]"
                      }`}
                    >
                      {formatNumber(rate)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Batch size</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hyperparameterSpace.batchSizes.map((size) => (
                    <button
                      key={`bs-${size}`}
                      type="button"
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          batchSize: size,
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs ${
                        size === config.batchSize
                          ? "border-[rgba(35,230,255,0.7)] bg-[rgba(35,230,255,0.16)] text-[color:var(--color-text-primary)]"
                          : "border-[rgba(255,255,255,0.12)] text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.24)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Momentum</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hyperparameterSpace.momentumValues.map((momentum) => (
                    <button
                      key={`mom-${momentum}`}
                      type="button"
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          momentum,
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs ${
                        momentum === config.momentum
                          ? "border-[rgba(255,200,87,0.7)] bg-[rgba(255,200,87,0.16)] text-[color:var(--color-text-primary)]"
                          : "border-[rgba(255,255,255,0.12)] text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.24)]"
                      }`}
                    >
                      {formatNumber(momentum)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">
                  Epoch target
                </p>
                <span className="text-sm text-[color:var(--color-text-primary)]">{config.epochs} epochs</span>
              </div>
              <input
                type="range"
                min={epochRange[0]}
                max={epochRange[1]}
                step={10}
                value={config.epochs}
                onChange={(event) =>
                  updateConfig((prev) => ({
                    ...prev,
                    epochs: Number(event.target.value),
                  }))
                }
                className="mt-3 w-full accent-[var(--color-highlight)]"
                aria-label="Adjust epoch target"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.6)] p-5">
            <TrainingCurvePreview
              points={simulation.points}
              highlightEpoch={config.epochs}
              learningRate={config.learningRate}
            />
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-[0.7rem] text-[color:var(--color-text-secondary)]">
              <span>Learning rate pulse reflects schedule intensity.</span>
              <span>Marker tracks the highlighted epoch target.</span>
            </div>
          </div>
          <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-5 text-sm text-[color:var(--color-text-secondary)]">
            <h4 className="text-sm font-medium text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Training run snapshot
            </h4>
            {runHistory.length > 0 && activeRun ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    {runHistory.map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => setSelectedRunId(record.id)}
                        className={`rounded-full border px-3 py-1 text-[0.7rem] transition ${
                          activeRun.id === record.id
                            ? "border-[rgba(35,230,255,0.7)] bg-[rgba(35,230,255,0.16)] text-[color:var(--color-text-primary)]"
                            : "border-[rgba(255,255,255,0.14)] bg-transparent text-[color:var(--color-text-secondary)] hover:border-[rgba(255,255,255,0.3)]"
                        }`}
                        aria-label={`Show snapshot from ${record.datasetLabel}`}
                      >
                        {record.datasetLabel}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`text-[0.7rem] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] ${
                      runHistory.length === 0 ? "opacity-40 pointer-events-none" : ""
                    }`}
                    onClick={() => {
                      setRunHistory([]);
                      setSelectedRunId(null);
                      setComparisonRunId(null);
                    }}
                    disabled={runHistory.length === 0}
                  >
                    Clear history
                  </button>
                </div>
                {runHistory.length > 1 ? (
                  <div className="flex flex-wrap items-center gap-2 text-[0.7rem] text-[color:var(--color-text-secondary)]">
                    <label htmlFor="comparison-select" className="uppercase tracking-[0.18em]">
                      Compare to
                    </label>
                    <select
                      id="comparison-select"
                      className="rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(12,18,26,0.55)] px-3 py-1 text-[color:var(--color-text-primary)]"
                      value={comparisonRunId ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setComparisonRunId(value === "" ? null : value);
                      }}
                    >
                      <option value="">None</option>
                      {runHistory
                        .filter((record) => record.id !== activeRun.id)
                        .map((record) => (
                          <option key={`compare-${record.id}`} value={record.id}>
                            {record.datasetLabel}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.65)] px-3 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Train loss</p>
                    <p className="mt-1 text-lg text-[color:var(--color-text-primary)]">{activeRun.summary.finalTrainingLoss.toFixed(3)}</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.65)] px-3 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Validation</p>
                    <p className="mt-1 text-lg text-[color:var(--color-text-primary)]">{activeRun.summary.finalValidationLoss.toFixed(3)}</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(35,230,255,0.3)] bg-[rgba(35,230,255,0.12)] px-3 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">R² score</p>
                    <p className="mt-1 text-lg text-[color:var(--color-text-primary)]">{activeRun.summary.rSquared.toFixed(3)}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[rgba(255,200,87,0.3)] bg-[rgba(255,200,87,0.14)] px-4 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Mean abs error</p>
                    <p className="mt-1 text-lg text-[color:var(--color-text-primary)]">{activeRun.summary.meanAbsoluteError.toFixed(3)}</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,47,185,0.3)] bg-[rgba(255,47,185,0.12)] px-4 py-3">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Overfit index</p>
                    <p className="mt-1 text-lg text-[color:var(--color-text-primary)]">{activeRun.summary.overfitIndex.toFixed(3)}</p>
                  </div>
                </div>
                {comparisonDelta && comparisonRun ? (
                  <div className="rounded-2xl border border-[rgba(35,230,255,0.2)] bg-[rgba(35,230,255,0.1)] px-4 py-4 text-[0.75rem] text-[color:var(--color-text-secondary)]">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-primary)]">
                      Δ vs {comparisonRun.datasetLabel}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[color:var(--color-text-primary)]">Train loss</p>
                        <p>{formatDelta(comparisonDelta.trainingLoss)}</p>
                      </div>
                      <div>
                        <p className="text-[color:var(--color-text-primary)]">Validation loss</p>
                        <p>{formatDelta(comparisonDelta.validationLoss)}</p>
                      </div>
                      <div>
                        <p className="text-[color:var(--color-text-primary)]">R²</p>
                        <p>{formatDelta(comparisonDelta.rSquared)}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[color:var(--color-text-primary)]">Mean abs error</p>
                        <p>{formatDelta(comparisonDelta.mae)}</p>
                      </div>
                      <div>
                        <p className="text-[color:var(--color-text-primary)]">Overfit index</p>
                        <p>{formatDelta(comparisonDelta.overfitIndex)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(12,18,26,0.6)] px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--color-text-secondary)]">Captured</p>
                  <p className="mt-1 text-[color:var(--color-text-primary)]">{activeRun.datasetLabel}</p>
                  <p className="text-[0.75rem]">{activeRun.config.epochs} epochs • lr {formatNumber(activeRun.config.learningRate)} • batch {activeRun.config.batchSize}</p>
                  <p className="text-[0.7rem] text-[color:var(--color-text-secondary)]">
                    {activeRun.normalizationLabels.length > 0
                      ? `Normalization: ${activeRun.normalizationLabels.join(", ")}`
                      : "Normalization disabled"}
                    {activeRunMeta ? ` • ${activeRunMeta.capturedAt}` : null}
                  </p>
                </div>
                <ul className="space-y-2 text-[0.75rem]">
                  {activeRun.summary.notes.map((note, index) => (
                    <li key={`note-${index}`}>{note}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-[0.85rem] text-[color:var(--color-text-secondary)]">
                Run staged training to capture reproducible metrics for later analysis and comparison.
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-5 text-sm text-[color:var(--color-text-secondary)]">
            <h4 className="text-sm font-medium text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Configuration summary
            </h4>
            <ul className="mt-3 space-y-2">
              {configSummary.map((line, index) => (
                <li key={`summary-${index}`}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" className="button-primary" onClick={handleRunTrainingClick}>
          Run staged training
        </button>
        <button type="button" className="button-secondary" onClick={handleReset}>
          Reset selections
        </button>
      </div>
    </FullScreenCard>
  );
}
