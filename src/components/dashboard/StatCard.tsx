import type { LucideIcon } from "lucide-react";
import { getAccent } from "@/lib/theme";
import type { AccentKey } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  accent?: AccentKey;
}

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "blue",
}: StatCardProps) {
  const style = getAccent(accent);
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${style.gradient}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </div>
  );
}
