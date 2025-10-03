import type { NeuralHighlight } from "@/lib/sections";
import { NotebookLaunch } from "@/components/notebooks/NotebookLaunch";

export type NeuralHighlightGridProps = {
  items: NeuralHighlight[];
};

export function NeuralHighlightGrid({ items }: NeuralHighlightGridProps) {
  return (
    <section id="neural" className="section-boundary">
      <div className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-12 px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <p className="section-title">Chapter 2 - Neural Networks</p>
          <h2 className="section-heading">
            From architecture intuition to housing price deployment.
          </h2>
          <p className="section-body">
            Each module links directly to the interactive panels and notebooks, making it easy to follow the demo live and
            revisit the same material later without hunting for context.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="glass-panel relative h-full overflow-hidden p-7">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "conic-gradient(from 90deg at 50% 50%, rgba(35,230,255,0.35), rgba(255,47,185,0.35))",
                }}
              />
              <div className="relative">
                <h3
                  className="text-xl text-[color:var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="caption">
          What to look for: Encourage the audience to compare CPU vs GPU timings and observe how normalization shifts the
          training stability.
        </p>
        <NotebookLaunch
          topic="neural"
          eyebrow="Hands-on Deep Dive"
          title="Open the Gradient Descent Notebooks"
          description="Launch interactive labs that mirror the stage demos with Plotly 3D surfaces, slider-driven gradients, multi-run overlays, and quick exports for after-session study."
        />
      </div>
    </section>
  );
}
