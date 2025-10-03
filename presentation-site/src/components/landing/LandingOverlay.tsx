"use client";

import { useEffect, useMemo, useState } from "react";
import { FullScreenCard } from "@/components/ui/FullScreenCard";

function useZurichClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Zurich",
    });

    const update = () => setTime(formatter.format(new Date()));

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return time;
}

export type LandingOverlayProps = {
  onEnterPresentation?: () => void;
};

export function LandingOverlay({ onEnterPresentation }: LandingOverlayProps) {
  const clock = useZurichClock();

  const telemetryMetrics = useMemo(
    () => [
      { label: "Training Loss", value: "0.18", trend: "▼ 0.07", progress: 82, tone: "down" },
      { label: "Accuracy", value: "92.4%", trend: "▲ 1.2%", progress: 92, tone: "up" },
      { label: "Model State", value: "converging", trend: "epoch 247", progress: 68, tone: "neutral" },
    ],
    [],
  );

  const clockLabel = clock ? `Zurich · ${clock}` : "Zurich · --:--:--";

  return (
    <div className="landing-overlay" role="dialog" aria-modal="true" aria-label="Presentation standby">
      <div className="landing-overlay__particles" aria-hidden>
        {Array.from({ length: 48 }).map((_, index) => {
          const seeded = Math.abs(Math.sin((index + 1) * 17.37));
          const phase = Math.abs(Math.cos((index + 4.2) * 11.13));
          const style = {
            left: `${(seeded * 100).toFixed(2)}%`,
            animationDelay: `${(phase * 12).toFixed(2)}s`,
            animationDuration: `${(10 + seeded * 6).toFixed(2)}s`,
          };
          return <span key={`particle-${index}`} className="landing-overlay__particle" style={style} />;
        })}
      </div>
      <div className="landing-overlay__background" aria-hidden>
        <div className="landing-overlay__glow landing-overlay__glow--one" />
        <div className="landing-overlay__glow landing-overlay__glow--two" />
        <div className="landing-overlay__glow landing-overlay__glow--three" />
        <div className="landing-overlay__grid" />
      </div>
      <FullScreenCard className="landing-overlay__card glass-panel" enableFullscreen={false}>
        <div className="landing-overlay__hero">
          <div className="landing-overlay__hero-content">
            <div className="landing-overlay__status-bar">
              <span className="landing-overlay__badge landing-overlay__badge--live">● Live Presentation</span>
              <span className="landing-overlay__time-badge" aria-live="polite">{clockLabel}</span>
            </div>
            <h1 className="landing-overlay__title">
              <span className="landing-overlay__title-main">Tech Talk AI</span>
              <span className="landing-overlay__subtitle">History, Policy, Foundations & Autonomous Agents</span>
            </h1>
            <div className="landing-overlay__presenters">
              <div className="landing-overlay__presenter">
                <div className="landing-overlay__presenter-avatar">FF</div>
                <span className="landing-overlay__presenter-name">Filip Frano</span>
              </div>
              <div className="landing-overlay__presenter">
                <div className="landing-overlay__presenter-avatar">DH</div>
                <span className="landing-overlay__presenter-name">Daniel Huber</span>
              </div>
            </div>
          </div>
          <div className="landing-overlay__viz">
            <div className="landing-overlay__viz-card" role="presentation">
              <div className="landing-overlay__viz-header">
                <span className="landing-overlay__viz-title">System Status</span>
                <span className="landing-overlay__viz-subtitle">Neural Network Training Active</span>
              </div>
              <div className="landing-overlay__viz-body">
                <svg className="landing-overlay__chart" viewBox="0 0 720 220" aria-hidden>
                  <defs>
                    <linearGradient id="viz-gradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(35,230,255,0.85)" />
                      <stop offset="100%" stopColor="rgba(255,47,185,0.85)" />
                    </linearGradient>
                  </defs>
                  <path className="landing-overlay__curve-line landing-overlay__curve-line--primary" d="M20 40 C 160 120, 320 20, 480 120 S 700 60, 700 60" />
                  <path className="landing-overlay__curve-line landing-overlay__curve-line--secondary" d="M20 160 C 200 120, 320 210, 520 140 S 700 180, 700 180" />
                  <path className="landing-overlay__descent" d="M40 40 C 160 30, 300 140, 420 90 S 640 60, 700 100" />
                  <circle className="landing-overlay__descent-node" cx="40" cy="40" r="6" />
                </svg>
                <div className="landing-overlay__pulse-field" aria-hidden>
                  {Array.from({ length: 12 }).map((_, index) => {
                    const base = Math.abs(Math.sin((index + 3) * 9.3));
                    const vertical = Math.abs(Math.cos((index + 2.5) * 7.1));
                    return (
                      <span
                        key={`pulse-${index}`}
                        className="landing-overlay__pulse"
                        style={{
                          left: `${(10 + base * 80).toFixed(2)}%`,
                          animationDelay: `${(index % 6) * 0.6}s`,
                          animationDuration: `${(5.5 + vertical * 2.5).toFixed(2)}s`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="landing-overlay__metrics" role="list">
                {telemetryMetrics.map((metric) => (
                  <div key={metric.label} className="landing-overlay__metric" role="listitem">
                    <div className="landing-overlay__metric-label">
                      <span>{metric.label}</span>
                      <span className={`landing-overlay__metric-trend landing-overlay__metric-trend--${metric.tone}`}>{metric.trend}</span>
                    </div>
                    <div className="landing-overlay__metric-bar" aria-hidden>
                      <div className="landing-overlay__metric-fill" style={{ width: `${metric.progress}%` }} />
                    </div>
                    <span className="landing-overlay__metric-value">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="landing-overlay__content">
          <div className="landing-overlay__agenda">
            <h2>Presentation Agenda</h2>
            <div className="landing-overlay__agenda-grid">
              <div className="landing-overlay__agenda-item">
                <div className="landing-overlay__agenda-number">01</div>
                <div className="landing-overlay__agenda-details">
                  <h3>History of AI</h3>
                  <p className="landing-overlay__agenda-speaker">Filip Frano</p>
                </div>
              </div>
              <div className="landing-overlay__agenda-item">
                <div className="landing-overlay__agenda-number">02</div>
                <div className="landing-overlay__agenda-details">
                  <h3>AI Policy Guardrails</h3>
                  <p className="landing-overlay__agenda-speaker">Filip Frano</p>
                </div>
              </div>
              <div className="landing-overlay__agenda-item">
                <div className="landing-overlay__agenda-number">03</div>
                <div className="landing-overlay__agenda-details">
                  <h3>Machine Learning Foundations</h3>
                  <p className="landing-overlay__agenda-speaker">Daniel Huber</p>
                </div>
              </div>
              <div className="landing-overlay__agenda-item">
                <div className="landing-overlay__agenda-number">04</div>
                <div className="landing-overlay__agenda-details">
                  <h3>Autonomous Agents</h3>
                  <p className="landing-overlay__agenda-speaker">Daniel Huber</p>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-overlay__footer">
            <div className="landing-overlay__cta">
              <button
                type="button"
                className="button-primary button-primary--large"
                onClick={onEnterPresentation}
              >
                <span>Start Presentation</span>
                <span className="landing-overlay__cta-arrow">→</span>
              </button>
              <div className="landing-overlay__secondary-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => window.open("https://github.com/", "_blank")}
                >
                  View Repository
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => window.open("/notebooks", "_blank")}
                >
                  Browse Notebooks
                </button>
              </div>
            </div>
          </div>
        </div>
      </FullScreenCard>
    </div>
  );
}
