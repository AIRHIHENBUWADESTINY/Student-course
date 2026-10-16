"use client";

import Link from "next/link";
import { Check, Clock, PlayCircle, RotateCcw } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { getLessonStatus } from "@/lib/progress";
import { getAccent } from "@/lib/theme";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { buttonClasses } from "@/components/ui/Button";
import type { Course, Lesson } from "@/types";

interface LessonItemProps {
  lesson: Lesson;
  course: Course;
  showCourse?: boolean;
  completedAt?: string | null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function LessonItem({
  lesson,
  course,
  showCourse = false,
  completedAt,
}: LessonItemProps) {
  const { progress, toggleLessonComplete } = useProgress();
  const { toast } = useToast();
  const status = getLessonStatus(progress, lesson.id);
  const accent = getAccent(course.accent);
  const isComplete = status === "completed";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
            isComplete ? "bg-emerald-50 text-emerald-600" : `${accent.soft}`
          }`}
        >
          {isComplete ? (
            <Check className="h-5 w-5" />
          ) : (
            String(lesson.order).padStart(2, "0")
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {lesson.title}
            </h3>
            <StatusBadge status={status} />
          </div>
          {showCourse && (
            <p className={`mt-0.5 text-xs font-medium ${accent.text}`}>
              {course.title}
            </p>
          )}
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {lesson.summary}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {lesson.duration} min
            </span>
            {isComplete && completedAt && (
              <span>Completed {formatDate(completedAt)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            toggleLessonComplete(lesson.id);
            toast(
              isComplete
                ? `"${lesson.title}" marked as not complete`
                : `"${lesson.title}" marked as complete`,
              isComplete ? "info" : "success"
            );
          }}
          className={buttonClasses(
            isComplete ? "ghost" : "secondary",
            "sm",
            "flex-1 sm:flex-none"
          )}
          aria-label={
            isComplete
              ? `Mark ${lesson.title} as not complete`
              : `Mark ${lesson.title} as complete`
          }
        >
          {isComplete ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Undo
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Mark done
            </>
          )}
        </button>
        <Link
          href={`/lessons/${lesson.id}`}
          className={buttonClasses("outline", "sm", "flex-1 sm:flex-none")}
        >
          <PlayCircle className="h-4 w-4" />
          {isComplete ? "Review" : "Open"}
        </Link>
      </div>
    </div>
  );
}
