import type { AgentHighlight } from "@/lib/sections";
import { NotebookLaunch } from "@/components/notebooks/NotebookLaunch";

export type AgentsSectionNotebook = {
  eyebrow: string;
  title: string;
  description: string;
  previewHref: string;
  downloadHref: string;
};

export type AgentsSectionProps = {
  items: AgentHighlight[];
  anchorId?: string;
  eyebrow?: string;
  heading?: string;
  notebook?: AgentsSectionNotebook | null;
};

function LangGraphDiagram() {
  const nodes = [
    { id: "planner", label: "Planner", cx: 28, cy: 42 },
    { id: "router", label: "Router", cx: 50, cy: 22 },
    { id: "tool", label: "Tool", cx: 74, cy: 42 },
    { id: "memory", label: "Memory", cx: 50, cy: 72 },
  ];

  const edges = [
    { from: "planner", to: "router" },
    { from: "router", to: "tool" },
    { from: "tool", to: "memory" },
    { from: "memory", to: "planner" },
  ];

  const getNode = (id: string) => nodes.find((node) => node.id === id)!;

  return (
    <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label="LangGraph conceptual flow">
      <defs>
        <linearGradient id="agent-edge" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(35,230,255,0.65)" />
          <stop offset="100%" stopColor="rgba(255,47,185,0.65)" />
        </linearGradient>
      </defs>
      {edges.map((edge, index) => {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        return (
          <line
            key={`edge-${index}`}
            x1={from.cx}
            y1={from.cy}
            x2={to.cx}
            y2={to.cy}
            stroke="url(#agent-edge)"
            strokeWidth={2.2}
            strokeLinecap="round"
            opacity={0.8}
          />
        );
      })}
      {nodes.map((node, index) => (
        <g key={node.id}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r={10}
            fill={index % 2 === 0 ? "rgba(35,230,255,0.16)" : "rgba(255,47,185,0.16)"}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={1}
          />
          <text
            x={node.cx}
            y={node.cy + 0.5}
            textAnchor="middle"
            fontSize="6"
            fontFamily="var(--font-inter, system-ui)"
            fill="rgba(255,255,255,0.88)"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const defaultNotebook: AgentsSectionNotebook = {
  eyebrow: "Experiment Companion",
  title: "Open the LangGraph Agent Notebook",
  description:
    "Hand the reins to the interactive notebook when you want to dissect planner-tool hops, streamed LLM thoughts, and physics guardrails with your audience.",
  previewHref: "/notebooks/langgraph-pendulum.html",
  downloadHref: "/notebooks/langgraph-pendulum.ipynb",
};

export function AgentsSection({
  items,
  anchorId,
  eyebrow = "Chapter 3 - AI Agents",
  heading = "LangGraph mental models and a scientific discovery sandbox.",
  notebook,
}: AgentsSectionProps) {
  const notebookCta = notebook === undefined ? defaultNotebook : notebook;
  return (
    <section id={anchorId ?? "agents"} className="section-boundary">
      <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="section-title">{eyebrow}</p>
          <h2 className="section-heading">{heading}</h2>
          <p className="section-body">
            The pendulum experiment highlights agentic planning: selecting lengths, gathering noisy measurements, updating
            hypotheses, and converging on the hidden constant. Reference LangGraph Studio to preview execution traces,
            then jump into the paired notebook to inspect prompts, queue strategy, and reconciliation steps line by line.
          </p>
          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-5"
              >
                <h3
                  className="text-lg text-[color:var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="caption mt-8">
            What to look for: Highlight experiment queue updates and how the agent balances exploration versus refinement.
          </p>
        </div>
        <aside className="glass-panel relative flex flex-col gap-8 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(35,230,255,0.2),transparent_60%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">Flow snapshot</p>
            <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-4">
              <LangGraphDiagram />
              <p className="mt-3 text-xs text-[color:var(--color-text-secondary)]">
                Planner hands context to the router, which orchestrates tool calls and writes summaries back into memory
                before looping.
              </p>
            </div>
          </div>
          <div className="relative">
            <h3
              className="text-xl text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Discussion Prompts
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--color-text-secondary)]">
              <li>• Ask the audience to predict the impact of increasing noise before running the trial batch.</li>
              <li>• Freeze the scatter to discuss outliers, then resume to show updated fit.</li>
              <li>• Contrast LangGraph with linear pipelines to reinforce modular tooling.</li>
            </ul>
          </div>
          <div className="token-divider" />
          <div className="relative">
            <h3
              className="text-xl text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Future Trajectories
            </h3>
            <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">
              Packaged cards explore compute scaling, rapid evaluation loops, pragmatic safety guardrails, and multi-agent
              lab assistants accelerating research lines.
            </p>
          </div>
          {notebookCta ? (
            <NotebookLaunch
              topic="agents"
              eyebrow={notebookCta.eyebrow}
              title={notebookCta.title}
              description={notebookCta.description}
              previewHref={notebookCta.previewHref}
              downloadHref={notebookCta.downloadHref}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
