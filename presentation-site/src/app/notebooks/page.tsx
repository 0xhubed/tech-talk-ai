import Link from "next/link";
import { notebookResources } from "@/lib/notebooks";

export default function NotebooksPage() {
  return (
    <main className="section-boundary">
      <div className="mx-auto flex w-full max-w-[var(--max-width)] flex-col gap-10 px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <p className="section-title">Notebook Companion Library</p>
          <h1 className="section-heading text-balance">
            Launch interactive labs that mirror the presentation chapters.
          </h1>
          <p className="section-body">
            Every notebook shares datasets, seeds, and prompt templates with the live site to keep rehearsal and delivery
            in sync. Download the raw `.ipynb` files or skim the HTML previews directly in the browser before you hand
            control back to the stage experience.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {notebookResources.map((resource) => (
            <article
              key={resource.id}
              className="glass-panel relative overflow-hidden p-6"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,47,185,0.16),transparent_70%)]" />
              <div className="relative flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                    {resource.topic === "history"
                      ? "History"
                      : resource.topic === "neural"
                        ? "Machine Learning Foundations"
                        : "AI Agents"}
                  </p>
                  <h2
                    className="text-xl text-[color:var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {resource.title}
                  </h2>
                </div>
                <p className="text-sm text-[color:var(--color-text-secondary)]">{resource.blurb}</p>
                {resource.studioHint ? (
                  <p className="text-xs text-[color:var(--color-attention)]">{resource.studioHint}</p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Link className="button-primary text-sm" href={resource.htmlPreviewPath} prefetch={false}>
                    Preview notebook
                  </Link>
                  <Link
                    className="button-secondary text-sm"
                    href={resource.notebookPath}
                    prefetch={false}
                    download
                  >
                    Download `.ipynb`
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="glass-panel relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(35,230,255,0.14),transparent_75%)]" />
          <div className="relative flex flex-col gap-3">
            <h2
              className="text-lg text-[color:var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Tips for a Smooth Handoff
            </h2>
            <ul className="list-disc pl-5 text-sm text-[color:var(--color-text-secondary)]">
              <li>Preload the HTML preview before clicking &quot;Open Notebook&quot; on stage to avoid buffer delays.</li>
              <li>Share LangGraph Studio traces when explaining planner-tool hops, then mirror the steps inside the notebook.</li>
              <li>Use the copy-to-clipboard formula buttons on the main site to keep math consistent with notebook markdown cells.</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-[color:var(--color-text-secondary)]">
          <Link className="button-secondary" href="/" prefetch={false}>
            Return to presentation site
          </Link>
        </div>
      </div>
    </main>
  );
}
