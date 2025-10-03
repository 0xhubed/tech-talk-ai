"use client";

import { useCallback, useState } from "react";
import { BlockMath } from "react-katex";

export type MathCopyBlockProps = {
  expression: string;
  label?: string;
};

export function MathCopyBlock({ expression, label = "Copy formula" }: MathCopyBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.warn("Failed to copy KaTeX expression", error);
    }
  }, [expression]);

  return (
    <div className="math-copy-block" data-copied={copied}>
      <BlockMath math={expression} />
      <button type="button" className="math-copy-block__button" onClick={handleCopy} aria-label={label}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
