export type NotebookTopic = "history" | "neural" | "agents";

export type NotebookResource = {
  id: string;
  title: string;
  blurb: string;
  topic: NotebookTopic;
  htmlPreviewPath: string;
  notebookPath: string;
  studioHint?: string;
};

export const notebookResources: NotebookResource[] = [
  {
    id: "history-scaling-laws",
    title: "Scaling Laws Walkthrough",
    blurb:
      "Derive compute/data scaling exponents, recreate the historical plots, and annotate inflection points with narrative callouts.",
    topic: "history",
    htmlPreviewPath: "/notebooks/scaling-laws.html",
    notebookPath: "/notebooks/scaling-laws.ipynb",
  },
  {
    id: "neural-gradient-descent",
    title: "Gradient Descent Lab",
    blurb:
      "Experiment with learning rates, momentum, and normalization strategies on the housing dataset using the same seeds as the stage demo, featuring Plotly 3D surfaces with interactive camera presets.",
    topic: "neural",
    htmlPreviewPath: "/notebooks/gradient-descent.html",
    notebookPath: "/notebooks/gradient-descent.ipynb",
  },
  {
    id: "neural-housing-regression",
    title: "Housing Regression Pipeline",
    blurb:
      "Walk step-by-step through feature engineering, train/eval splits, and visualization exports for the presentation-ready charts.",
    topic: "neural",
    htmlPreviewPath: "/notebooks/housing-regression.html",
    notebookPath: "/notebooks/housing-regression.ipynb",
  },
  {
    id: "agents-langgraph-pendulum",
    title: "LangGraph Pendulum Agent",
    blurb:
      "Inspect the experiment queue logic, reasoning stream prompts, and reconciliation checks powering the pendulum discovery loop.",
    topic: "agents",
    htmlPreviewPath: "/notebooks/langgraph-pendulum.html",
    notebookPath: "/notebooks/langgraph-pendulum.ipynb",
    studioHint: "Use LangGraph Studio to trace planner-tool interactions before running the notebook locally.",
  },
];

export function notebooksByTopic(topic: NotebookTopic): NotebookResource[] {
  return notebookResources.filter((resource) => resource.topic === topic);
}
