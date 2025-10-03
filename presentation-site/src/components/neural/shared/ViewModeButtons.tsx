"use client";

interface ViewMode {
  id: string;
  label: string;
}

interface ViewModeButtonsProps {
  modes: ViewMode[];
  active: string;
  onChange: (mode: string) => void;
}

export function ViewModeButtons({ modes, active, onChange }: ViewModeButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
      <span className="uppercase tracking-[0.22em]">View</span>
      {modes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          className={`rounded-full border px-4 py-2 transition ${
            active === mode.id
              ? "border-[rgba(35,230,255,0.6)] bg-[rgba(35,230,255,0.2)] text-white"
              : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
          }`}
          onClick={() => onChange(mode.id)}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
