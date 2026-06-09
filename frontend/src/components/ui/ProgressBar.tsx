import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "accent" | "success" | "warning";
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  color = "accent",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    accent: "bg-accent",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progression</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-dark-elevated">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
