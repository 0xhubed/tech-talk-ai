import { ChapterLayout } from "@/components/layout/ChapterLayout";
import { DiscoveryDemoSection } from "@/components/neural/DiscoveryDemoSection";
import { LinearRegressionComplete } from "@/components/neural/LinearRegressionComplete";
import { LinearRegressionExplorer } from "@/components/neural/LinearRegressionExplorer";
import { CostFunctionVisualization } from "@/components/neural/CostFunctionVisualization";
import { CostFunctionDualPanel } from "@/components/neural/cost-function/CostFunctionDualPanel";
import { ErrorBreakdownVisualizer } from "@/components/neural/cost-function/ErrorBreakdownVisualizer";
import { DerivativeExplorer1D } from "@/components/neural/gradient-descent/DerivativeExplorer1D";
import { GradientFieldContour } from "@/components/neural/gradient-descent/GradientFieldContour";
import { PartialDerivativeBreakdown } from "@/components/neural/gradient-descent/PartialDerivativeBreakdown";
import { LearningRateComparison } from "@/components/neural/gradient-descent/LearningRateComparison";
import { GradientDescentExplorer } from "@/components/neural/GradientDescentExplorer";
import { TrainingPipelineDemo } from "@/components/neural/TrainingPipelineDemo";
import { LinearVsNeuralComparison } from "@/components/neural/LinearVsNeuralComparison";
import { ArchitectureEvolution } from "@/components/neural/ArchitectureEvolution";
import { NotebookLauncher } from "@/components/neural/NotebookLauncher";
import { getChapterDefinition } from "@/lib/sections";

const chapter = getChapterDefinition("neural");

export default function NeuralPage() {
  return (
    <ChapterLayout chapter={chapter}>
      {/* Opening: Discovery Demo */}
      <DiscoveryDemoSection />

      {/* What is Linear Regression - Merged comprehensive section */}
      <LinearRegressionComplete />

      {/* Core Concept 1: Model Representation */}
      <section id="model-representation" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge">Step 1</span>
            <h2 className="section-heading mt-4">
              Model Representation: f(x) = wx + b
            </h2>
            <p className="section-body">
              Adjust parameters to see how the prediction line changes.
            </p>
          </div>

          <div className="mb-8">
            <LinearRegressionExplorer />
          </div>

          <NotebookLauncher
            notebookId="1_Model_Representation"
            title="Explore Model Representation in Depth"
            description="See the complete mathematical formulation of linear regression, implement the model function, and make predictions on housing data."
            notebookPath="maschine learning foundations content/1_Model_Representation.ipynb"
            variant="primary"
          />
        </div>
      </section>

      {/* Core Concept 2: Cost Function */}
      <section id="cost-function" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge">Step 2</span>
            <h2 className="section-heading mt-4">
              Cost Function: The Model&apos;s Report Card
            </h2>
            <p className="section-body">
              Every prediction our model makes is either too high or too low. The cost function
              aggregates all these errors into a single number that tells us: &ldquo;How wrong is the model?&rdquo;
              Our goal: make this number as small as possible.
            </p>
          </div>

          {/* Key questions callout */}
          <div className="mb-8 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-3">
              Key Questions We&apos;ll Answer:
            </h3>
            <ul className="space-y-2 text-[color:var(--color-text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>How do we measure &ldquo;wrongness&rdquo;? (MSE formula)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>Why square the errors instead of just absolute values?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>What does the cost landscape look like?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>How does this prepare us for optimization?</span>
              </li>
            </ul>
          </div>

          {/* Interactive Dual Panel Explorer */}
          <div className="mb-8">
            <CostFunctionDualPanel />
          </div>

          {/* Error Breakdown */}
          <div className="mb-8">
            <ErrorBreakdownVisualizer />
          </div>

          {/* Original visualization for reference */}
          <div className="mb-8">
            <details className="glass-panel p-6">
              <summary className="cursor-pointer text-lg font-semibold text-[color:var(--color-text-primary)] mb-4">
                Additional: Classic Cost Surface View
              </summary>
              <CostFunctionVisualization />
            </details>
          </div>

          {/* Key insights callouts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                📊 Reading the Cost Surface
              </h4>
              <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[rgba(34,197,94,1)]">✅</span>
                  <span>Bowl shape = convex = single global minimum</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Steep sides = cost changes rapidly with parameter changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Flat bottom = optimal region (many w, b pairs are equally good)</span>
                </li>
              </ul>
            </div>

            <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                🎯 Optimization Preview
              </h4>
              <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[rgba(34,197,94,1)]">✅</span>
                  <span>Convex shape means gradient descent will always find the optimal solution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>No local minima to get stuck in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Smooth surface = we can use calculus to find the direction to move</span>
                </li>
              </ul>
            </div>
          </div>

          <NotebookLauncher
            notebookId="2_Cost_function"
            title="Deep Dive: Cost Function Mathematics"
            description="Understand MSE, visualize cost surfaces in 3D, and see how cost changes with different parameters."
            notebookPath="maschine learning foundations content/2_Cost_function.ipynb"
            variant="primary"
          />
        </div>
      </section>

      {/* Core Concept 3: Gradient Descent */}
      <section id="gradient-descent" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge">Step 3</span>
            <h2 className="section-heading mt-4">
              Gradient Descent: Following the Slope Downhill
            </h2>
            <p className="section-body">
              We know the cost function landscape. We know the optimal parameters exist at the minimum.
              But how do we <em>find</em> them? Gradient descent uses calculus to compute the
              &ldquo;downhill direction&rdquo; at every point, then takes small steps until reaching the bottom.
            </p>
          </div>

          {/* Key questions callout */}
          <div className="mb-8 bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-3">
              Key Questions We&apos;ll Answer:
            </h3>
            <ul className="space-y-2 text-[color:var(--color-text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>What is a derivative and why does it point &ldquo;uphill&rdquo;?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>How do we use derivatives to find which way to move?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>What is a gradient in 2D/3D?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>Why do we move <em>opposite</em> to the gradient?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[rgba(255,200,87,1)] mt-1">•</span>
                <span>How does learning rate affect convergence?</span>
              </li>
            </ul>
          </div>

          {/* 1D Derivative Explorer */}
          <div className="mb-8">
            <DerivativeExplorer1D />
          </div>

          {/* Partial Derivative Breakdown */}
          <div className="mb-8">
            <PartialDerivativeBreakdown />
          </div>

          {/* 2D Contour with Gradient Field */}
          <div className="mb-8">
            <GradientFieldContour />
          </div>

          {/* Learning Rate Comparison */}
          <div className="mb-8">
            <LearningRateComparison />
          </div>

          {/* Original 3D Explorer */}
          <div className="mb-8">
            <details className="glass-panel p-6" open>
              <summary className="cursor-pointer text-lg font-semibold text-[color:var(--color-text-primary)] mb-4">
                Interactive 3D Descent Path Explorer
              </summary>
              <GradientDescentExplorer />
            </details>
          </div>

          {/* Key insights callouts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[rgba(35,230,255,0.08)] border border-[rgba(35,230,255,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                💡 Derivative = Slope
              </h4>
              <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                <li>• The derivative at a point tells you the slope of the tangent line</li>
                <li>• Positive slope → function increasing → go left to decrease</li>
                <li>• Negative slope → function decreasing → go right to decrease</li>
                <li>• Zero slope → flat (minimum, maximum, or saddle point)</li>
              </ul>
            </div>

            <div className="bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                🧭 Gradient = Multi-Dimensional Slope
              </h4>
              <ul className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                <li>• In 2D/3D, we have multiple directions to move</li>
                <li>• The gradient is a <em>vector</em> pointing in the steepest uphill direction</li>
                <li>• Each component is a partial derivative (∂f/∂x, ∂f/∂y)</li>
                <li>• Magnitude = steepness, Direction = uphill</li>
              </ul>
            </div>

            <div className="bg-[rgba(255,200,87,0.08)] border border-[rgba(255,200,87,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                ⬇️ Why Negative Gradient?
              </h4>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Since gradient points uphill (toward higher cost), negative gradient points downhill
                (toward lower cost). That&apos;s exactly where we want to go to minimize the cost
                function! This is why the update rule has a minus sign.
              </p>
            </div>

            <div className="bg-[rgba(63,94,251,0.08)] border border-[rgba(63,94,251,0.3)] rounded-lg p-5">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] mb-3">
                🎯 The Update Rule
              </h4>
              <div className="text-sm text-[color:var(--color-text-secondary)] space-y-2">
                <div className="font-mono bg-[rgba(12,18,26,0.6)] p-2 rounded">
                  θ_new = θ_old - α·∇f(θ)
                </div>
                <ul className="space-y-1">
                  <li>• θ: parameters (w, b, or x, y)</li>
                  <li>• α: learning rate (step size)</li>
                  <li>• ∇f: gradient (direction to move)</li>
                  <li>• Minus sign: go downhill (opposite of gradient)</li>
                </ul>
              </div>
            </div>
          </div>

          <NotebookLauncher
            notebookId="3_Gradient_Descent"
            title="Run Gradient Descent Algorithm"
            description="Implement the complete optimization algorithm, watch parameters converge, and visualize the descent path on the cost surface."
            notebookPath="maschine learning foundations content/3_Gradient_Descent.ipynb"
            variant="primary"
          />
        </div>
      </section>

      {/* Complete Training Pipeline */}
      <section id="training-lab" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge">Putting It Together</span>
            <h2 className="section-heading mt-4">
              Complete Training Pipeline
            </h2>
            <p className="section-body">
              Put it all together: data → model → cost → optimization.
            </p>
          </div>

          <div className="mb-8">
            <TrainingPipelineDemo />
          </div>
        </div>
      </section>

      {/* Transition to Neural Networks */}
      <section id="neural-transition" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge">Next Level</span>
            <h2 className="section-heading mt-4">
              When Linear Models Fail
            </h2>
            <p className="section-body">
              See why we need neural networks for complex data.
            </p>
          </div>

          <div className="mb-8">
            <LinearVsNeuralComparison />
          </div>

          <NotebookLauncher
            notebookId="4_Neural_Networks"
            title="Build Neural Networks"
            description="Learn how neural networks handle non-linear patterns and build your first multi-layer network."
            notebookPath="maschine learning foundations content/4_Neural_Networks.ipynb"
            variant="primary"
          />
        </div>
      </section>

      {/* Architecture Evolution - Merged comprehensive section */}
      <ArchitectureEvolution />

      {/* Closing Notes */}
      <section id="neural-notes" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="glass-panel p-8">
            <h3
              className="text-2xl font-bold text-[color:var(--color-text-primary)] mb-4"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Ready for Self-Study
            </h3>
            <p className="text-[color:var(--color-text-secondary)] mb-6">
              Every visualization and control in this chapter is synchronized with Jupyter notebooks.
              You can replay gradient descent paths, experiment with different hyperparameters,
              and build your own neural networks from scratch—all at your own pace.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-2">
                  5 Complete Notebooks
                </h4>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  From AI discovery to transformers - all code is executable and yours to explore
                </p>
              </div>
              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-2">
                  Interactive Visuals
                </h4>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  3D cost surfaces, animated descent, real-time training - see the math come alive
                </p>
              </div>
              <div className="bg-[rgba(12,18,26,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <h4 className="font-semibold text-[color:var(--color-text-primary)] mb-2">
                  Path to Modern AI
                </h4>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  Complete journey from linear regression to understanding ChatGPT architecture
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ChapterLayout>
  );
}
