export type ChapterId = "history" | "policies" | "neural" | "agents";

export type AgendaItem = {
  label: string;
  description: string;
};

export type ChapterSectionDefinition = {
  id: string;
  title: string;
  description: string;
};

export type NotebookInfo = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  previewHref: string;
  downloadHref: string;
};

export type StudioInfo = {
  label: string;
  description: string;
  href: string;
};

export type ChapterDefinition = {
  id: ChapterId;
  order: number;
  icon?: string;
  title: string;
  tagline: string;
  teaser: string;
  summary: string;
  chapterHref: string;
  notebooks: NotebookInfo[];
  sections: ChapterSectionDefinition[];
  presenters: string[];
  studio?: StudioInfo;
};

export const chapters: ChapterDefinition[] = [
  {
    id: "history",
    order: 1,
    title: "History of AI",
    tagline: "Trace the breakthroughs that set the stage for today's models.",
    teaser:
      "Milestone timeline with projector-ready visuals that connect compute, data, and architecture across eras.",
    summary:
      "Anchor the session by charting foundational ideas from the Perceptron to transformers, then spotlight how scaling heuristics emerged as the compass for modern research.",
    chapterHref: "/history",
    presenters: ["Filip Frano"],
    notebooks: [
      {
        id: "scaling-laws",
        eyebrow: "Extend the Narrative",
        title: "Scaling Laws Notebook",
        description: "Regenerate compute/data curves, annotate inflection points, and export projector-ready charts from the talk.",
        previewHref: "/notebooks/scaling-laws.html",
        downloadHref: "/notebooks/scaling-laws.ipynb",
      },
    ],
    sections: [
      {
        id: "timeline",
        title: "Milestones timeline",
        description: "Scroll-activated cards surface key breakthroughs with clear narrative prompts for the audience.",
      },
      {
        id: "scaling",
        title: "Scaling laws explained",
        description: "Interactive log-log charts highlight the balance between compute, data, and architecture.",
      },
    ],
  },
  {
    id: "policies",
    order: 2,
    title: "AI Policy & Governance",
    tagline: "Translate regulatory momentum into practical guardrails for builders.",
    teaser:
      "Map global regulations, compare responsible AI frameworks, and get a practical compliance checklist for AI launches.",
    summary:
      "Explore the accelerating AI policy landscape, understand responsible AI frameworks, and get a program-level compliance checklist you can apply to your organization.",
    chapterHref: "/policies",
    presenters: ["Filip Frano"],
    notebooks: [],
    sections: [
      {
        id: "policy-landscape",
        title: "Global policy landscape",
        description: "Compare EU AI Act tiers, U.S. executive actions, and emerging global norms in a single view.",
      },
      {
        id: "frameworks",
        title: "Responsible AI frameworks",
        description: "Contrast NIST RMF, OECD principles, and industry playbooks to align stakeholders quickly.",
      },
      {
        id: "compliance",
        title: "Implementation checklist",
        description: "Ship a practical runbook—risk tiers, documentation, and review cadences—for product teams.",
      },
    ],
  },
  {
    id: "neural",
    order: 3,
    title: "Machine Learning Foundations",
    tagline: "Connect core ML intuitions to live housing price modeling demos.",
    teaser:
      "Visualise a compact network, unpack derivatives, and run gradient descent on the housing dataset with matching notebooks.",
    summary:
      "Dive inside a feed-forward network, explore the calculus behind parameter updates, and experiment with the housing regression lab using synchronized Jupyter notebooks you can revisit anytime.",
    chapterHref: "/neural",
    presenters: ["Daniel Huber"],
    notebooks: [],
    sections: [
      {
        id: "anatomy",
        title: "Network anatomy",
        description: "Diagram a compact network to define layers, neurons, weights, and biases.",
      },
      {
        id: "derivatives",
        title: "Derivative walkthrough",
        description: "Step-by-step derivatives link the loss function to gradient updates.",
      },
      {
        id: "gradient",
        title: "Gradient descent surface",
        description: "Plotly 3D surfaces visualize descent paths and learning-rate effects.",
      },
      {
        id: "training",
        title: "Housing training lab",
        description: "Dataset preview and training controller keep notebook outputs in sync with the stage demo.",
      },
    ],
  },
  {
    id: "agents",
    order: 4,
    title: "AI Agents & Discovery Loop",
    tagline: "Show LangGraph planning and the pendulum experimentation sandbox.",
    teaser:
      "Explore agent loops, observe reasoning in real-time, and experiment with the interactive pendulum physics sandbox.",
    summary:
      "Learn LangGraph fundamentals, experiment with the pendulum sandbox to see planning and tool execution in action, and explore the future of autonomous AI systems with safety considerations.",
    chapterHref: "/agents",
    presenters: ["Daniel Huber"],
    notebooks: [
      {
        id: "langgraph-pendulum",
        eyebrow: "Experiment Companion",
        title: "LangGraph Pendulum Agent",
        description: "Inspect the experiment queue logic, reasoning prompts, and reconciliation checks that power the pendulum discovery loop.",
        previewHref: "/notebooks/langgraph-pendulum.html",
        downloadHref: "/notebooks/langgraph-pendulum.ipynb",
      },
    ],
    sections: [
      {
        id: "overview",
        title: "Agent overview",
        description: "LangGraph mental models, highlight cards, and discussion cues for the agent journey.",
      },
      {
        id: "sandbox",
        title: "Pendulum sandbox",
        description: "Interactive experiment queue with reasoning transcript and loss-surface preview.",
      },
      {
        id: "future",
        title: "Future trajectories",
        description: "Outlook on evaluation loops, safety guardrails, and research copilots.",
      },
    ],
    studio: {
      label: "Open LangGraph Studio Trace",
      description: "Launch the pre-recorded planner/tool trace to narrate each hop before rerunning the sandbox live.",
      href: "https://www.langchain.com/langgraph",
    },
  },
];

export const agenda = chapters;

export function getChapterDefinition(id: ChapterId): ChapterDefinition {
  const chapter = chapters.find((entry) => entry.id === id);
  if (!chapter) {
    throw new Error(`Unknown chapter id: ${id}`);
  }
  return chapter;
}

export type NeuralHighlight = {
  title: string;
  detail: string;
};

export const neuralHighlights: NeuralHighlight[] = [
  {
    title: "Architecture Explorer",
    detail:
      "Interactive layers and activations with readable tooltips explaining how weights, bias, and signals propagate.",
  },
  {
    title: "Gradient Descent Lab",
    detail:
      "Adjust learning rates, inspect the Plotly-powered 3D cost surface, and stack multiple descent paths for comparison with live gradients.",
  },
  {
    title: "Housing Price Training",
    detail:
      "Synthetic dataset controls, normalization switches, training curves, and residual diagnostics ready for live tweaking.",
  },
  {
    title: "Matrix Efficiency",
    detail:
      "Loop vs vectorized vs GPU benchmarks rendered in real time with guardrails for lower powered hardware.",
  },
];

export type AgentHighlight = {
  title: string;
  detail: string;
};

export const agentHighlights: AgentHighlight[] = [
  {
    title: "LangGraph Overview",
    detail:
      "Node-edge visualization of planners, tools, memory stores, and execution traces with focusable steps, paired with LangGraph Studio walkthrough cues.",
  },
  {
    title: "Pendulum Discovery Loop",
    detail:
      "Agent designs experiments, observes noisy pendulum periods, and fits k, p in T = k * L^p live on stage with a one-click notebook jump for deeper inspection.",
  },
  {
    title: "Future Trajectories",
    detail:
      "Pragmatic look at compute scaling, safety guardrails, evaluation loops, and research copilots for the next decade.",
  },
];
