"use client";

import { useState, useMemo } from "react";
import { InlineMath } from "react-katex";

export function DerivativeExplorer1D() {
  const [xPoint, setXPoint] = useState(-1.5);
  const [showSteps, setShowSteps] = useState(false);
  const [learningRate, setLearningRate] = useState(0.3);

  // Function: f(x) = x²
  const f = (x: number) => x * x;
  const derivative = (x: number) => 2 * x;

  const currentY = f(xPoint);
  const currentSlope = derivative(xPoint);

  // Generate curve points
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let x = -3; x <= 3; x += 0.1) {
      points.push({ x, y: f(x) });
    }
    return points;
  }, []);

  // Generate tangent line points
  const tangentPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const xStart = xPoint - 1.5;
    const xEnd = xPoint + 1.5;
    for (let x = xStart; x <= xEnd; x += 0.1) {
      const y = currentY + currentSlope * (x - xPoint);
      if (y >= 0 && y <= 10) {
        points.push({ x, y });
      }
    }
    return points;
  }, [xPoint, currentY, currentSlope]);

  // Calculate next step for gradient descent
  const nextX = xPoint - learningRate * currentSlope;
  const nextY = f(nextX);

  // SVG coordinate system (map from data space to SVG space)
  const mapX = (x: number) => ((x + 3) / 6) * 500 + 50;
  const mapY = (y: number) => 450 - (y / 10) * 400;

  const takeStep = () => {
    setXPoint(nextX);
  };

  const reset = () => {
    setXPoint(-1.5);
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-2">
          1D Derivative Explorer: Understanding Slope
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Drag the point along the curve to see how the derivative (slope) changes. This is the
          foundation of gradient descent.
        </p>
      </div>

      {/* SVG Visualization */}
      <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4 border border-[rgba(255,255,255,0.1)]">
        <svg viewBox="0 0 600 500" className="w-full" style={{ maxHeight: "400px" }}>
          <defs>
            <linearGradient id="curve-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,47,185,0.8)" />
              <stop offset="50%" stopColor="rgba(124,92,255,0.8)" />
              <stop offset="100%" stopColor="rgba(35,230,255,0.8)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[-2, -1, 0, 1, 2].map((x) => (
            <line
              key={`vline-${x}`}
              x1={mapX(x)}
              y1={mapY(0)}
              x2={mapX(x)}
              y2={mapY(10)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}
          {[0, 2, 4, 6, 8].map((y) => (
            <line
              key={`hline-${y}`}
              x1={mapX(-3)}
              y1={mapY(y)}
              x2={mapX(3)}
              y2={mapY(y)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line
            x1={mapX(-3)}
            y1={mapY(0)}
            x2={mapX(3)}
            y2={mapY(0)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <line
            x1={mapX(0)}
            y1={mapY(0)}
            x2={mapX(0)}
            y2={mapY(10)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text x={mapX(3) + 10} y={mapY(0) + 5} fontSize="14" fill="rgba(255,255,255,0.6)">
            x
          </text>
          <text x={mapX(0) - 25} y={mapY(10) - 10} fontSize="14" fill="rgba(255,255,255,0.6)">
            f(x)
          </text>

          {/* Tick marks and labels */}
          {[-2, -1, 1, 2].map((x) => (
            <g key={`tick-${x}`}>
              <line
                x1={mapX(x)}
                y1={mapY(0) - 5}
                x2={mapX(x)}
                y2={mapY(0) + 5}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <text
                x={mapX(x)}
                y={mapY(0) + 20}
                fontSize="12"
                fill="rgba(255,255,255,0.5)"
                textAnchor="middle"
              >
                {x}
              </text>
            </g>
          ))}

          {/* Curve f(x) = x² */}
          <path
            d={`M ${curvePoints.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(" L ")}`}
            fill="none"
            stroke="url(#curve-gradient)"
            strokeWidth="3"
          />

          {/* Tangent line */}
          {tangentPoints.length > 0 && (
            <path
              d={`M ${tangentPoints.map((p) => `${mapX(p.x)},${mapY(p.y)}`).join(" L ")}`}
              fill="none"
              stroke="rgba(35,230,255,0.9)"
              strokeWidth="2"
              strokeDasharray="6 3"
            />
          )}

          {/* Next step indicator (if gradient descent) */}
          {showSteps && Math.abs(currentSlope) > 0.01 && (
            <>
              <circle cx={mapX(nextX)} cy={mapY(nextY)} r="6" fill="rgba(34,197,94,0.5)" />
              <line
                x1={mapX(xPoint)}
                y1={mapY(currentY)}
                x2={mapX(nextX)}
                y2={mapY(nextY)}
                stroke="rgba(34,197,94,0.8)"
                strokeWidth="2"
                strokeDasharray="4 2"
                markerEnd="url(#arrowhead)"
              />
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="rgba(34,197,94,0.8)" />
                </marker>
              </defs>
            </>
          )}

          {/* Current point (draggable) */}
          <circle
            cx={mapX(xPoint)}
            cy={mapY(currentY)}
            r="10"
            fill="rgba(255,200,87,1)"
            stroke="white"
            strokeWidth="2"
            style={{ cursor: "grab" }}
            onMouseDown={(e) => {
              const svg = e.currentTarget.ownerSVGElement;
              if (!svg) return;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const rect = svg.getBoundingClientRect();
                const svgX = moveEvent.clientX - rect.left;
                const dataX = ((svgX - 50) / 500) * 6 - 3;
                const clampedX = Math.max(-3, Math.min(3, dataX));
                setXPoint(clampedX);
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          />

          {/* Labels */}
          <text
            x={mapX(xPoint)}
            y={mapY(currentY) - 20}
            fontSize="12"
            fill="rgba(255,200,87,1)"
            textAnchor="middle"
            fontWeight="bold"
          >
            ({xPoint.toFixed(2)}, {currentY.toFixed(2)})
          </text>

          {/* Slope indicator */}
          {tangentPoints.length > 0 && (
            <text
              x={mapX(xPoint + 1)}
              y={mapY(currentY + currentSlope * 1) - 10}
              fontSize="11"
              fill="rgba(35,230,255,1)"
              fontWeight="bold"
            >
              slope = {currentSlope.toFixed(2)}
            </text>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current state display */}
        <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
            Current State
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[color:var(--color-text-secondary)]">Position x:</span>
              <span className="font-mono text-[rgba(255,200,87,1)] font-bold">
                {xPoint.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[color:var(--color-text-secondary)]">
                Value f(x) = x²:
              </span>
              <span className="font-mono text-[color:var(--color-text-primary)]">
                {currentY.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.1)] pt-2">
              <span className="text-[color:var(--color-text-secondary)]">
                Derivative f&apos;(x) = 2x:
              </span>
              <span className="font-mono text-[rgba(35,230,255,1)] font-bold">
                {currentSlope.toFixed(3)}
              </span>
            </div>
            <div className="mt-3 p-2 bg-[rgba(12,18,26,0.4)] rounded">
              <p className="text-xs text-[color:var(--color-text-secondary)]">
                {currentSlope > 0.01
                  ? "Positive slope → Function increasing → Go left to decrease"
                  : currentSlope < -0.01
                    ? "Negative slope → Function decreasing → Go right to decrease"
                    : "Zero slope → At minimum!"}
              </p>
            </div>
          </div>
        </div>

        {/* Gradient descent simulator */}
        <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
            Gradient Descent Step
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[color:var(--color-text-secondary)] mb-1 block">
                Learning Rate α: {learningRate.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(34,197,94,1)]"
              />
            </div>

            <div className="text-sm space-y-1">
              <div className="font-mono text-xs bg-[rgba(12,18,26,0.4)] p-2 rounded">
                <InlineMath math={`x_{new} = x - \\alpha \\cdot f'(x)`} />
              </div>
              <div className="font-mono text-xs bg-[rgba(12,18,26,0.4)] p-2 rounded">
                <InlineMath
                  math={`x_{new} = ${xPoint.toFixed(2)} - ${learningRate.toFixed(2)} \\cdot ${currentSlope.toFixed(2)} = ${nextX.toFixed(2)}`}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowSteps(true);
                  takeStep();
                }}
                disabled={Math.abs(currentSlope) < 0.01}
                className="flex-1 px-4 py-2 bg-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.3)] border border-[rgba(34,197,94,0.5)] rounded-lg text-sm font-medium text-[color:var(--color-text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Take One Step
              </button>
              <button
                onClick={reset}
                className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm font-medium text-[color:var(--color-text-secondary)] transition-colors"
              >
                Reset
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="w-4 h-4 accent-[rgba(34,197,94,1)]"
              />
              <span className="text-[color:var(--color-text-secondary)]">
                Show next step preview
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Key insight */}
      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
          Key Insight: Derivative = Direction to Move
        </h4>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          The derivative tells us the slope. Since we want to go <strong>downhill</strong> (minimize
          f(x)), we move in the <strong>opposite direction</strong> of the derivative. That&apos;s
          why the update rule has a minus sign: x ← x - α·f&apos;(x). Try different learning rates
          to see how step size affects convergence!
        </p>
      </div>
    </div>
  );
}
