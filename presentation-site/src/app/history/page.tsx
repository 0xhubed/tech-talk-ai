import { ChapterLayout } from "@/components/layout/ChapterLayout";
import { TimelineSection } from "@/components/history/TimelineSection";
import { ScalingLawCard } from "@/components/history/ScalingLawCard";
import { coreTimeline } from "@/lib/timeline";
import { getChapterDefinition } from "@/lib/sections";

const chapter = getChapterDefinition("history");
const scalingNotebook = chapter.notebooks[0];

export default function HistoryPage() {
  return (
    <ChapterLayout chapter={chapter}>
      <TimelineSection
        anchorId="timeline"
        events={coreTimeline}
        notebookPreviewHref={scalingNotebook?.previewHref}
        notebookDownloadHref={scalingNotebook?.downloadHref}
      />

      <section id="scaling" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <ScalingLawCard />
        </div>
      </section>

      <section id="history-insights" className="section-boundary">
        <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-10 px-6 text-sm text-[color:var(--color-text-secondary)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="glass-panel p-6">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Three waves that shaped the field
            </h3>
            <ol className="mt-4 space-y-4 text-sm">
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Symbolic era (1956–1986).</strong> Expert
                systems and GOFAI optimised hand-written rules. The timeline highlights Frank Rosenblatt’s Perceptron and
                Minsky/Papert’s critique—two events that framed the first winter.
              </li>
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Data-driven resurgence (1986–2012).</strong>
                Backpropagation, convolutional nets, and GPU acceleration unlocked statistical learning. LeNet-5, LSTM,
                and AlexNet show how hardware plus data produced compounding gains.
              </li>
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Scaling law era (2012–today).</strong>
                Transformers, self-supervision, and foundation models follow a predictable scaling curve. The notebook
                recreates OpenAI, DeepMind, and Anthropic measurements so you can experiment with your own exponents.
              </li>
            </ol>
          </div>
          <div className="glass-panel p-6">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              How to read the scaling plots
            </h3>
            <p>
              Use the noise presets to model dataset quality, compute efficiency, and architectural changes. Notice how
              the loss floor flattens when the model becomes data-limited versus compute-limited. The notebook includes
              presets for Chinchilla, PaLM, and Llama training runs so you can compare slopes side-by-side.
            </p>
            <ul className="mt-4 list-disc pl-5">
              <li>Loss <em>∝</em> <code>N<sup>-α</sup></code> + <code>D<sup>-β</sup></code> + <code>C<sup>-γ</sup></code> captures the current frontier.</li>
              <li>Real deployments add infrastructure variance—simulate it by nudging the slider beyond 0.12.</li>
              <li>Breakpoints usually foreshadow architecture shifts (CNN → Transformer, dense → Mixture-of-Experts).</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="history-notes" className="section-boundary">
        <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-8 px-6 lg:grid-cols-2 lg:px-8">
          <div className="glass-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Suggested discussion prompts
            </h3>
            <ul className="mt-3 space-y-3">
              <li>
                What happens when the scaling curve hits energy or data bottlenecks? Compare the plateau years in the
                timeline to today’s hardware roadmap.
              </li>
              <li>
                Which breakthroughs were “algorithm-first” versus “compute-first”? Use the Perceptron, AlexNet, and
                Transformers as case studies.
              </li>
              <li>
                Ask the audience to predict the next inflection point—new modality, new architecture, or new training
                objective?
              </li>
            </ul>
          </div>
          <div className="glass-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Keep exploring after the talk
            </h3>
            <p className="mt-3">
              The timeline and scaling notebook stay online. Annotate milestones, export SVG/CSV assets, or plug in your
              own compute/data budgets to forecast performance. We’ve linked the original papers inside the notebook so
              you can trace claims back to primary sources.
            </p>
          </div>
        </div>
      </section>
    </ChapterLayout>
  );
}
