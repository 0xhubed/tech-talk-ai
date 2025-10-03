"use client";

interface ParameterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  showValue?: boolean;
  formula?: string;
}

export function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  showValue = true,
  formula,
}: ParameterSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[color:var(--color-text-primary)]">
          {label}
          {showValue && <span className="ml-2 font-mono text-[color:var(--color-accent)]">{value}</span>}
        </label>
        {formula && (
          <span className="text-xs font-mono text-[color:var(--color-text-secondary)]">{formula}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, rgba(35,230,255,0.6) 0%, rgba(35,230,255,0.6) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-[color:var(--color-text-secondary)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
