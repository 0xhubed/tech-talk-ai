"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";
import { InlineMath } from "react-katex";
import { useInView } from "@/hooks/useInView";
import type { TimelineEvent } from "@/lib/timeline";
import { NotebookLaunch } from "@/components/notebooks/NotebookLaunch";

export type TimelineSectionProps = {
  events: TimelineEvent[];
  anchorId?: string;
  notebookPreviewHref?: string;
  notebookDownloadHref?: string;
};

type TimelineEventCardProps = {
  event: TimelineEvent;
  index: number;
  total: number;
  registerNode: (index: number, node: HTMLDivElement | null) => void;
  focusCard: (index: number) => void;
};

function TimelineEventCard({ event, index, total, registerNode, focusCard }: TimelineEventCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4, rootMargin: "-10% 0px" });
  const progress = total > 1 ? index / (total - 1) : 1;

  const assignRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      registerNode(index, node);
    },
    [index, ref, registerNode],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === "j") {
        event.preventDefault();
        focusCard(Math.min(total - 1, index + 1));
      }
      if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === "k") {
        event.preventDefault();
        focusCard(Math.max(0, index - 1));
      }
      if (event.key === "Home") {
        event.preventDefault();
        focusCard(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        focusCard(total - 1);
      }
    },
    [focusCard, index, total],
  );

  return (
    <article
      ref={assignRef}
      data-active={inView}
      className="timeline-card glass-panel relative overflow-hidden p-6 shadow-[0_16px_40px_rgba(12,16,24,0.45)]"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute left-0 top-0 h-full w-[6px] rotate-180"
        style={{
          background: `linear-gradient(180deg, rgba(35,230,255,0.65) 0%, rgba(255,47,185,0.65) ${Math.round(
            progress * 100,
          )}%, transparent 100%)`,
        }}
      />
      <p className="pl-5 text-sm uppercase tracking-[0.24em] text-[color:var(--color-text-secondary)]">{event.year}</p>
      <h3
        className="pl-5 pt-3 text-2xl text-[color:var(--color-text-primary)]"
        style={{ fontFamily: "var(--font-space-grotesk)" }}
      >
        {event.title}
      </h3>
      <p className="pl-5 pt-2 text-sm text-[color:var(--color-text-secondary)]">{event.detail}</p>
    </article>
  );
}

export function TimelineSection({
  events,
  anchorId,
  notebookPreviewHref,
  notebookDownloadHref,
}: TimelineSectionProps) {
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  const registerNode = useCallback((index: number, node: HTMLDivElement | null) => {
    nodesRef.current[index] = node;
  }, []);

  const focusCard = useCallback((index: number) => {
    const target = nodesRef.current[index];
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);
  return (
    <section id={anchorId ?? "history"} className="section-boundary">
      <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-14 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col gap-6">
          <p className="section-title">Chapter 1 - History of AI</p>
          <h2 className="section-heading">
            Timeline of breakthroughs with scaling laws front and center.
          </h2>
          <p className="section-body">
            Scroll-activated cards animate into view as you narrate each milestone. The scaling law panel shows
            <span className="math-inline">
              <InlineMath math={"L(N, D, C) \\propto N^{-a} + D^{-b} + C^{-c}"} />
            </span>
            with plain-English caveats and hover detail.
          </p>
          <p className="caption">
            What to look for: Emphasize the interplay between compute, data, and architecture - note where trends plateau.
          </p>
          <NotebookLaunch
            topic="history"
            eyebrow="Extend the Narrative"
            title="Open the Scaling Laws Notebook"
            description="Keep the slide energy while offering a deep-dive detour that reproduces every curve and derivation used in this chapter."
            previewHref={notebookPreviewHref ?? "/notebooks/scaling-laws.html"}
            downloadHref={notebookDownloadHref ?? "/notebooks/scaling-laws.ipynb"}
          />
        </div>
        <div className="relative grid gap-5">
          <span className="pointer-events-none absolute left-[12px] top-0 hidden h-full w-[2px] bg-[linear-gradient(180deg,rgba(35,230,255,0.4),rgba(255,47,185,0.4))] lg:block" />
          {events.map((event, index) => (
            <TimelineEventCard
              key={event.id}
              event={event}
              index={index}
              total={events.length}
              registerNode={registerNode}
              focusCard={focusCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
