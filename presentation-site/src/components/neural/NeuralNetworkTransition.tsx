"use client";

export function NeuralNetworkTransition() {
  return (
    <section id="nn-transition" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <div className="glass-panel p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {/* Left: The Problem */}
            <div className="flex flex-col gap-6">
              <span className="badge w-fit bg-[rgba(255,47,185,0.16)] border-[rgba(255,47,185,0.35)]">
                The Limitation
              </span>
              <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                When Linear Models Fail
              </h2>
              <p className="text-[color:var(--color-text-secondary)]">
                Our linear regression model <code className="math-inline">f(x) = wx + b</code> can only fit straight lines.
                But what if the relationship between features and targets isn't linear?
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-[color:var(--color-highlight)] text-xl">✗</span>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Limited Expressiveness</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Can only model linear relationships - fails on curves, waves, complex patterns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[color:var(--color-highlight)] text-xl">✗</span>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Poor Generalization</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      High error on non-linear data regardless of training time
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[color:var(--color-highlight)] text-xl">✗</span>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Real-World Data</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Most phenomena (images, speech, text) have complex, non-linear structures
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: The Solution */}
            <div className="flex flex-col gap-6">
              <span className="badge w-fit bg-[rgba(35,230,255,0.16)] border-[rgba(35,230,255,0.35)]">
                The Solution
              </span>
              <h2 className="text-2xl font-bold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Neural Networks: Add Non-Linearity
              </h2>
              <p className="text-[color:var(--color-text-secondary)]">
                Neural networks introduce <strong>activation functions</strong> that transform linear combinations
                into complex, non-linear patterns - enabling them to learn anything!
              </p>

              <div className="bg-[rgba(12,18,26,0.8)] border border-[rgba(35,230,255,0.2)] rounded-lg p-4 space-y-3">
                <div className="font-mono text-sm text-[color:var(--color-accent)]">
                  Neural Network Architecture:
                </div>
                <div className="space-y-1 text-sm text-[color:var(--color-text-secondary)] font-mono">
                  <div>Input  → [Linear] → [ReLU] →</div>
                  <div className="pl-16">  [Linear] → [ReLU] →</div>
                  <div className="pl-32">    [Linear] → Output</div>
                </div>
                <div className="text-xs text-[color:var(--color-text-secondary)] pt-2 border-t border-[rgba(255,255,255,0.1)]">
                  Each layer: <code>z = Wx + b</code>, then <code>a = ReLU(z)</code>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Universal Approximation</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Can approximate any continuous function given enough neurons
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Learned Representations</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Automatically discovers features from raw data
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Scales to Deep Learning</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Stack hundreds of layers for modern AI systems
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="button-primary w-full"
                onClick={() => {
                  const jupyterUrl = `http://localhost:8888/lab/tree/maschine%20learning%20foundations%20content/4_Neuronal_Networks.ipynb`;
                  window.open(jupyterUrl, "_blank");
                }}
              >
                Build Neural Network from Scratch
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
