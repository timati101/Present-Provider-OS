interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="flex items-center gap-3" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#0f1d36]/10">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="flex-shrink-0 text-xs font-medium text-gray-500 tabular-nums">
        {label ?? `${clamped}% complete`}
      </span>
    </div>
  );
}
