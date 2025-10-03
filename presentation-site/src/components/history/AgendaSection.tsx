import type { AgendaItem } from "@/lib/sections";

export type AgendaSectionProps = {
  items: AgendaItem[];
};

export function AgendaSection({ items }: AgendaSectionProps) {
  return (
    <section id="agenda" className="section-boundary">
      <div className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-10 px-6 lg:px-8">
        <div>
          <p className="section-title">Agenda at a Glance</p>
          <h2 className="section-heading">
            Guide your audience through a carefully staged narrative.
          </h2>
          <p className="section-body">
            Four themed chapters—history, policy, machine learning foundations, and AI agents—each ship with interactive
            anchors, live charts, and quick-jump navigation. An on-page timeline keeps the session moving at a comfortable
            pace.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.label}
              className="glass-panel h-full p-6 transition-transform duration-150 hover:-translate-y-1"
            >
              <h3
                className="text-xl text-[color:var(--color-text-primary)]"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                {item.label}
              </h3>
              <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
