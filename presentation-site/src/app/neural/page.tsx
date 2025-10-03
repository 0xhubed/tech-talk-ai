import { ChapterLayout } from "@/components/layout/ChapterLayout";
import { DiscoveryDemoSection } from "@/components/neural/DiscoveryDemoSection";
import { LinearRegressionExplorer } from "@/components/neural/LinearRegressionExplorer";
import { CostFunctionVisualization } from "@/components/neural/CostFunctionVisualization";
import { GradientDescentExplorer } from "@/components/neural/GradientDescentExplorer";
import { TrainingPipelineDemo } from "@/components/neural/TrainingPipelineDemo";
import { LinearVsNeuralComparison } from "@/components/neural/LinearVsNeuralComparison";
import { TransformersPreview } from "@/components/neural/TransformersPreview";
import { NotebookLauncher } from "@/components/neural/NotebookLauncher";
import { getChapterDefinition } from "@/lib/sections";

const chapter = getChapterDefinition("neural");

export default function NeuralPage() {
  return (
    <ChapterLayout chapter={chapter}>
      {/* Opening: Discovery Demo */}
      <DiscoveryDemoSection />

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
              Cost Function: Measuring Prediction Error
            </h2>
            <p className="section-body">
              See how cost changes with different parameters.
            </p>
          </div>

          <div className="mb-8">
            <CostFunctionVisualization />
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
              Gradient Descent: Finding the Minimum
            </h2>
            <p className="section-body">
              Watch the algorithm navigate to the optimal parameters.
            </p>
          </div>

          <div className="mb-8">
            <GradientDescentExplorer />
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

      {/* Transformers Preview */}
      <TransformersPreview />

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
