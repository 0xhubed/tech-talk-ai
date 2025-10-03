import Link from "next/link";

export type NotebookLaunchProps = {
  topic: string;
  eyebrow: string;
  title: string;
  description: string;
  previewHref?: string;
  downloadHref?: string;
};

const defaultHrefFor = (topic: string, type: "preview" | "download") => {
  const sanitized = topic.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  if (type === "preview") {
    return `/notebooks/${sanitized}`;
  }
  return `/notebooks/${sanitized}.ipynb`;
};

export function NotebookLaunch({
  topic,
  eyebrow,
  title,
  description,
  previewHref,
  downloadHref,
}: NotebookLaunchProps) {
  const preview = previewHref ?? defaultHrefFor(topic, "preview");
  const download = downloadHref ?? defaultHrefFor(topic, "download");

  return (
    <div className="glass-panel relative overflow-hidden p-7">
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: "linear-gradient(135deg, rgba(35,230,255,0.22), rgba(255,47,185,0.18))" }}
      />
      <div className="relative flex flex-col gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text-secondary)]">{eyebrow}</span>
        <h3
          className="text-2xl text-[color:var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[color:var(--color-text-secondary)]">{description}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={preview} className="button-primary" prefetch={false}>
            Open preview
          </Link>
          <Link href={download} className="button-secondary" prefetch={false}>
            Download .ipynb
          </Link>
        </div>
        <p className="caption text-[color:var(--color-text-muted)]">
          Preview opens an in-browser reader; download delivers the full notebook to run locally or in the cloud.
        </p>
      </div>
    </div>
  );
}
