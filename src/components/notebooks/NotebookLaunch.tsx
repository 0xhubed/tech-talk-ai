import Link from "next/link";
import type { NotebookTopic } from "@/lib/notebooks";
import { notebooksByTopic } from "@/lib/notebooks";

export type NotebookLaunchProps = {
  topic: NotebookTopic;
  title: string;
  eyebrow?: string;
  description: string;
};

export function NotebookLaunch({ topic, title, eyebrow, description }: NotebookLaunchProps) {
  const resources = notebooksByTopic(topic);

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(35,230,255,0.18),transparent_65%)]" />
      <div className="relative flex flex-col gap-5">
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">{eyebrow}</p>
        ) : null}
        <div>
          <h3
            className="text-2xl text-[color:var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {title}
          </h3>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">{description}</p>
        </div>
        <div className="grid gap-4">
          {resources.map((resource) => (
            <article
              key={resource.id}
              className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(12,18,26,0.55)] p-5"
            >
              <div className="flex flex-col gap-2">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)]">
                    Notebook
                  </p>
                  <h4
                    className="text-lg text-[color:var(--color-text-primary)]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {resource.title}
                  </h4>
                </div>
                <p className="text-sm text-[color:var(--color-text-secondary)]">{resource.blurb}</p>
                {resource.studioHint ? (
                  <p className="text-xs text-[color:var(--color-attention)]">
                    {resource.studioHint}
                  </p>
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
      </div>
    </div>
  );
}

