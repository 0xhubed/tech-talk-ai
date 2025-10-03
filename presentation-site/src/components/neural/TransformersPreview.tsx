"use client";

export function TransformersPreview() {
  return (
    <section id="transformers-preview" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="badge mx-auto">Coming Next</span>
          <h2 className="section-heading mt-4">
            From Neural Networks to Modern AI
          </h2>
          <p className="section-body mx-auto max-w-3xl">
            You've learned the foundations. Now see how these ideas scale to power ChatGPT, Claude, and the AI revolution.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Neural Networks */}
          <div className="glass-panel p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Neural Networks
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] flex-1">
              2-layer networks with ReLU activation. ~10K parameters. Learns non-linear patterns.
            </p>
            <div className="text-xs text-[color:var(--color-accent)] font-mono">
              Current section
            </div>
          </div>

          {/* Card 2: Deep Learning */}
          <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(35,230,255,0.05)] to-transparent pointer-events-none" />
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Deep Learning
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] flex-1 relative z-10">
              100+ layers, convolutional networks. ~100M parameters. Image recognition, ResNet, VGG.
            </p>
            <div className="text-xs text-[color:var(--color-text-secondary)] font-mono relative z-10">
              Scale up layers
            </div>
          </div>

          {/* Card 3: Transformers */}
          <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,47,185,0.08)] to-transparent pointer-events-none" />
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Transformers
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] flex-1 relative z-10">
              Attention mechanism, parallel processing. ~1B parameters. BERT, GPT-2, understanding context.
            </p>
            <div className="text-xs text-[color:var(--color-text-secondary)] font-mono relative z-10">
              Add attention
            </div>
          </div>

          {/* Card 4: Large Language Models */}
          <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,200,87,0.08)] to-transparent pointer-events-none" />
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] relative z-10" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              Modern LLMs
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] flex-1 relative z-10">
              Massive scale, RLHF training. ~175B+ parameters. GPT-4, Claude, reasoning and generation.
            </p>
            <div className="text-xs text-[color:var(--color-attention)] font-mono relative z-10">
              = ChatGPT
            </div>
          </div>
        </div>

        {/* Transformer Deep Dive */}
        <div className="mt-12 glass-panel p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                Transformers: The Architecture Behind ChatGPT
              </h3>

              <p className="text-[color:var(--color-text-secondary)]">
                The transformer architecture (2017) revolutionized AI with a simple but powerful idea:
                <strong className="text-[color:var(--color-accent)]"> attention</strong> - letting the model decide which parts of the input are important.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Self-Attention Mechanism</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Each word "attends" to every other word to understand context
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Parallel Processing</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Unlike RNNs, processes entire sequences at once - enables massive scale
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Transfer Learning</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Pre-train on massive text, fine-tune for specific tasks
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <div className="text-sm font-mono text-[color:var(--color-text-secondary)] space-y-1">
                  <div className="text-[color:var(--color-accent)]">Transformer Evolution:</div>
                  <div>2017: Attention is All You Need (Original paper)</div>
                  <div>2018: BERT - Bidirectional understanding</div>
                  <div>2019: GPT-2 - 1.5B parameters, text generation</div>
                  <div>2020: GPT-3 - 175B parameters, few-shot learning</div>
                  <div>2023: GPT-4 - Multimodal, reasoning, ~1.7T params</div>
                  <div className="text-[color:var(--color-highlight)]">2024: Claude, Gemini - Long context, advanced reasoning</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="glass-panel p-6 bg-gradient-to-br from-[rgba(35,230,255,0.05)] to-[rgba(255,47,185,0.05)]">
                <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  What You'll Learn
                </h4>
                <ul className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>How attention mechanisms work mathematically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Multi-head attention and positional encoding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Complete transformer architecture from scratch</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Training strategies and scaling laws</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Build a mini-GPT character-level model</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                className="button-primary w-full"
                onClick={() => {
                  const jupyterUrl = `http://localhost:8888/lab/tree/maschine%20learning%20foundations%20content/5_transformers.ipynb`;
                  window.open(jupyterUrl, "_blank");
                }}
              >
                Explore Transformers (Outline)
              </button>

              <p className="text-xs text-center text-[color:var(--color-text-secondary)]">
                Comprehensive outline - explore the architecture behind ChatGPT and Claude
              </p>
            </div>
          </div>
        </div>

        {/* Journey Summary */}
        <div className="mt-12 bg-gradient-to-r from-[rgba(35,230,255,0.1)] to-[rgba(255,47,185,0.1)] border border-[rgba(255,255,255,0.15)] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-[color:var(--color-text-primary)] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Your Learning Journey
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              Linear Regression
            </div>
            <span className="text-[color:var(--color-text-secondary)]">&rarr;</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              Cost Functions
            </div>
            <span className="text-[color:var(--color-text-secondary)]">&rarr;</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              Gradient Descent
            </div>
            <span className="text-[color:var(--color-text-secondary)]">&rarr;</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(255,47,185,0.3)]">
              Neural Networks
            </div>
            <span className="text-[color:var(--color-text-secondary)]">&rarr;</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(255,200,87,0.3)]">
              Transformers
            </div>
            <span className="text-[color:var(--color-text-secondary)]">&rarr;</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(255,200,87,0.4)] font-bold">
              ChatGPT / Claude
            </div>
          </div>
          <p className="text-center text-[color:var(--color-text-secondary)] mt-6">
            You now understand the complete path from simple linear models to modern AI systems!
          </p>
        </div>
      </div>
    </section>
  );
}
