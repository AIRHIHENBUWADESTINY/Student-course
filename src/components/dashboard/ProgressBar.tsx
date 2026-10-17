interface ProgressBarProps {
  value: number;
  className?: string;
  colorClass?: string;
  size?: "sm" | "md";
  label?: string;
}

export default function ProgressBar({
  value,
  className = "",
  colorClass = "bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400",
  size = "md",
  label = "Progress",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${height} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
