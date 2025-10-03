import Link from "next/link";
import type { ReactNode } from "react";
import { AgendaRail } from "@/components/agenda/AgendaRail";
import { NotebookLaunch } from "@/components/notebooks/NotebookLaunch";
import type { ChapterDefinition } from "@/lib/sections";

export type ChapterLayoutProps = {
  chapter: ChapterDefinition;
  children: ReactNode;
};

export function ChapterLayout({ chapter, children }: ChapterLayoutProps) {
  const visibleNotebooks = chapter.id === "history" ? [] : chapter.notebooks;
  const hasNotebooks = visibleNotebooks.length > 0;
  const introGridClass = [
    "mx-auto grid w-full max-w-[var(--max-width)] gap-10 px-6 lg:px-8",
    hasNotebooks ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-primary)]">
      <AgendaRail currentId={chapter.id} />
      <main className="flex flex-col gap-16 pb-20">
        <section className="section-boundary">
          <div className={introGridClass}>
            <div className="flex flex-col gap-5">
              <span className="badge w-fit">Chapter {chapter.order.toString().padStart(2, "0")}</span>
              <h1 className="section-heading text-balance text-[clamp(2.4rem,5vw,3.4rem)]">{chapter.title}</h1>
              <p className="section-body text-balance">{chapter.summary}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                <span>Speakers</span>
                {chapter.presenters.map((presenter) => (
                  <span
                    key={`${chapter.id}-${presenter}`}
                    className="rounded-full border border-[rgba(255,255,255,0.18)] px-3 py-1 text-[color:var(--color-text-primary)]"
                  >
                    {presenter}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="button-secondary" href="/" prefetch={false}>
                  Return to agenda
                </Link>
                {chapter.studio ? (
                  <a
                    className="button-secondary"
                    href={chapter.studio.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {chapter.studio.label}
                  </a>
                ) : null}
              </div>
              <p className="caption text-[color:var(--color-text-muted)]">{chapter.tagline}</p>
            </div>
            {hasNotebooks ? (
              <aside className="flex flex-col gap-5">
                {visibleNotebooks.map((notebook) => (
                  <NotebookLaunch
                    key={notebook.id}
                    topic={notebook.id}
                    eyebrow={notebook.eyebrow}
                    title={notebook.title}
                    description={notebook.description}
                    previewHref={notebook.previewHref}
                    downloadHref={notebook.downloadHref}
                  />
                ))}
              </aside>
            ) : null}
          </div>
        </section>

        <section className="section-boundary">
          <div className="mx-auto w-full max-w-[var(--max-width)] px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)]">
                Chapter outline
              </span>
              {chapter.sections.map((section) => (
                <a
                  key={section.id}
                  className="rounded-full border border-[rgba(255,255,255,0.14)] px-4 py-2 text-sm text-[color:var(--color-text-secondary)] transition hover:border-[rgba(255,255,255,0.28)]"
                  href={`#${section.id}`}
                >
                  {section.title}
                </a>
              ))}
            </div>
            <p className="mt-3 max-w-3xl text-sm text-[color:var(--color-text-secondary)]">
              {chapter.sections[0]?.description ?? "Navigate sections as needed during the live narration."}
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-16">{children}</div>
      </main>
    </div>
  );
}
