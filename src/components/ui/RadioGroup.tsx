interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

export function RadioGroup({ name, options, value, onChange, hasError }: RadioGroupProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              checked
                ? 'border-brand-green-500 bg-brand-green-50 text-brand-green-800'
                : `border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 ${hasError ? 'border-red-300' : ''}`
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
