interface StreakCounterProps {
  streak: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StreakCounter({ streak, label, size = "md" }: StreakCounterProps) {
  const isActive = streak > 0;

  const sizeClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const flameSize = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 font-bold transition-all duration-300 ${
        isActive ? `text-amber-500 ${sizeClasses[size]}` : `text-gray-400 ${sizeClasses[size]}`
      }`}
    >
      <span
        className={`inline-block ${flameSize[size]} ${isActive ? "animate-pulse" : ""}`}
        style={isActive ? { animationDuration: "2s" } : undefined}
      >
        🔥
      </span>
      <span className="tabular-nums">{streak}</span>
      {label && (
        <span className={`font-medium ${isActive ? "text-amber-600" : "text-gray-400"}`}>
          {label}
        </span>
      )}
    </span>
  );
}
