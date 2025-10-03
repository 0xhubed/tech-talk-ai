"use client";

export function ArchitectureRoadmap() {
  const architectures = [
    {
      id: 1,
      name: "Linear Regression",
      description: "Single layer, linear relationships",
      formula: "f(x) = wx + b",
      params: "2 parameters",
      color: "rgba(35,230,255,0.2)",
      borderColor: "rgba(35,230,255,0.6)",
      status: "✓ Completed",
    },
    {
      id: 2,
      name: "Neural Network",
      description: "Multiple layers with activation functions",
      formula: "Non-linear patterns",
      params: "~100-1K parameters",
      color: "rgba(124,92,255,0.2)",
      borderColor: "rgba(124,92,255,0.6)",
      status: "Available in notebooks",
    },
    {
      id: 3,
      name: "Deep Learning",
      description: "Many hidden layers, complex features",
      formula: "Image & speech recognition",
      params: "~1M-100M parameters",
      color: "rgba(255,47,185,0.2)",
      borderColor: "rgba(255,47,185,0.6)",
      status: "Next chapter",
    },
    {
      id: 4,
      name: "Transformers",
      description: "Self-attention mechanism, parallel processing",
      formula: "Sequence-to-sequence tasks",
      params: "~100M-1B parameters",
      color: "rgba(255,200,87,0.2)",
      borderColor: "rgba(255,200,87,0.6)",
      status: "Preview available",
    },
    {
      id: 5,
      name: "Modern LLMs",
      description: "GPT-4, Claude - massive scale transformers",
      formula: "General intelligence",
      params: "~1B-100B+ parameters",
      color: "rgba(46,213,115,0.2)",
      borderColor: "rgba(46,213,115,0.6)",
      status: "Industry standard",
    },
  ];

  return (
    <section id="architecture-roadmap" className="section-boundary">
      <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="badge">The Journey Ahead</span>
          <h2 className="section-heading mt-4">
            From Linear to Large Language Models
          </h2>
          <p className="section-body max-w-3xl mx-auto">
            You've mastered linear regression - the foundation of all machine learning.
            Here's the path from simple lines to ChatGPT and Claude.
          </p>
        </div>

        {/* Architecture Cards */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[rgba(35,230,255,0.4)] via-[rgba(124,92,255,0.4)] to-[rgba(46,213,115,0.4)] hidden md:block" />

          <div className="space-y-6">
            {architectures.map((arch, idx) => (
              <div key={arch.id} className="relative">
                {/* Step Number Circle */}
                <div className="absolute left-0 top-6 w-16 h-16 rounded-full border-4 border-[color:var(--color-bg-primary)] bg-gradient-to-br from-[rgba(35,230,255,0.3)] to-[rgba(124,92,255,0.3)] flex items-center justify-center font-bold text-xl text-white hidden md:flex" style={{ borderColor: arch.borderColor }}>
                  {arch.id}
                </div>

                {/* Card */}
                <div className="md:ml-24 glass-panel p-6 hover:border-[rgba(255,255,255,0.3)] transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          {arch.name}
                        </h3>
                        <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-secondary)] bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded">
                          {arch.status}
                        </span>
                      </div>
                      <p className="text-[color:var(--color-text-secondary)] mb-2">
                        {arch.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1">
                          <span className="text-[color:var(--color-text-secondary)]">Use case: </span>
                          <span className="text-[color:var(--color-text-primary)]">{arch.formula}</span>
                        </div>
                        <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded px-3 py-1">
                          <span className="text-[color:var(--color-text-secondary)]">Scale: </span>
                          <span className="text-[color:var(--color-accent)]">{arch.params}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {arch.id === 1 && (
                      <div className="flex items-center gap-2 text-[rgba(46,213,115,1)]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold">Mastered</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insight */}
        <div className="mt-8 bg-gradient-to-r from-[rgba(35,230,255,0.08)] to-[rgba(124,92,255,0.08)] border border-[rgba(124,92,255,0.3)] rounded-lg p-6">
          <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[color:var(--color-accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Key Insight
          </h4>
          <p className="text-[color:var(--color-text-secondary)]">
            <strong className="text-[color:var(--color-text-primary)]">Every architecture builds on the same foundation:</strong>{" "}
            parameters (w, b), cost functions, and gradient descent. What you learned with linear regression scales
            to billions of parameters in GPT-4 - the math is the same, just repeated millions of times.
          </p>
        </div>
      </div>
    </section>
  );
}
