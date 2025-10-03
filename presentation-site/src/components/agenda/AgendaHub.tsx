import type { ChapterDefinition } from "@/lib/sections";
import { AgendaCard } from "@/components/agenda/AgendaCard";

export type AgendaHubProps = {
  chapters: ChapterDefinition[];
};

export function AgendaHub({ chapters }: AgendaHubProps) {
  return (
    <section id="agenda" className="section-boundary">
      <div className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-12 px-6 lg:px-8">
        <header className="flex flex-col gap-4 text-balance">
          <span className="badge w-fit">Presentation Roadmap</span>
          <h1 className="section-heading text-[clamp(2.4rem,5vw,3.4rem)]">
            Four chapters connect history, policy, ML foundations, and live agents into one narrative.
          </h1>
          <p className="section-body max-w-3xl">
            Set the stage with the historical timeline, align stakeholders on policy guardrails, then move into the
            machine learning demos and agent sandbox. Each card opens its chapter while the notebook buttons launch the
            matching labs for deeper exploration.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {chapters.map((chapter) => (
            <AgendaCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </div>
    </section>
  );
}
