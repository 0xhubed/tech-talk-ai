"use client";

import { ParameterScaleVisualizer } from "./ParameterScaleVisualizer";
import { NetworkTopologyComparison } from "./NetworkTopologyComparison";

export function ArchitectureEvolution() {
  return (
    <section id="architecture-evolution" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="badge mx-auto">The Evolution</span>
          <h2 className="section-heading mt-4">
            From Linear to Large Language Models
          </h2>
          <p className="section-body mx-auto max-w-3xl">
            You've mastered the foundations. Now see how the same principles—parameters, cost functions, gradient descent—
            scale from 2 parameters to 175 billion in ChatGPT.
          </p>
        </div>

        {/* Parameter Scale Visualization */}
        <div className="mb-16">
          <ParameterScaleVisualizer />
        </div>

        {/* Network Topology Comparison */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-6 text-center" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Architecture Structures
          </h3>
          <NetworkTopologyComparison />
        </div>

        {/* Capability Matrix */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-6 text-center" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            What Each Architecture Can Do
          </h3>

          <div className="glass-panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)]">
                  <th className="text-left p-4 font-semibold text-[color:var(--color-text-primary)]">Architecture</th>
                  <th className="text-center p-4 font-semibold text-[color:var(--color-text-primary)]">Linear Patterns</th>
                  <th className="text-center p-4 font-semibold text-[color:var(--color-text-primary)]">Non-linear</th>
                  <th className="text-center p-4 font-semibold text-[color:var(--color-text-primary)]">Images</th>
                  <th className="text-center p-4 font-semibold text-[color:var(--color-text-primary)]">Sequences</th>
                  <th className="text-center p-4 font-semibold text-[color:var(--color-text-primary)]">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="p-4 text-[color:var(--color-text-primary)]">Linear Regression</td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="p-4 text-[color:var(--color-text-primary)]">Neural Network</td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,200,87,0.6)]">Basic</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="p-4 text-[color:var(--color-text-primary)]">Deep Learning</td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,200,87,0.6)]">Basic</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,47,185,0.4)]">✗</span></td>
                </tr>
                <tr className="border-b border-[rgba(255,255,255,0.05)]">
                  <td className="p-4 text-[color:var(--color-text-primary)]">Transformer</td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(255,200,87,0.6)]">Basic</span></td>
                </tr>
                <tr>
                  <td className="p-4 text-[color:var(--color-text-primary)]">Modern LLM</td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                  <td className="text-center p-4"><span className="text-[rgba(46,213,115,1)]">✓</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Transformer Deep Dive */}
        <div className="mb-16 glass-panel p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                The Breakthrough: Transformers
              </h3>

              <p className="text-[color:var(--color-text-secondary)]">
                The transformer architecture (2017) revolutionized AI with{" "}
                <strong className="text-[color:var(--color-accent)]">attention</strong> - letting the model decide which
                parts of the input matter most.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Self-Attention</h4>
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
                      Unlike RNNs, processes entire sequences at once—enables massive scale
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-[color:var(--color-accent)] font-bold">•</div>
                  <div>
                    <h4 className="font-semibold text-[color:var(--color-text-primary)]">Scaling Laws</h4>
                    <p className="text-sm text-[color:var(--color-text-secondary)]">
                      Performance improves predictably with more parameters and data
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <div className="text-sm font-mono text-[color:var(--color-text-secondary)] space-y-1">
                  <div className="text-[color:var(--color-accent)]">Evolution Timeline:</div>
                  <div>2017: Attention is All You Need (Original paper)</div>
                  <div>2018: BERT - Bidirectional understanding</div>
                  <div>2019: GPT-2 - 1.5B params, text generation</div>
                  <div>2020: GPT-3 - 175B params, few-shot learning</div>
                  <div>2023: GPT-4 - Multimodal reasoning</div>
                  <div className="text-[color:var(--color-highlight)]">2024: Claude, Gemini - Long context</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="glass-panel p-6 bg-gradient-to-br from-[rgba(35,230,255,0.05)] to-[rgba(255,47,185,0.05)]">
                <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-3" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                  In the Transformer Notebook
                </h4>
                <ul className="space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>How attention mechanisms work mathematically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Multi-head attention & positional encoding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="text-[color:var(--color-accent)] font-bold">•</div>
                    <span>Complete transformer architecture</span>
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
                  const jupyterUrl = `http://localhost:8888/notebooks/maschine%20learning%20foundations%20content/5_transformers.ipynb`;
                  window.open(jupyterUrl, "_blank");
                }}
              >
                Explore Transformers Notebook
              </button>

              <p className="text-xs text-center text-[color:var(--color-text-secondary)]">
                Complete outline of transformer architecture
              </p>
            </div>
          </div>
        </div>

        {/* Your Learning Journey */}
        <div className="bg-gradient-to-r from-[rgba(35,230,255,0.1)] to-[rgba(255,47,185,0.1)] border border-[rgba(255,255,255,0.15)] rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-[color:var(--color-text-primary)] mb-6" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Your Complete Learning Path
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              ✓ Linear Regression
            </div>
            <span className="text-[color:var(--color-text-secondary)]">→</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              ✓ Cost Functions
            </div>
            <span className="text-[color:var(--color-text-secondary)]">→</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(35,230,255,0.3)]">
              ✓ Gradient Descent
            </div>
            <span className="text-[color:var(--color-text-secondary)]">→</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(124,92,255,0.4)]">
              📚 Neural Networks
            </div>
            <span className="text-[color:var(--color-text-secondary)]">→</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(255,200,87,0.4)]">
              📚 Transformers
            </div>
            <span className="text-[color:var(--color-text-secondary)]">→</span>
            <div className="px-4 py-2 bg-[rgba(12,18,26,0.8)] rounded-lg border border-[rgba(46,213,115,0.4)] font-bold">
              🤖 Modern AI
            </div>
          </div>
          <p className="text-center text-[color:var(--color-text-secondary)] mt-6">
            You now understand the complete path from simple linear models to ChatGPT and Claude!
          </p>
        </div>
      </div>
    </section>
  );
}
