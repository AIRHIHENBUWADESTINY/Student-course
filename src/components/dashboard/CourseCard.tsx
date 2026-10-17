"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  Pencil,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { getAccent, renderCourseIcon } from "@/lib/theme";
import { formatNaira } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/dashboard/ProgressBar";
import type { Course, CourseStats } from "@/types";

interface CourseCardProps {
  stats: CourseStats;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

function formatRegisteredDate(value: string): string {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CourseCard({
  stats,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const { course, total, completed, percent } = stats;
  const accent = getAccent(course.accent);
  const totalMinutes = course.lessons.reduce(
    (sum, lesson) => sum + lesson.duration,
    0
  );
  const isComplete = percent === 100;
  const isOwned = Boolean(course.ownerId);
  const hasActions = Boolean(onEdit || onDelete);
  const imageUrl =
    course.imageUrl && /^https?:\/\//i.test(course.imageUrl)
      ? course.imageUrl
      : null;
  const registeredValue = course.startDate ?? course.createdAt ?? null;
  const registered = registeredValue
    ? formatRegisteredDate(registeredValue)
    : "";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br ${accent.gradient}`}
      >
        {imageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${imageUrl}")` }}
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-slate-900/0" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
            {renderCourseIcon(course.icon, "relative h-12 w-12 text-white/95")}
          </>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
          {course.level}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {course.courseCode && <Badge tone="slate">{course.courseCode}</Badge>}
          {course.category && <Badge tone="blue">{course.category}</Badge>}
          {isOwned && <Badge tone="emerald">Your course</Badge>}
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-900">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {course.description}
          </p>
        )}

        {(course.faculty || course.department) && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            {[course.faculty, course.department].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          {course.instructor && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {course.instructor}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {total} lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5" />
            {formatNaira(course.price)}
          </span>
          {totalMinutes > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {totalMinutes} min
            </span>
          )}
          {registered && (
            <span
              className="inline-flex items-center gap-1.5"
              title="Date registered"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {registered}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>
              {completed}/{total} completed
            </span>
            <span className={accent.text}>{percent}%</span>
          </div>
          <ProgressBar
            value={percent}
            colorClass={accent.bar}
            label={`${course.title} progress`}
          />
        </div>

        {hasActions && (
          <div className="mt-4 flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(course)}
                aria-label={`Edit ${course.title}`}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                onClick={() => onDelete(course)}
                aria-label={`Delete ${course.title}`}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}

        <Link
          href={`/courses/${course.id}`}
          className={buttonClasses(
            isComplete ? "outline" : "primary",
            "md",
            "mt-4 w-full"
          )}
        >
          {isComplete ? "Review Course" : "View Course"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
