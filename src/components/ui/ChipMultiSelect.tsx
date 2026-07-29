import { Check } from 'lucide-react';

interface ChipOption {
  value: string;
  label: string;
}

interface ChipMultiSelectProps {
  options: ChipOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function ChipMultiSelect({ options, selected, onChange }: ChipMultiSelectProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => toggle(option.value)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-brand-blue-600 bg-brand-blue-600 text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
