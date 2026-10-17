"use client";

import type { ActivityPoint } from "@/lib/progress";

export default function LearningActivityChart({
  data,
}: {
  data: ActivityPoint[];
}) {
  const max = Math.max(...data.map((point) => point.count), 1);
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div>
      <div className="flex items-end justify-between gap-2 sm:gap-3">
        {data.map((point) => {
          const heightPct = point.count === 0 ? 4 : (point.count / max) * 100;
          return (
            <div
              key={point.label + point.isToday}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-semibold text-slate-500">
                {point.count > 0 ? point.count : ""}
              </span>
              <div className="flex h-32 w-full items-end justify-center rounded-lg bg-slate-50 px-1.5">
                <div
                  className={`w-full rounded-md transition-all duration-500 ${
                    point.isToday
                      ? "bg-gradient-to-t from-blue-600 to-teal-400"
                      : "bg-gradient-to-t from-slate-300 to-slate-200"
                  }`}
                  style={{ height: `${heightPct}%` }}
                  title={`${point.label}: ${point.count} lesson${
                    point.count === 1 ? "" : "s"
                  }`}
                />
              </div>
              <span
                className={`text-xs ${
                  point.isToday
                    ? "font-semibold text-blue-600"
                    : "text-slate-400"
                }`}
              >
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-700">{total}</span> lesson
        {total === 1 ? "" : "s"} completed in the last 7 days.
      </p>
    </div>
  );
}
