import { ChapterLayout } from "@/components/layout/ChapterLayout";
import { getChapterDefinition } from "@/lib/sections";

const chapter = getChapterDefinition("policies");

const regionalPolicies = [
  {
    title: "EU AI Act",
    status: "Adopted 2024 · phased enforcement through 2026",
    focus:
      "Risk-tiered obligations, mandatory technical documentation, and real-time monitoring for high-risk deployments.",
  },
  {
    title: "U.S. Executive Order on AI",
    status: "Active · NIST + DHS guidance rolling out",
    focus:
      "Safety test reporting, synthetic content watermarking, and critical infrastructure reporting guardrails.",
  },
  {
    title: "Global coordination",
    status: "OECD, G7, and GPAI working groups",
    focus:
      "Convergence on transparency, incident response, and red-teaming norms across jurisdictions.",
  },
];

const frameworks = [
  {
    name: "NIST AI Risk Management Framework",
    pillars: "Govern · Map · Measure · Manage",
    highlight:
      "Beautiful scaffold for program managers—pair each pillar with your organization's control owners and audit cadence.",
  },
  {
    name: "OECD & UNESCO principles",
    pillars: "Human-centered · Robust · Accountable",
    highlight:
      "Great for executive alignment—translate the principles into policy statements and measurable service levels.",
  },
  {
    name: "Industry blueprints",
    pillars: "Microsoft RAI, Google SAFETY, Anthropic RSP",
    highlight:
      "Borrow starter playbooks for release gating, incident drills, and policy sign-offs when your team needs momentum fast.",
  },
];

const checklistItems = [
  {
    label: "Map your inventory",
    detail: "List AI-enabled features, data sources, and user touchpoints—flag anything that touches regulated domains.",
  },
  {
    label: "Assign accountability",
    detail: "Connect each product surface to a control owner with escalation paths to legal, security, and policy teams.",
  },
  {
    label: "Document the lifecycle",
    detail: "Capture model cards, evaluation results, red-team findings, and monitoring thresholds in a shared workspace.",
  },
  {
    label: "Rehearse incidents",
    detail: "Run post-launch drills that combine safety, communications, and engineering so mitigation muscle stays sharp.",
  },
  {
    label: "Close the loop",
    detail: "Feed risk learnings back into roadmap prioritisation and notebook experiments to show policy in action.",
  },
];

export default function PoliciesPage() {
  return (
    <ChapterLayout chapter={chapter}>
      <section id="policy-landscape" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="glass-panel relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(35,230,255,0.12),transparent_75%)]" />
            <div className="relative grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="section-title">Global policy landscape</p>
                <h2 className="section-heading text-balance text-2xl">
                  Show how legislation is coalescing so the audience knows what to prepare for next.
                </h2>
                <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
                  Open with concrete milestones and emphasise how the risk tiers map to real product work. The card stack
                  gives you talking points that travel well across regions.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {regionalPolicies.map((policy) => (
                  <article key={policy.title} className="glass-panel h-full border border-[rgba(255,255,255,0.08)] p-4">
                    <h3
                      className="text-lg text-[color:var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {policy.title}
                    </h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                      {policy.status}
                    </p>
                    <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">{policy.focus}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="frameworks" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="glass-panel p-6 text-sm text-[color:var(--color-text-secondary)]">
              <h2
                className="text-xl text-[color:var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Align frameworks before debating tooling.
              </h2>
              <p className="mt-4">
                Use this section to cross-walk the frameworks your audience likely hears about. The goal is to keep the
                terminology straight so policy, legal, and engineering leaders feel like they are solving the same puzzle.
              </p>
              <ul className="mt-4 space-y-3">
                <li>Highlight which pillars map to existing governance boards versus net-new reviews.</li>
                <li>Call out documentation assets (model cards, transparency reports) that can live in your notebook hub.</li>
                <li>Invite the audience to flag upcoming regulation—they can append it to the shared policy canvas.</li>
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {frameworks.map((framework) => (
                <article key={framework.name} className="glass-panel border border-[rgba(255,255,255,0.08)] p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">{framework.pillars}</p>
                  <h3
                    className="mt-2 text-lg text-[color:var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {framework.name}
                  </h3>
                  <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">{framework.highlight}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="compliance" className="section-boundary">
        <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-[460px]">
                <p className="section-title">Implementation checklist</p>
                <h2 className="section-heading text-balance text-2xl">
                  Leave the room with a runbook teams can actually execute.
                </h2>
                <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
                  Pair these steps with your internal workflows or drop them into the notebook library so attendees can
                  annotate responsibilities in real time. Each item ties back to the risk obligations earlier in the
                  chapter.
                </p>
              </div>
              <ul className="grid flex-1 gap-4 sm:grid-cols-2">
                {checklistItems.map((item) => (
                  <li key={item.label} className="glass-panel border border-[rgba(255,255,255,0.08)] p-4">
                    <h3
                      className="text-base text-[color:var(--color-text-primary)]"
                      style={{ fontFamily: "var(--font-space-grotesk)" }}
                    >
                      {item.label}
                    </h3>
                    <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="policies-notes" className="section-boundary">
        <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-6 px-6 text-sm text-[color:var(--color-text-secondary)] lg:grid-cols-2 lg:px-8">
          <div className="glass-panel p-6">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Presenter cues
            </h3>
            <ul className="mt-3 space-y-3">
              <li>Ask the audience which policies apply to their teams and tag the cards live to keep the conversation grounded.</li>
              <li>Use the compliance checklist as a pre-launch retro—what steps are already covered, what needs new tooling?</li>
              <li>Invite legal or security partners to annotate the notebook with links to your internal policy docs.</li>
            </ul>
          </div>
          <div className="glass-panel p-6">
            <h3
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Resources to share afterwards
            </h3>
            <p className="mt-3">
              Link to regulator explainer videos, the EU AI Act timeline, and your internal responsible AI wiki. Pair the
              materials with the notebook hub so every attendee can revisit policy notes alongside the technical demos.
            </p>
          </div>
        </div>
      </section>
    </ChapterLayout>
  );
}

