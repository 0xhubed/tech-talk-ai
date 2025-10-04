import Link from "next/link";
import { AgendaHub } from "@/components/agenda/AgendaHub";
import { LandingExperience } from "@/components/landing/LandingExperience";
import { chapters } from "@/lib/sections";

export default function Home() {
  return (
    <LandingExperience>
      <div className="relative min-h-screen overflow-hidden bg-[color:var(--color-bg-primary)]">
        <div className="glow-ring glow-ring--cyan" style={{ top: "-200px", right: "-140px" }} />
        <div className="glow-ring glow-ring--magenta" style={{ bottom: "-240px", left: "-180px" }} />

      <header className="relative z-10 mx-auto flex w-full max-w-[var(--max-width)] items-center justify-between px-6 py-8 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.06)] shadow-[0_12px_32px_rgba(8,12,20,0.45)]" />
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)] leading-tight">LEONTEQ</p>
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-text-secondary)] leading-tight">Tech Talk AI</p>
          </div>
        </div>
        <nav className="hidden items-center gap-3 md:flex" aria-label="Primary">
          <Link className="button-secondary" href="/notebooks" prefetch={false}>
            Open notebooks hub
          </Link>
          <Link className="button-secondary" href="https://github.com/" target="_blank" rel="noreferrer">
            View repo
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col gap-16 pb-20">
        <section className="section-boundary">
          <div className="mx-auto grid w-full max-w-[var(--max-width)] gap-12 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8">
            <div className="flex flex-col gap-6">
              <span className="badge w-fit">Live + Replay Ready</span>
              <h1 className="section-heading text-balance text-[clamp(2.6rem,5vw,3.6rem)]">
                Your comprehensive guide to modern AI—explore, learn, and revisit anytime.
              </h1>
              <p className="section-body text-balance">
                Explore the history of AI breakthroughs, understand policy guardrails, master machine learning foundations
                with real housing data, and experiment with LangGraph agents. Every chapter includes interactive notebooks
                you can run and modify to deepen your understanding.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link className="button-primary" href="/history" prefetch={false}>
                  Start with Chapter 01
                </Link>
                <Link className="button-secondary" href="/notebooks" prefetch={false}>
                  Browse notebooks
                </Link>
                <Link className="button-secondary" href="/agents" prefetch={false}>
                  See the agent sandbox
                </Link>
              </div>
            </div>
            <div className="glass-panel relative overflow-hidden p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(35,230,255,0.16),transparent_75%)]" />
              <div className="relative flex flex-col gap-5">
                <h2
                  className="text-xl text-[color:var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  What’s inside the talk
                </h2>
                <ul className="space-y-3 text-sm text-[color:var(--color-text-secondary)]">
                  {chapters.map((chapter) => (
                    <li key={`hero-${chapter.id}`} className="flex items-start gap-3">
                      <span className="mt-[3px] inline-flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.16)] text-xs text-[color:var(--color-accent)]">
                        {chapter.order.toString().padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-medium text-[color:var(--color-text-primary)]" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                          {chapter.title}
                        </p>
                        <p>{chapter.teaser}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                          {chapter.presenters.length === 1
                            ? `Speaker: ${chapter.presenters[0]}`
                            : `Speakers: ${chapter.presenters.join(" • ")}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <AgendaHub chapters={chapters} />

        <section className="section-boundary">
          <div className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-6 px-6 text-center lg:px-8">
            <h2 className="section-heading text-balance text-[clamp(2rem,4vw,2.6rem)]">
              Launch a chapter, then pivot into its notebook without losing the room.
            </h2>
            <p className="section-body mx-auto max-w-3xl text-balance">
              The dedicated chapter pages keep the key visuals and controls within reach. When it is time to dive deeper,
              the notebook preview opens in a new tab while the chapter stays in place so you can return without losing
              context—during the talk or afterward when revisiting the material.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link className="button-primary" href="/history" prefetch={false}>
                Enter Chapter 01
              </Link>
              <Link className="button-secondary" href="/notebooks" prefetch={false}>
                Browse all notebooks
              </Link>
            </div>
          </div>
        </section>
      </main>

        <footer className="relative z-10 mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-4 px-6 pb-10 text-sm text-[color:var(--color-text-secondary)] lg:px-8">
          <div className="token-divider" />
          <p>This website was built by Daniel Huber using generative AI tool.</p>
        </footer>
      </div>
    </LandingExperience>
  );
}
