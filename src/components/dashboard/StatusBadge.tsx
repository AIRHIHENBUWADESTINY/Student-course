import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { LessonStatus } from "@/types";

const config: Record<
  LessonStatus,
  { label: string; classes: string; icon: typeof Circle }
> = {
  "not-started": {
    label: "Not Started",
    classes: "bg-slate-100 text-slate-600 ring-slate-200",
    icon: Circle,
  },
  "in-progress": {
    label: "In Progress",
    classes: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
};

export default function StatusBadge({ status }: { status: LessonStatus }) {
  const { label, classes, icon: Icon } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
