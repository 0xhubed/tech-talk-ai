"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LandingOverlay } from "@/components/landing/LandingOverlay";

export type LandingExperienceProps = {
  children: ReactNode;
  autoStartDelayMs?: number | null;
};

export function LandingExperience({ children, autoStartDelayMs = 5 * 60 * 1000 }: LandingExperienceProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!autoStartDelayMs) {
      setStartTime(null);
      return;
    }
    setStartTime(new Date(Date.now() + autoStartDelayMs));
  }, [autoStartDelayMs]);

  useEffect(() => {
    if (!startTime) return undefined;

    const diff = startTime.getTime() - Date.now();
    if (diff <= 0) {
      setShowOverlay(false);
      return undefined;
    }

    const timeout = window.setTimeout(() => setShowOverlay(false), diff);
    return () => window.clearTimeout(timeout);
  }, [startTime]);

  return (
    <>
      {showOverlay ? (
        <LandingOverlay onEnterPresentation={() => setShowOverlay(false)} />
      ) : null}
      <div aria-hidden={showOverlay}>{children}</div>
    </>
  );
}
