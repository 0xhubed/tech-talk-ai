"use client";

import { useState } from "react";
import { InlineMath, BlockMath } from "react-katex";

export function PartialDerivativeBreakdown() {
  const [wVal, setWVal] = useState(2);
  const [bVal, setBVal] = useState(1);

  // Function: J(w,b) = w² + 0.5b²
  const J = (w: number, b: number) => w * w + 0.5 * b * b;
  const partialW = (w: number) => 2 * w;
  const partialB = (b: number) => b;

  const currentCost = J(wVal, bVal);
  const gradW = partialW(wVal);
  const gradB = partialB(bVal);
  const gradientMagnitude = Math.sqrt(gradW * gradW + gradB * gradB);

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[color:var(--color-text-primary)] mb-2">
          Partial Derivatives: Breaking Down the Gradient
        </h3>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          In multidimensional functions, the gradient is a vector of partial derivatives. Each
          component tells us how the function changes in one direction.
        </p>
      </div>

      {/* Interactive point selector */}
      <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          Choose a Point
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-[color:var(--color-text-secondary)]">w (weight):</label>
              <span className="text-sm font-mono text-[color:var(--color-text-primary)]">
                {wVal.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.5"
              value={wVal}
              onChange={(e) => setWVal(parseFloat(e.target.value))}
              className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-[color:var(--color-text-secondary)]">b (bias):</label>
              <span className="text-sm font-mono text-[color:var(--color-text-primary)]">
                {bVal.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.5"
              value={bVal}
              onChange={(e) => setBVal(parseFloat(e.target.value))}
              className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,200,87,1)]"
            />
          </div>
        </div>

        <div className="mt-3 p-3 bg-[rgba(12,18,26,0.6)] rounded">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[color:var(--color-text-secondary)]">
              Current point:
            </span>
            <span className="text-sm font-mono text-[color:var(--color-text-primary)]">
              (w={wVal.toFixed(1)}, b={bVal.toFixed(1)})
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-[color:var(--color-text-secondary)]">Cost J(w,b):</span>
            <span className="text-sm font-mono text-[rgba(255,200,87,1)]">
              {currentCost.toFixed(3)}
            </span>
          </div>
        </div>
      </div>

      {/* What is a partial derivative? */}
      <div className="bg-[rgba(63,94,251,0.08)] border border-[rgba(63,94,251,0.3)] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          What is a Partial Derivative?
        </h4>
        <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
          A partial derivative measures how the function changes when we change{" "}
          <strong>one variable at a time</strong>, keeping all others constant.
        </p>

        <div className="space-y-4">
          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4">
            <div className="text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
              For our cost function: <InlineMath math="J(w, b) = w^2 + 0.5b^2" />
            </div>

            <div className="space-y-3 mt-3">
              <div>
                <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                  Partial derivative with respect to w (hold b constant):
                </div>
                <div className="bg-[rgba(35,230,255,0.1)] p-2 rounded">
                  <BlockMath math="\frac{\partial J}{\partial w} = 2w" />
                </div>
                <div className="text-xs text-[color:var(--color-text-secondary)] mt-1 italic">
                  &ldquo;How much does cost change when weight changes, keeping bias fixed?&rdquo;
                </div>
              </div>

              <div>
                <div className="text-xs text-[color:var(--color-text-secondary)] mb-1">
                  Partial derivative with respect to b (hold w constant):
                </div>
                <div className="bg-[rgba(35,230,255,0.1)] p-2 rounded">
                  <BlockMath math="\frac{\partial J}{\partial b} = b" />
                </div>
                <div className="text-xs text-[color:var(--color-text-secondary)] mt-1 italic">
                  &ldquo;How much does cost change when bias changes, keeping weight fixed?&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient vector anatomy */}
      <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          Gradient Vector Anatomy
        </h4>

        <div className="space-y-4">
          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4">
            <div className="text-sm font-medium text-[color:var(--color-text-primary)] mb-3">
              At point (w={wVal.toFixed(1)}, b={bVal.toFixed(1)}):
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[color:var(--color-text-secondary)]">
                  <InlineMath math="\frac{\partial J}{\partial w} = 2w" />
                </div>
                <div className="text-sm">
                  <InlineMath math={`= 2(${wVal.toFixed(1)}) = ${gradW.toFixed(1)}`} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-[color:var(--color-text-secondary)]">
                  <InlineMath math="\frac{\partial J}{\partial b} = b" />
                </div>
                <div className="text-sm">
                  <InlineMath math={`= ${bVal.toFixed(1)}`} />
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.1)] pt-3">
                <div className="text-sm font-medium text-[color:var(--color-text-primary)] mb-2">
                  Gradient vector:
                </div>
                <div className="bg-[rgba(35,230,255,0.1)] p-3 rounded">
                  <BlockMath
                    math={`\\nabla J = \\begin{bmatrix} \\frac{\\partial J}{\\partial w} \\\\ \\frac{\\partial J}{\\partial b} \\end{bmatrix} = \\begin{bmatrix} ${gradW.toFixed(1)} \\\\ ${gradB.toFixed(1)} \\end{bmatrix}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-3">
              <div className="text-xs font-semibold text-[color:var(--color-text-primary)] mb-2">
                Meaning of Components
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] space-y-1">
                <div>
                  <InlineMath math={`\\frac{\\partial J}{\\partial w} = ${gradW.toFixed(1)}`} />
                  <br />
                  Cost changes by {Math.abs(gradW).toFixed(1)} per unit increase in weight
                </div>
                <div className="mt-2">
                  <InlineMath math={`\\frac{\\partial J}{\\partial b} = ${gradB.toFixed(1)}`} />
                  <br />
                  Cost changes by {Math.abs(gradB).toFixed(1)} per unit increase in bias
                </div>
              </div>
            </div>

            <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-3">
              <div className="text-xs font-semibold text-[color:var(--color-text-primary)] mb-2">
                Vector Properties
              </div>
              <div className="text-xs text-[color:var(--color-text-secondary)] space-y-1">
                <div>
                  <strong>Direction:</strong> Points uphill (toward higher cost)
                </div>
                <div>
                  <strong>Magnitude:</strong>{" "}
                  <InlineMath
                    math={`|\\nabla J| = \\sqrt{${gradW.toFixed(1)}^2 + ${gradB.toFixed(1)}^2} = ${gradientMagnitude.toFixed(2)}`}
                  />
                </div>
                <div>
                  <strong>Interpretation:</strong> Steepness of the slope
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient descent update */}
      <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-5">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
          Gradient Descent Update Rule
        </h4>

        <div className="space-y-3">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Since the gradient points <strong>uphill</strong>, we move in the{" "}
            <strong>opposite direction</strong> to go <strong>downhill</strong>:
          </p>

          <div className="bg-[rgba(12,18,26,0.6)] rounded-lg p-4">
            <div className="text-center mb-3">
              <BlockMath math="w_{new} = w - \alpha \cdot \frac{\partial J}{\partial w}" />
            </div>
            <div className="text-center">
              <BlockMath math="b_{new} = b - \alpha \cdot \frac{\partial J}{\partial b}" />
            </div>
          </div>

          <div className="bg-[rgba(35,230,255,0.1)] p-3 rounded">
            <div className="text-xs font-semibold text-[color:var(--color-text-primary)] mb-2">
              Example with α = 0.1:
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div>
                <InlineMath
                  math={`w_{new} = ${wVal.toFixed(1)} - 0.1 \\cdot ${gradW.toFixed(1)} = ${(wVal - 0.1 * gradW).toFixed(2)}`}
                />
              </div>
              <div>
                <InlineMath
                  math={`b_{new} = ${bVal.toFixed(1)} - 0.1 \\cdot ${gradB.toFixed(1)} = ${(bVal - 0.1 * gradB).toFixed(2)}`}
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-[color:var(--color-text-secondary)] italic">
            The minus sign ensures we move <strong>downhill</strong> (opposite to gradient) toward
            lower cost!
          </div>
        </div>
      </div>

      {/* Key takeaways */}
      <div className="bg-[rgba(63,94,251,0.08)] border border-[rgba(63,94,251,0.3)] rounded-lg p-4">
        <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-2">
          Key Takeaways
        </h4>
        <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-1">
          <li>
            • <strong>Partial derivative:</strong> Rate of change in one direction (other variables
            fixed)
          </li>
          <li>
            • <strong>Gradient:</strong> Vector combining all partial derivatives [∂J/∂w, ∂J/∂b]
          </li>
          <li>
            • <strong>Direction:</strong> Gradient points uphill (toward higher cost)
          </li>
          <li>
            • <strong>Magnitude:</strong> How steep the cost surface is
          </li>
          <li>
            • <strong>Optimization:</strong> Move opposite to gradient (downhill) to minimize cost
          </li>
        </ul>
      </div>
    </div>
  );
}
