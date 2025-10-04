"use client";

import { useState } from "react";

const architectures = [
  {
    id: 1,
    name: "Linear Regression",
    params: 2,
    paramsFormatted: "2",
    scale: "human",
    comparison: "Your two eyes",
    color: "rgba(35,230,255,0.6)",
    bgColor: "rgba(35,230,255,0.1)",
    example: "Housing price prediction",
    year: "1800s",
    status: "✓ Mastered",
  },
  {
    id: 2,
    name: "Neural Network",
    params: 100_000,
    paramsFormatted: "100K",
    scale: "town",
    comparison: "Population of a small town",
    color: "rgba(124,92,255,0.6)",
    bgColor: "rgba(124,92,255,0.1)",
    example: "Handwritten digit recognition (MNIST)",
    year: "1980s",
    status: "Available in notebooks",
  },
  {
    id: 3,
    name: "Deep Learning",
    params: 10_000_000,
    paramsFormatted: "10M",
    scale: "city",
    comparison: "Population of NYC",
    color: "rgba(255,47,185,0.6)",
    bgColor: "rgba(255,47,185,0.1)",
    example: "Image classification (ResNet, VGG)",
    year: "2010s",
    status: "Industry standard",
  },
  {
    id: 4,
    name: "Transformers",
    params: 1_000_000_000,
    paramsFormatted: "1B",
    scale: "country",
    comparison: "All people alive in 1800",
    color: "rgba(255,200,87,0.6)",
    bgColor: "rgba(255,200,87,0.1)",
    example: "BERT, GPT-2 (text understanding)",
    year: "2017+",
    status: "Preview available",
  },
  {
    id: 5,
    name: "Modern LLMs",
    params: 175_000_000_000,
    paramsFormatted: "175B+",
    scale: "galaxy",
    comparison: "Stars in a small galaxy",
    color: "rgba(46,213,115,0.6)",
    bgColor: "rgba(46,213,115,0.1)",
    example: "GPT-4, Claude (reasoning & generation)",
    year: "2023+",
    status: "ChatGPT, Claude",
  },
];

export function ParameterScaleVisualizer() {
  const [selectedArch, setSelectedArch] = useState<number | null>(null);

  // Calculate log scale positions (for visual representation)
  const maxParams = Math.log10(architectures[architectures.length - 1].params);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          The Scale of AI: From 2 to 175 Billion Parameters
        </h3>
        <p className="text-[color:var(--color-text-secondary)] max-w-3xl mx-auto">
          Each architecture level represents a <strong className="text-[color:var(--color-accent)]">1000× jump</strong> in complexity.
          Yet the underlying math—gradient descent, backpropagation—remains the same.
        </p>
      </div>

      {/* Visual Scale Bars */}
      <div className="space-y-3">
        {architectures.map((arch) => {
          const logWidth = (Math.log10(arch.params) / maxParams) * 100;
          const isSelected = selectedArch === arch.id;

          return (
            <button
              key={arch.id}
              type="button"
              onClick={() => setSelectedArch(isSelected ? null : arch.id)}
              className="w-full text-left transition-all"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ backgroundColor: arch.color }}>
                  {arch.id}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {arch.name}
                    </h4>
                    <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-secondary)]">
                      {arch.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg text-[color:var(--color-accent)]">
                    {arch.paramsFormatted}
                  </div>
                  <div className="text-xs text-[color:var(--color-text-secondary)]">
                    parameters
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-12 bg-[rgba(12,18,26,0.6)] rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)] transition-all">
                <div
                  className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                  style={{
                    width: `${logWidth}%`,
                    background: `linear-gradient(90deg, ${arch.bgColor}, ${arch.color})`,
                  }}
                />
                <div className="relative z-10 flex items-center h-full px-4">
                  <span className="text-sm text-[color:var(--color-text-secondary)]">
                    {arch.comparison}
                  </span>
                </div>
              </div>

              {/* Expanded details */}
              {isSelected && (
                <div className="mt-3 p-4 rounded-lg border border-[rgba(255,255,255,0.2)]" style={{ backgroundColor: arch.bgColor }}>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[color:var(--color-text-secondary)]">Era:</span>
                      <div className="font-semibold text-[color:var(--color-text-primary)] mt-1">{arch.year}</div>
                    </div>
                    <div>
                      <span className="text-[color:var(--color-text-secondary)]">Use Case:</span>
                      <div className="font-semibold text-[color:var(--color-text-primary)] mt-1">{arch.example}</div>
                    </div>
                    <div>
                      <span className="text-[color:var(--color-text-secondary)]">Scale:</span>
                      <div className="font-semibold text-[color:var(--color-text-primary)] mt-1">{arch.scale}</div>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Log scale explanation */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-[color:var(--color-accent)] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-2">
              Why Logarithmic Scale?
            </h4>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              The scale is <strong className="text-[color:var(--color-text-primary)]">logarithmic</strong> (base 10) because
              parameter counts span <strong className="text-[color:var(--color-accent)]">12 orders of magnitude</strong>—from
              2 to 175 billion. On a linear scale, everything except GPT-4 would be invisible!
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[color:var(--color-text-secondary)]">
              <span>10^0 (1)</span>
              <span>→</span>
              <span>10^3 (1K)</span>
              <span>→</span>
              <span>10^6 (1M)</span>
              <span>→</span>
              <span>10^9 (1B)</span>
              <span>→</span>
              <span className="text-[color:var(--color-accent)]">10^12 (1T)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-gradient-to-r from-[rgba(124,92,255,0.1)] to-[rgba(255,47,185,0.1)] border border-[rgba(124,92,255,0.3)] rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-[color:var(--color-accent)] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div className="flex-1">
            <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-2">
              The Amazing Part
            </h4>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              You just learned linear regression with <strong className="text-[color:var(--color-accent)]">2 parameters</strong>.
              ChatGPT has <strong className="text-[color:var(--color-accent)]">175 billion</strong>. But the training
              algorithm? <strong className="text-[color:var(--color-text-primary)]">Exactly the same gradient descent you learned</strong> —
              just repeated billions of times across GPUs!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
