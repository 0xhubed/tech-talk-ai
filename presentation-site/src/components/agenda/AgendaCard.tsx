import Link from "next/link";
import type { ChapterDefinition } from "@/lib/sections";

export type AgendaCardProps = {
  chapter: ChapterDefinition;
};

export function AgendaCard({ chapter }: AgendaCardProps) {
  const paddedOrder = chapter.order.toString().padStart(2, "0");
  const primaryNotebook = chapter.notebooks[0];
  const canOpenNotebook = chapter.id !== "history" && Boolean(primaryNotebook);

  return (
    <article className="glass-panel relative flex h-full flex-col gap-5 p-6 transition-transform duration-150 hover:-translate-y-1">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(35,230,255,0.12),transparent_70%)]" />
      <div className="relative flex flex-1 flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
          Chapter {paddedOrder}
        </span>
        <h3
          className="text-2xl text-[color:var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {chapter.title}
        </h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">{chapter.teaser}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
          {chapter.presenters.length === 1
            ? `Presented by ${chapter.presenters[0]}`
            : `Presented by ${chapter.presenters.join(" • ")}`}
        </p>
      </div>
      <div className="relative mt-auto flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap gap-3">
          <Link className="button-primary text-sm" href={chapter.chapterHref} prefetch={false}>
            View chapter
          </Link>
          {canOpenNotebook && primaryNotebook ? (
            <Link
              className="button-secondary text-sm"
              href={primaryNotebook.previewHref}
              prefetch={false}
              target="_blank"
              rel="noreferrer"
            >
              Open notebook
            </Link>
          ) : null}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
          {chapter.tagline}
        </p>
      </div>
    </article>
  );
}
