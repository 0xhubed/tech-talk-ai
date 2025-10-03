"use client";

import { useState } from "react";

export type NotebookLauncherProps = {
  notebookId: string;
  title: string;
  description: string;
  notebookPath: string;
  variant?: "primary" | "secondary";
};

export function NotebookLauncher({
  notebookId,
  title,
  description,
  notebookPath,
  variant = "secondary",
}: NotebookLauncherProps) {
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = () => {
    setIsLaunching(true);

    // Try to open in Jupyter Lab (assumes running on localhost:8888)
    const jupyterUrl = `http://localhost:8888/lab/tree/${encodeURIComponent(notebookPath)}`;
    const newWindow = window.open(jupyterUrl, "_blank");

    // Fallback: Download the notebook if Jupyter isn't running
    setTimeout(() => {
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        // Jupyter not running, provide helpful message
        alert(
          `Jupyter Lab doesn't appear to be running.\n\n` +
          `To launch notebooks:\n` +
          `1. Open terminal\n` +
          `2. Navigate to: presentation-site/maschine learning foundations content\n` +
          `3. Run: jupyter lab\n` +
          `4. Click this button again\n\n` +
          `Or download the notebook and open it manually.`
        );
      }
      setIsLaunching(false);
    }, 1000);
  };

  const buttonClass = variant === "primary"
    ? "button-primary"
    : "button-secondary";

  return (
    <div className="notebook-launcher">
      <div className="glass-panel p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3
              className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              {title}
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)] mb-4">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonClass}
                onClick={handleLaunch}
                disabled={isLaunching}
              >
                {isLaunching ? "Opening..." : "Launch Notebook"}
              </button>
              <a
                href={`/notebooks/${notebookId}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary"
              >
                Preview (HTML)
              </a>
              <a
                href={`/${notebookPath}`}
                download
                className="button-secondary"
              >
                Download .ipynb
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
