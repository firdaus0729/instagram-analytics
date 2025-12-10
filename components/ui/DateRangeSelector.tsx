"use client";

interface Props {
  value: number;
  onChange: (days: number) => void;
}

const PRESETS = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 }
];

export function DateRangeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 text-xs">
      {PRESETS.map((preset) => {
        const active = value === preset.value;
        return (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`px-2 py-1 rounded-md ${
              active
                ? "bg-brand-500 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}


