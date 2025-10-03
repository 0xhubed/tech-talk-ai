import { ChapterLayout } from "@/components/layout/ChapterLayout";
import { AgentsSection } from "@/components/agents/AgentsSection";
import { PendulumSandbox } from "@/components/agents/PendulumSandbox";
import { agentHighlights, getChapterDefinition } from "@/lib/sections";

const chapter = getChapterDefinition("agents");

export default function AgentsPage() {
  return (
    <ChapterLayout chapter={chapter}>
      <AgentsSection anchorId="overview" items={agentHighlights} notebook={null} />
      <PendulumSandbox anchorId="sandbox" />
      <section id="future" className="section-boundary">
        <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-8 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="glass-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Future trajectories &amp; discussion
            </h3>
            <p className="mt-3">
              Use this section to connect the pendulum sandbox with broader industry conversations. Each prompt is framed
              as a question so the audience can continue the dialogue after the demo.
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Scaling vs. efficiency.</strong> Will the
                next leap come from bigger models, better data curation, or tool-rich agents? Compare Anthropic’s
                Chinchilla optimality to multi-agent systems such as SWE-bench.
              </li>
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Evaluation loops.</strong> Discuss how agent
                evals (HELM, BIG-bench, GAIA) differ from static model benchmarks, and invite the audience to propose new
                diagnostic tasks they would like to automate.
              </li>
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Safety guardrails.</strong> Highlight
                contrastive rollout, tool whitelists, and tracer-based auditing. Ask which safeguards they would deploy
                before handing LangGraph agents real-world actuators.
              </li>
              <li>
                <strong className="text-[color:var(--color-text-primary)]">Human-in-the-loop co-creation.</strong>
                Explore how notebooks, Studio traces, and the web UI can become a shared canvas for classrooms, research
                labs, or customer workshops.
              </li>
            </ul>
          </div>
          <div className="glass-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Resources for deeper dives
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <span className="font-medium text-[color:var(--color-text-primary)]">LangGraph Studio Templates:</span>
                Start with the planner-tool sandbox template to replicate the pendulum demo, then branch into tool
                routing or memory-augmented flows.
              </li>
              <li>
                <span className="font-medium text-[color:var(--color-text-primary)]">Notebook experiments:</span>
                Modify the provided prompts to target different physics systems (double pendulum, spring-mass, inverted
                pendulum) and compare convergence.
              </li>
              <li>
                <span className="font-medium text-[color:var(--color-text-primary)]">Reading list:</span> Microsoft
                AutoGen, OpenAI Evals, Leike et al. on scalable oversight, and the latest LangChain blog posts on agent
                tooling.
              </li>
              <li>
                <span className="font-medium text-[color:var(--color-text-primary)]">Open discussion:</span> Capture
                takeaways in the notebook markdown cells; rerun the demo with attendee-suggested prompts to close the
                loop.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </ChapterLayout>
  );
}
