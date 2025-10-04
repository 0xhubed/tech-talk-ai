"use client";

import { useState } from "react";

type Architecture = "linear" | "neural" | "deep" | "transformer";

export function NetworkTopologyComparison() {
  const [selected, setSelected] = useState<Architecture>("linear");

  const architectures: Record<Architecture, { name: string; description: string; color: string }> = {
    linear: {
      name: "Linear Regression",
      description: "Single input → Single weighted connection → Single output",
      color: "rgba(35,230,255,0.6)",
    },
    neural: {
      name: "Neural Network",
      description: "Input layer → Hidden layer(s) → Output layer",
      color: "rgba(124,92,255,0.6)",
    },
    deep: {
      name: "Deep Learning",
      description: "Many hidden layers stacked for hierarchical feature learning",
      color: "rgba(255,47,185,0.6)",
    },
    transformer: {
      name: "Transformer",
      description: "Self-attention mechanism + Feed-forward networks in parallel",
      color: "rgba(255,200,87,0.6)",
    },
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(architectures) as Architecture[]).map((arch) => (
          <button
            key={arch}
            type="button"
            onClick={() => setSelected(arch)}
            className={`px-4 py-2 rounded-lg border transition ${
              selected === arch
                ? `border-[${architectures[arch].color}] bg-[${architectures[arch].color.replace('0.6', '0.2')}] text-white`
                : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
            }`}
          >
            {architectures[arch].name}
          </button>
        ))}
      </div>

      {/* Visualization */}
      <div className="glass-panel p-8">
        <h4 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-4" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          {architectures[selected].name}
        </h4>
        <p className="text-sm text-[color:var(--color-text-secondary)] mb-8">
          {architectures[selected].description}
        </p>

        <div className="flex items-center justify-center min-h-[300px]">
          {selected === "linear" && <LinearDiagram />}
          {selected === "neural" && <NeuralDiagram />}
          {selected === "deep" && <DeepDiagram />}
          {selected === "transformer" && <TransformerDiagram />}
        </div>
      </div>
    </div>
  );
}

function LinearDiagram() {
  return (
    <svg width="400" height="200" viewBox="0 0 400 200">
      {/* Input node */}
      <circle cx="50" cy="100" r="30" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="3" />
      <text x="50" y="108" textAnchor="middle" fill="rgba(245,247,250,0.9)" fontSize="20" fontWeight="bold">x</text>
      <text x="50" y="150" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Input</text>

      {/* Connection with weight */}
      <line x1="80" y1="100" x2="270" y2="100" stroke="rgba(255,200,87,0.8)" strokeWidth="3" />
      <polygon points="270,100 262,96 262,104" fill="rgba(255,200,87,0.8)" />
      <rect x="150" y="80" width="60" height="30" fill="rgba(255,200,87,0.2)" stroke="rgba(255,200,87,0.6)" strokeWidth="2" rx="4" />
      <text x="180" y="100" textAnchor="middle" fill="rgba(245,247,250,0.9)" fontSize="14">w, b</text>

      {/* Output node */}
      <circle cx="320" cy="100" r="30" fill="rgba(46,213,115,0.2)" stroke="rgba(46,213,115,0.8)" strokeWidth="3" />
      <text x="320" y="108" textAnchor="middle" fill="rgba(245,247,250,0.9)" fontSize="20" fontWeight="bold">ŷ</text>
      <text x="320" y="150" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Output</text>
    </svg>
  );
}

function NeuralDiagram() {
  return (
    <svg width="500" height="280" viewBox="0 0 500 280">
      {/* Input layer */}
      <circle cx="50" cy="80" r="20" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="2" />
      <circle cx="50" cy="140" r="20" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="2" />
      <circle cx="50" cy="200" r="20" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="2" />
      <text x="50" y="250" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Input Layer</text>

      {/* Hidden layer */}
      <circle cx="250" cy="60" r="20" fill="rgba(124,92,255,0.2)" stroke="rgba(124,92,255,0.8)" strokeWidth="2" />
      <circle cx="250" cy="120" r="20" fill="rgba(124,92,255,0.2)" stroke="rgba(124,92,255,0.8)" strokeWidth="2" />
      <circle cx="250" cy="180" r="20" fill="rgba(124,92,255,0.2)" stroke="rgba(124,92,255,0.8)" strokeWidth="2" />
      <circle cx="250" cy="240" r="20" fill="rgba(124,92,255,0.2)" stroke="rgba(124,92,255,0.8)" strokeWidth="2" />
      <text x="250" y="270" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Hidden Layer</text>

      {/* Output layer */}
      <circle cx="450" cy="140" r="20" fill="rgba(46,213,115,0.2)" stroke="rgba(46,213,115,0.8)" strokeWidth="2" />
      <text x="450" y="250" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Output</text>

      {/* Connections (input to hidden) */}
      {[80, 140, 200].map((y1) =>
        [60, 120, 180, 240].map((y2, i) => (
          <line key={`i-h-${y1}-${i}`} x1="70" y1={y1} x2="230" y2={y2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        ))
      )}

      {/* Connections (hidden to output) */}
      {[60, 120, 180, 240].map((y1, i) => (
        <line key={`h-o-${i}`} x1="270" y1={y1} x2="430" y2="140" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      ))}
    </svg>
  );
}

function DeepDiagram() {
  return (
    <svg width="600" height="280" viewBox="0 0 600 280">
      {/* Input */}
      <circle cx="50" cy="110" r="18" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="2" />
      <circle cx="50" cy="160" r="18" fill="rgba(35,230,255,0.2)" stroke="rgba(35,230,255,0.8)" strokeWidth="2" />
      <text x="50" y="200" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="11">Input</text>

      {/* Hidden layer 1 */}
      {[80, 120, 160, 200].map((y, i) => (
        <circle key={`h1-${i}`} cx="170" cy={y} r="16" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.6)" strokeWidth="2" />
      ))}

      {/* Hidden layer 2 */}
      {[80, 120, 160, 200].map((y, i) => (
        <circle key={`h2-${i}`} cx="290" cy={y} r="16" fill="rgba(255,47,185,0.15)" stroke="rgba(255,47,185,0.6)" strokeWidth="2" />
      ))}

      {/* Hidden layer 3 */}
      {[80, 120, 160, 200].map((y, i) => (
        <circle key={`h3-${i}`} cx="410" cy={y} r="16" fill="rgba(255,200,87,0.15)" stroke="rgba(255,200,87,0.6)" strokeWidth="2" />
      ))}

      {/* Output */}
      <circle cx="530" cy="135" r="18" fill="rgba(46,213,115,0.2)" stroke="rgba(46,213,115,0.8)" strokeWidth="2" />
      <text x="530" y="200" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="11">Output</text>

      {/* Connections - simplified */}
      {[110, 160].map((y1) =>
        [80, 120, 160, 200].map((y2, i) => (
          <line key={`i-h1-${y1}-${i}`} x1="68" y1={y1} x2="154" y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        ))
      )}
      {[80, 120, 160, 200].map((y1, i1) =>
        [80, 120, 160, 200].map((y2, i2) => (
          <line key={`h1-h2-${i1}-${i2}`} x1="186" y1={y1} x2="274" y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))
      )}
      {[80, 120, 160, 200].map((y1, i1) =>
        [80, 120, 160, 200].map((y2, i2) => (
          <line key={`h2-h3-${i1}-${i2}`} x1="306" y1={y1} x2="394" y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))
      )}
      {[80, 120, 160, 200].map((y1, i) => (
        <line key={`h3-o-${i}`} x1="426" y1={y1} x2="512" y2="135" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      ))}

      <text x="300" y="250" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="11">Multiple Hidden Layers (Deep)</text>
    </svg>
  );
}

function TransformerDiagram() {
  return (
    <svg width="500" height="320" viewBox="0 0 500 320">
      {/* Input sequence */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`input-${i}`}
          x={50 + i * 60}
          y="40"
          width="50"
          height="50"
          fill="rgba(35,230,255,0.2)"
          stroke="rgba(35,230,255,0.8)"
          strokeWidth="2"
          rx="4"
        />
      ))}
      <text x="150" y="110" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="12">Input Sequence</text>

      {/* Attention layer */}
      <rect x="80" y="140" width="220" height="60" fill="rgba(255,200,87,0.15)" stroke="rgba(255,200,87,0.6)" strokeWidth="2" rx="8" />
      <text x="190" y="165" textAnchor="middle" fill="rgba(245,247,250,0.9)" fontSize="14" fontWeight="bold">Self-Attention</text>
      <text x="190" y="185" textAnchor="middle" fill="rgba(245,247,250,0.6)" fontSize="11">Each token attends to all others</text>

      {/* Feed Forward */}
      <rect x="80" y="220" width="220" height="40" fill="rgba(124,92,255,0.15)" stroke="rgba(124,92,255,0.6)" strokeWidth="2" rx="8" />
      <text x="190" y="245" textAnchor="middle" fill="rgba(245,247,250,0.9)" fontSize="14" fontWeight="bold">Feed Forward</text>

      {/* Output */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={`output-${i}`}
          x={50 + i * 60}
          y="280"
          width="50"
          height="40"
          fill="rgba(46,213,115,0.2)"
          stroke="rgba(46,213,115,0.8)"
          strokeWidth="2"
          rx="4"
        />
      ))}

      {/* Arrows */}
      <polygon points="190,95 185,105 195,105" fill="rgba(245,247,250,0.5)" />
      <line x1="190" y1="105" x2="190" y2="140" stroke="rgba(245,247,250,0.5)" strokeWidth="2" />

      <polygon points="190,205 185,215 195,215" fill="rgba(245,247,250,0.5)" />
      <line x1="190" y1="200" x2="190" y2="220" stroke="rgba(245,247,250,0.5)" strokeWidth="2" />

      <polygon points="190,265 185,275 195,275" fill="rgba(245,247,250,0.5)" />
      <line x1="190" y1="260" x2="190" y2="280" stroke="rgba(245,247,250,0.5)" strokeWidth="2" />

      {/* Attention connections (示意) */}
      <path d="M 75,70 Q 40,110 75,140" stroke="rgba(255,200,87,0.4)" strokeWidth="2" fill="none" strokeDasharray="4" />
      <path d="M 295,70 Q 330,110 295,140" stroke="rgba(255,200,87,0.4)" strokeWidth="2" fill="none" strokeDasharray="4" />
    </svg>
  );
}
