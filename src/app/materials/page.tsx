"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, GraduationCap, Layers, Loader2 } from "lucide-react";
import { materialsApi } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ProgressBar from "@/components/dashboard/ProgressBar";
import SearchInput from "@/components/ui/SearchInput";
import StatCard from "@/components/dashboard/StatCard";
import type { MaterialCourseSummary } from "@/types";

export default function LearningMaterialsPage() {
  const [courses, setCourses] = useState<MaterialCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    let active = true;
    materialsApi
      .list()
      .then((data) => {
        if (active) setCourses(data);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load your learning materials."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = Array.from(
    new Set(courses.map((course) => course.category).filter(Boolean))
  ).sort();

  const filtered = courses.filter((course) => {
    const query = search.trim().toLowerCase();
    const matchesQuery =
      !query ||
      course.title.toLowerCase().includes(query) ||
      (course.department ?? "").toLowerCase().includes(query);
    const matchesCategory = category === "all" || course.category === category;
    return matchesQuery && matchesCategory;
  });

  const totalLessons = courses.reduce((sum, c) => sum + c.lessonCount, 0);
  const completedLessons = courses.reduce(
    (sum, c) => sum + c.completedCount,
    0
  );
  const completeCount = courses.filter(
    (c) => c.lessonCount > 0 && c.percent === 100
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
          <BookOpen className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Learning Materials</h1>
          <p className="text-sm text-slate-500">
            Read the study notes for the courses you registered for.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-20 text-sm text-slate-500 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your materials...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No learning materials yet"
          description="Register for courses and their study materials will appear here automatically."
          action={
            <Link href="/catalogue" className="inline-flex h-10 items-center rounded-lg bg-emerald-400 px-4 text-sm font-medium text-emerald-950 transition hover:bg-emerald-300">
              Go to Course Catalogue
            </Link>
          }
        />
      ) : (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Courses with materials"
              value={courses.length}
              description="From your registered courses"
              icon={BookOpen}
              accent="blue"
            />
            <StatCard
              label="Lessons available"
              value={totalLessons}
              description="Across your courses"
              icon={Layers}
              accent="sky"
            />
            <StatCard
              label="Lessons completed"
              value={`${completedLessons} / ${totalLessons}`}
              description={`${completeCount} course${completeCount === 1 ? "" : "s"} fully read`}
              icon={GraduationCap}
              accent="emerald"
            />
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search your courses..."
              className="sm:max-w-xs"
              ariaLabel="Search learning materials"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses match your filters"
              description="Try a different search term or category."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => (
                <article
                  key={course.courseId}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone="blue">{course.category}</Badge>
                    {course.available && course.percent === 100 && (
                      <Badge tone="emerald">Completed</Badge>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {course.department ?? "General"}
                    {course.level ? ` · ${course.level}` : ""}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {course.available
                          ? `${course.lessonCount} lessons`
                          : "Materials coming soon"}
                      </span>
                      {course.available && (
                        <span className="font-medium text-slate-600">
                          {course.completedCount}/{course.lessonCount} ·{" "}
                          {course.percent}%
                        </span>
                      )}
                    </div>
                    <ProgressBar
                      value={course.percent}
                      size="sm"
                      label={`${course.title} reading progress`}
                    />
                  </div>

                  <div className="mt-5 flex-1" />
                  {course.available ? (
                    <Link
                      href={`/materials/${course.courseId}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-4 text-sm font-medium text-emerald-950 transition hover:bg-emerald-300"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read Materials
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-400">
                      <Clock className="h-4 w-4" />
                      Coming soon
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
