"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type FullScreenCardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  enableFullscreen?: boolean;
};

export function FullScreenCard({ children, className = "", title = "Panel", enableFullscreen = true }: FullScreenCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const body = document.body as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    setIsSupported(
      typeof body.requestFullscreen === "function" || typeof body.webkitRequestFullscreen === "function",
    );

    const handleChange = () => {
      const node = containerRef.current;
      setIsFullscreen(document.fullscreenElement === node);
    };

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const requestFullScreen = useCallback(() => {
    const node = containerRef.current;
    if (!node) return;

    const exitFullscreen = () => {
      const doc = document as Document & {
        webkitExitFullscreen?: () => void;
      };
      if (typeof doc.exitFullscreen === "function") {
        doc.exitFullscreen().catch(() => {
          /* ignore */
        });
      } else if (typeof doc.webkitExitFullscreen === "function") {
        try {
          doc.webkitExitFullscreen();
        } catch {
          /* ignore */
        }
      }
    };

    if (document.fullscreenElement === node) {
      exitFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      const element = node as HTMLElement & {
        webkitRequestFullscreen?: () => void;
      };
      if (typeof element.requestFullscreen === "function") {
        element.requestFullscreen().catch(() => {
          /* ignore */
        });
        return;
      }
      if (typeof element.webkitRequestFullscreen === "function") {
        try {
          element.webkitRequestFullscreen();
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fullscreen-card ${className}`.trim()}
      data-fullscreen={isFullscreen}
    >
      {enableFullscreen && isSupported ? (
        <div className="fullscreen-card__controls">
          <button type="button" onClick={requestFullScreen} aria-label={isFullscreen ? `Exit full screen ${title}` : `Enter full screen ${title}`}>
            {isFullscreen ? "Exit full screen" : "Full screen"}
          </button>
        </div>
      ) : null}
      <div className="fullscreen-card__body">{children}</div>
    </div>
  );
}
