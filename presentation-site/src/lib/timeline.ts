export type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  detail: string;
};

export const coreTimeline: TimelineEvent[] = [
  {
    id: "alexnet",
    year: "2012",
    title: "AlexNet",
    detail:
      "Modern deep learning breakthrough; ImageNet error dropped by 10 points and showcased GPU-first training.",
  },
  {
    id: "alphago",
    year: "2016",
    title: "AlphaGo",
    detail:
      "Hybrid of Monte Carlo Tree Search and deep reinforcement learning proving strategic reasoning from self-play.",
  },
  {
    id: "transformers",
    year: "2017",
    title: "Transformers",
    detail:
      "Attention is all you need - sequence modeling without recurrence sparked the large language model era.",
  },
  {
    id: "scaling-laws",
    year: "2020",
    title: "Scaling Laws",
    detail:
      "Empirical loss formula tying model size, dataset scale, and compute into predictable power-law curves.",
  },
];
