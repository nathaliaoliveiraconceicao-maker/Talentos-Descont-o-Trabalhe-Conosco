interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export function ProgressBar({ currentStep, totalSteps, stepLabel }: ProgressBarProps) {
  const percent = Math.round((currentStep / totalSteps) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
        <span>
          Etapa {currentStep} de {totalSteps}
          {stepLabel ? ` — ${stepLabel}` : ''}
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-green-500 to-brand-yellow-400 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
