"use client";

interface VCRControlsProps {
  current: number;
  total: number;
  onStep: (step: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  isPlaying?: boolean;
}

export function VCRControls({
  current,
  total,
  onStep,
  onPlay,
  onPause,
  onReset,
  isPlaying = false,
}: VCRControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onStep(0)}
        disabled={current === 0}
        className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        title="First"
      >
        ◄◄
      </button>
      <button
        type="button"
        onClick={() => onStep(Math.max(0, current - 1))}
        disabled={current === 0}
        className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        title="Previous"
      >
        ◄
      </button>

      <span className="text-sm text-[color:var(--color-text-secondary)] min-w-[80px] text-center">
        Step {current + 1}/{total}
      </span>

      <button
        type="button"
        onClick={() => onStep(Math.min(total - 1, current + 1))}
        disabled={current === total - 1}
        className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        title="Next"
      >
        ►
      </button>
      <button
        type="button"
        onClick={() => onStep(total - 1)}
        disabled={current === total - 1}
        className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-30 disabled:cursor-not-allowed transition text-sm"
        title="Last"
      >
        ►►
      </button>

      {(onPlay || onPause) && (
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="px-4 py-2 rounded-lg border border-[rgba(35,230,255,0.4)] bg-[rgba(35,230,255,0.1)] hover:bg-[rgba(35,230,255,0.2)] transition text-sm"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] transition text-sm"
          title="Reset"
        >
          ↻
        </button>
      )}
    </div>
  );
}
