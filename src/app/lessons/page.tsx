"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, SearchX } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import LessonItem from "@/components/dashboard/LessonItem";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { getLessonStatus } from "@/lib/progress";
import type { Course } from "@/types";

type StatusFilter = "all" | "not-started" | "in-progress" | "completed";

export default function LessonsPage() {
  const { progress, courses, lessons, getCourse, profile } = useProgress();
  const reg = useRegistration();
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const canAccess = useCallback(
    (course: Course) =>
      reg.isRegistered(course.id) ||
      Boolean(course.ownerId) ||
      profile.role === "admin",
    [reg, profile.role]
  );

  const accessibleCourses = useMemo(
    () => courses.filter(canAccess),
    [courses, canAccess]
  );

  const accessibleLessons = useMemo(
    () =>
      lessons.filter((lesson) => {
        const course = getCourse(lesson.courseId);
        return Boolean(course && canAccess(course));
      }),
    [lessons, getCourse, canAccess]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return accessibleLessons.filter((lesson) => {
      const course = getCourse(lesson.courseId);
      const lessonStatus = getLessonStatus(progress, lesson.id);
      const matchesQuery =
        !term ||
        lesson.title.toLowerCase().includes(term) ||
        lesson.summary.toLowerCase().includes(term) ||
        (course?.title.toLowerCase().includes(term) ?? false);
      const matchesCourse = courseId === "all" || lesson.courseId === courseId;
      const matchesStatus = status === "all" || lessonStatus === status;
      return matchesQuery && matchesCourse && matchesStatus;
    });
  }, [accessibleLessons, progress, query, courseId, status, getCourse]);

  const resetFilters = () => {
    setQuery("");
    setCourseId("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
          <ListChecks className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Lessons</h1>
          <p className="text-sm text-slate-500">
            Browse every lesson across your courses and track your status.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search lessons..."
          className="w-full lg:max-w-sm"
        />
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            aria-label="Filter by course"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All courses</option>
            {accessibleCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Filter by status"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All statuses</option>
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:ml-auto"
          >
            Reset
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">{filtered.length}</span>{" "}
        of {accessibleLessons.length} lessons
      </p>

      {accessibleLessons.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No lessons yet"
          description="Register for courses and their lessons will appear here. Courses without listed lessons can still be read as study material."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/catalogue" className={buttonClasses("primary", "md")}>
                Go to Course Catalogue
              </Link>
              <Link href="/materials" className={buttonClasses("outline", "md")}>
                Read Study Materials
              </Link>
            </div>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No lessons found"
          description="Try a different search term, course, or status filter."
          action={
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg bg-blue-400 px-4 py-2 text-sm font-medium text-blue-950 transition hover:bg-blue-300"
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((lesson) => {
            const course = getCourse(lesson.courseId);
            if (!course) return null;
            return (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                course={course}
                showCourse
                completedAt={progress[lesson.id]?.completedAt ?? null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
