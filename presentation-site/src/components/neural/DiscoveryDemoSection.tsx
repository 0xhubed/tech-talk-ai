"use client";

export function DiscoveryDemoSection() {
  return (
    <section id="discovery" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left: Introduction */}
          <div className="flex flex-col justify-center gap-6">
            <span className="badge w-fit">Opening Demo</span>
            <h2 className="section-heading">
              Can AI Discover Mathematical Laws?
            </h2>
            <p className="section-body">
              Before diving into neural networks, witness autonomous AI discovery in action. Watch an AI agent
              rediscover the compound interest law from noisy data—without being told what it's looking for.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="text-[color:var(--color-accent)] font-bold">•</div>
                <div>
                  <h4 className="font-semibold text-[color:var(--color-text-primary)]">No Prior Knowledge</h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    The AI isn't told it's compound interest or given any financial formulas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-[color:var(--color-accent)] font-bold">•</div>
                <div>
                  <h4 className="font-semibold text-[color:var(--color-text-primary)]">Noisy Data</h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    Real-world measurements with 15% error - yet the AI finds the underlying law
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-[color:var(--color-accent)] font-bold">•</div>
                <div>
                  <h4 className="font-semibold text-[color:var(--color-text-primary)]">Iterative Reasoning</h4>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    Proposes hypotheses, evaluates them, and improves - mimicking scientific discovery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Demo Card */}
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h3
                  className="text-xl font-semibold text-[color:var(--color-text-primary)] mb-2"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Autonomous Discovery Demo
                </h3>
                <p className="text-sm text-[color:var(--color-text-secondary)] mb-6">
                  Einstein called compound interest the "8th wonder of the world." Can AI rediscover it?
                </p>
              </div>

              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[color:var(--color-text-secondary)]">Challenge:</span>
                  <span className="text-[color:var(--color-text-primary)] font-mono">A = f(t, P, r)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[color:var(--color-text-secondary)]">Data Points:</span>
                  <span className="text-[color:var(--color-accent)]">20 measurements</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[color:var(--color-text-secondary)]">Noise Level:</span>
                  <span className="text-[color:var(--color-attention)]">15% error</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[color:var(--color-text-secondary)]">AI Provider:</span>
                  <span className="text-[color:var(--color-text-primary)]">OpenAI / Claude / Ollama</span>
                </div>
              </div>

              <button
                type="button"
                className="button-primary w-full"
                onClick={() => {
                  const jupyterUrl = `http://localhost:8888/lab/tree/maschine%20learning%20foundations%20content/0_discovery_compound_interest.ipynb`;
                  window.open(jupyterUrl, "_blank");
                }}
              >
                Launch Discovery Demo
              </button>

              <p className="text-xs text-center text-[color:var(--color-text-secondary)]">
                Opens in Jupyter Lab (requires local Jupyter server)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
