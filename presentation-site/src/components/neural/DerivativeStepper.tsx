"use client";

import { useState } from "react";
import { MathCopyBlock } from "@/components/ui/MathCopyBlock";

export type DerivativeStepperProps = {
  anchorId?: string;
};

type Step = {
  id: string;
  label: string;
  formula: string;
  explanation: string;
};

const steps: Step[] = [
  {
    id: "loss",
    label: "1. Define loss",
    formula: "\\mathcal{L}(\\hat{y}, y) = \\frac{1}{N} \\sum_{i=1}^{N} (\\hat{y}_i - y_i)^2",
    explanation: "Start with mean squared error so the audience sees the squared residuals you will optimise later.",
  },
  {
    id: "chain",
    label: "2. Apply chain rule",
    formula: "\\frac{\\partial \\mathcal{L}}{\\partial w_j} = \\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} \\cdot \\frac{\\partial \\hat{y}}{\\partial z} \\cdot \\frac{\\partial z}{\\partial w_j}",
    explanation: "Split the derivative into intelligible pieces — loss wrt prediction, prediction wrt activation, activation wrt weight.",
  },
  {
    id: "gradient",
    label: "3. Assemble gradient",
    formula: "\\frac{\\partial \\mathcal{L}}{\\partial w_j} = \\frac{2}{N} \\sum_{i=1}^{N} (\\hat{y}_i - y_i) \\cdot x_{ij}",
    explanation: "Show the final expression that powers gradient descent and link it to the surface visual you will demo next.",
  },
];

export function DerivativeStepper({ anchorId }: DerivativeStepperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = steps[activeIndex] ?? steps[0];

  const goPrevious = () => setActiveIndex((index) => Math.max(0, index - 1));
  const goNext = () => setActiveIndex((index) => Math.min(steps.length - 1, index + 1));

  return (
    <section id={anchorId} className="section-boundary">
      <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-10 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-8">
        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">Derivative walkthrough</span>
          <h2 className="section-heading text-balance text-[clamp(2rem,4vw,2.6rem)]">
            Break the gradient descent calculus into three digestible beats.
          </h2>
          <p className="section-body text-balance">
            Use the buttons to narrate each component of the derivative. The corresponding formula appears in a copyable
            KaTeX block so you can paste it directly into the notebook or respond to audience questions.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-[color:var(--color-text-secondary)]">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`rounded-full border px-3 py-1 transition ${
                  index === activeIndex
                    ? "border-[rgba(255,47,185,0.6)] bg-[rgba(255,47,185,0.14)] text-[color:var(--color-text-primary)]"
                    : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.28)]"
                }`}
                onClick={() => setActiveIndex(index)}
              >
                {step.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-[color:var(--color-text-secondary)]">{activeStep.explanation}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="button-secondary"
              onClick={goPrevious}
              disabled={activeIndex === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={goNext}
              disabled={activeIndex === steps.length - 1}
            >
              Next
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <MathCopyBlock expression={activeStep.formula} />
        </div>
      </div>
    </section>
  );
}
