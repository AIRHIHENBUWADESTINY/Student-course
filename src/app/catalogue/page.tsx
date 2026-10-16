"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { SEMESTERS } from "@/lib/academics";
import { formatNaira } from "@/lib/format";
import type { Course, Semester } from "@/types";

function matchesStudent(course: Course, profile: { department: string; level: string }) {
  const deptMatch = !profile.department || course.department === profile.department;
  const levelMatch = !profile.level || course.level === profile.level;
  return deptMatch && levelMatch;
}

export default function CataloguePage() {
  const { courses, profile } = useProgress();
  const reg = useRegistration();
  const { toast } = useToast();

  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      courses
        .filter((course) => course.semester === reg.semester)
        .sort((a, b) =>
          (a.courseCode ?? a.title).localeCompare(b.courseCode ?? b.title)
        ),
    [courses, reg.semester]
  );

  const grouped = useMemo(() => {
    const buckets = new Map<string, Course[]>();
    for (const course of filtered) {
      const key = course.category?.trim() || course.department || "General";
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.push(course);
      } else {
        buckets.set(key, [course]);
      }
    }
    return Array.from(buckets.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
  }, [filtered]);

  const toggleRegistration = async (course: Course) => {
    setBusyId(course.id);
    try {
      if (reg.isRegistered(course.id)) {
        await reg.remove(course.id);
      } else {
        await reg.register(course.id);
      }
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not update registration.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const registrationClosed =
    reg.portal !== null && !reg.portal.registrationOpen;

  const renderCard = (course: Course) => {
    const registered = reg.isRegistered(course.id);
    const available =
      course.registrationStatus !== "Closed" && !registrationClosed;
    const forYou = matchesStudent(course, profile);
    const busy = busyId === course.id;
    return (
      <div
        key={course.id}
        className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600">
                {course.courseCode || "---"}
              </span>
              <Badge tone={course.courseType === "Core" ? "indigo" : "sky"}>
                {course.courseType ?? "Core"}
              </Badge>
              {forYou && <Badge tone="emerald">For you</Badge>}
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-900">
              {course.title}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold text-slate-900">
              {formatNaira(course.price)}
            </p>
            <p className="text-xs text-slate-400">course fee</p>
            <p className="mt-1 text-xs text-slate-500">
              {course.creditUnits ?? 0} credit units
            </p>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {course.description}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
          <div>
            <dt className="font-medium text-slate-400">Department</dt>
            <dd>{course.department ?? "General"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Level</dt>
            <dd>{course.level}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Semester</dt>
            <dd>{course.semester ?? "First Semester"}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-400">Status</dt>
            <dd>
              {course.registrationStatus === "Closed"
                ? "Closed"
                : registrationClosed
                  ? "Portal closed"
                  : "Available"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <span className="min-w-0 truncate text-xs text-slate-400">
            {course.instructor || "Unassigned"}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/courses/${course.id}`}
              className={buttonClasses("ghost", "sm")}
              title="Open course"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            {registered ? (
              <Button
                variant="outline"
                size="sm"
                disabled={busy || registrationClosed}
                onClick={() => void toggleRegistration(course)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-600" />
                )}
                Registered
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={busy || !available}
                onClick={() => void toggleRegistration(course)}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {available ? "Register" : "Unavailable"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Course Catalogue</h1>
            <p className="text-sm text-slate-500">
              Browse and register courses for {reg.summary.session}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="catalogue-semester" className="sr-only">
            Semester
          </label>
          <select
            id="catalogue-semester"
            value={reg.semester}
            onChange={(event) => reg.setSemester(event.target.value as Semester)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            {SEMESTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {registrationClosed && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            Course registration is currently <strong>closed</strong>. You can
            browse the catalogue but cannot add or remove courses until an
            administrator reopens registration.
          </p>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="No courses are available for this semester. Try a different semester."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {category}
                </h2>
                <span className="text-xs text-slate-400">
                  {items.length} course{items.length === 1 ? "" : "s"}
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {items.map(renderCard)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
