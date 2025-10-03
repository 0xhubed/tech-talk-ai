"use client";

import { useMemo, useState } from "react";
import { FullScreenCard } from "@/components/ui/FullScreenCard";
import { MathCopyBlock } from "@/components/ui/MathCopyBlock";

export type NeuralAnatomyPanelProps = {
  anchorId?: string;
};

type FocusMode = "weights" | "activations" | "biases";

type FocusDefinition = {
  id: FocusMode;
  label: string;
  description: string;
  formula: string;
};

const focusDefinitions: FocusDefinition[] = [
  {
    id: "weights",
    label: "Weights",
    description: "Weights scale each input feature. Highlighting them shows how changing w alters the contribution flowing forward.",
    formula: "z_j = \\sum_i w_{ij} x_i + b_j",
  },
  {
    id: "activations",
    label: "Activations",
    description: "Activations transform the weighted sum. Use this to explain non-linearity and how signals propagate layer to layer.",
    formula: "a_j = \\sigma(z_j) = \\frac{1}{1 + e^{-z_j}}",
  },
  {
    id: "biases",
    label: "Biases",
    description: "Bias terms shift the activation thresholds so neurons can fire even when inputs are near zero.",
    formula: "z_j = w_{j} \\cdot x + b_j",
  },
];

type DiagramNode = {
  id: string;
  layer: number;
  index: number;
};

type DiagramEdge = {
  id: string;
  from: string;
  to: string;
};

const layers = [3, 3, 1];

const nodes: DiagramNode[] = layers.flatMap((count, layerIndex) =>
  Array.from({ length: count }).map((_, index) => ({
    id: `L${layerIndex}-N${index}`,
    layer: layerIndex,
    index,
  })),
);

const edges: DiagramEdge[] = nodes
  .filter((node) => node.layer < layers.length - 1)
  .flatMap((source) =>
    nodes
      .filter((target) => target.layer === source.layer + 1)
      .map((target) => ({
        id: `${source.id}-${target.id}`,
        from: source.id,
        to: target.id,
      })),
  );

function nodePosition(node: DiagramNode) {
  const x = 16 + node.layer * 34;
  const layerCount = layers[node.layer];
  const spacing = 52 / Math.max(1, layerCount - 1);
  const y = layerCount === 1 ? 40 : 14 + node.index * spacing;
  return { x, y };
}

function edgePath(edge: DiagramEdge) {
  const from = nodes.find((node) => node.id === edge.from)!;
  const to = nodes.find((node) => node.id === edge.to)!;
  const fromPos = nodePosition(from);
  const toPos = nodePosition(to);
  const dx = (toPos.x - fromPos.x) / 2;
  return `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + dx} ${fromPos.y}, ${toPos.x - dx} ${toPos.y}, ${toPos.x} ${toPos.y}`;
}

export function NeuralAnatomyPanel({ anchorId }: NeuralAnatomyPanelProps) {
  const [focus, setFocus] = useState<FocusMode>("weights");
  const focusInfo = useMemo(() => focusDefinitions.find((item) => item.id === focus) ?? focusDefinitions[0], [focus]);

  return (
    <section id={anchorId} className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <FullScreenCard className="glass-panel p-6" title="Network anatomy spotlight">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
                Small feed-forward network
              </span>
              <h2
                className="text-2xl text-[color:var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Show the building blocks before training begins.
              </h2>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Toggle weights, activations, and biases to explain how information flows. The diagram mirrors the notebook
                example, so you can jump between the stage view and the Jupyter cell without reframing.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs text-[color:var(--color-text-secondary)]">
                <span className="uppercase tracking-[0.22em]">Highlight</span>
                {focusDefinitions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`rounded-full border px-3 py-1 transition ${
                      focus === option.id
                        ? "border-[rgba(35,230,255,0.65)] bg-[rgba(35,230,255,0.14)] text-[color:var(--color-text-primary)]"
                        : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.28)]"
                    }`}
                    onClick={() => setFocus(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">{focusInfo.description}</p>
              <MathCopyBlock
                expression={focusInfo.formula}
                caption="Copy formula to paste directly into the notebook markdown cell."
              />
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(35,230,255,0.16),transparent_70%)]" />
              <svg
                viewBox="0 0 120 80"
                className="relative mx-auto w-full max-w-xl"
                role="img"
                aria-label="Three-layer neural network diagram"
              >
                <defs>
                  <linearGradient id="edge-active" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(35,230,255,0.75)" />
                    <stop offset="100%" stopColor="rgba(255,47,185,0.75)" />
                  </linearGradient>
                </defs>
                {edges.map((edge) => (
                  <path
                    key={edge.id}
                    d={edgePath(edge)}
                    stroke={focus === "weights" ? "url(#edge-active)" : "rgba(255,255,255,0.18)"}
                    strokeWidth={focus === "weights" ? 2.4 : 1.4}
                    fill="none"
                    opacity={focus === "weights" ? 0.9 : 0.6}
                  />
                ))}
                {nodes.map((node) => {
                  const { x, y } = nodePosition(node);
                  const isHidden = node.layer === 1;
                  const baseFill = isHidden ? "rgba(35,230,255,0.18)" : "rgba(255,47,185,0.18)";
                  const isOutput = node.layer === layers.length - 1;
                  const activationHighlight = focus === "activations" && !isOutput;
                  const biasHighlight = focus === "biases" && !isOutput;

                  return (
                    <g key={node.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r={activationHighlight ? 8 : 7}
                        fill={activationHighlight ? "rgba(255,255,255,0.18)" : baseFill}
                        stroke={activationHighlight ? "rgba(255,200,87,0.9)" : "rgba(255,255,255,0.35)"}
                        strokeWidth={activationHighlight ? 2 : 1}
                      />
                      {biasHighlight ? (
                        <text
                          x={x}
                          y={y + 0.5}
                          textAnchor="middle"
                          fontSize="4.8"
                          fontFamily="var(--font-inter, system-ui)"
                          fill="rgba(255,200,87,0.92)"
                        >
                          +b
                        </text>
                      ) : null}
                      <text
                        x={x}
                        y={y + 15}
                        textAnchor="middle"
                        fontSize="4.2"
                        fontFamily="var(--font-inter, system-ui)"
                        fill="rgba(255,255,255,0.68)"
                      >
                        {node.layer === 0 ? `x${node.index + 1}` : node.layer === layers.length - 1 ? "ŷ" : `h${
                          node.index + 1
                        }`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </FullScreenCard>
      </div>
    </section>
  );
}
