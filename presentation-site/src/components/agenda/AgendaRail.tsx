import Link from "next/link";
import type { ChapterId } from "@/lib/sections";
import { chapters } from "@/lib/sections";

export type AgendaRailProps = {
  currentId?: ChapterId | null;
  className?: string;
};

export function AgendaRail({ currentId = null, className }: AgendaRailProps) {
  return (
    <nav
      className={`sticky top-0 z-30 bg-[color:var(--color-bg-primary)]/92 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg-primary)]/78 ${className ?? ""}`.trim()}
      aria-label="Chapter navigation"
    >
      <div className="mx-auto flex w-full max-w-[var(--max-width)] items-center gap-2 px-6 py-4 text-sm text-[color:var(--color-text-secondary)] lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 transition hover:border-[rgba(255,255,255,0.28)]"
        >
          Agenda Hub
        </Link>
        {chapters.map((chapter) => {
          const isActive = chapter.id === currentId;
          return (
            <Link
              key={chapter.id}
              href={chapter.chapterHref}
              prefetch={false}
              className={`rounded-full border px-4 py-2 transition ${
                isActive
                  ? "border-[rgba(255,47,185,0.6)] bg-[rgba(255,47,185,0.16)] text-[color:var(--color-text-primary)]"
                  : "border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.28)]"
              }`}
            >
              <span className="mr-2 text-xs uppercase tracking-[0.28em]">{chapter.order.toString().padStart(2, "0")}</span>
              {chapter.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
