"use client";

import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  CircleDashed,
  TrendingUp,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import StatCard from "@/components/dashboard/StatCard";
import ProgressBar from "@/components/dashboard/ProgressBar";
import LearningActivityChart from "@/components/dashboard/LearningActivityChart";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { getAccent } from "@/lib/theme";
import {
  countCompletedThisWeek,
  getAllCourseStats,
  getCompletedEntries,
  getDashboardStats,
  getWeeklyActivity,
} from "@/lib/progress";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export default function ProgressPage() {
  const { progress, courses, lessons } = useProgress();
  const stats = getDashboardStats(courses, lessons, progress);
  const courseStats = getAllCourseStats(courses, progress);
  const activity = getWeeklyActivity(progress);
  const weeklyCount = countCompletedThisWeek(progress);
  const recent = getCompletedEntries(lessons, courses, progress).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Learning Progress</h1>
          <p className="text-sm text-slate-500">
            Track your completion across every course and lesson.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-3">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-500">
            Overall completion
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
            {stats.overallPercent}%
          </p>
          <div className="mt-4">
            <ProgressBar
              value={stats.overallPercent}
              colorClass="bg-gradient-to-r from-indigo-500 to-blue-600"
              label="Overall completion"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {stats.completedLessons} of {stats.totalLessons} lessons completed
          </p>
        </div>
        <div className="lg:col-span-2 lg:border-l lg:border-slate-100 lg:pl-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Weekly learning activity
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
              <TrendingUp className="h-3.5 w-3.5" />
              {weeklyCount} this week
            </span>
          </div>
          <LearningActivityChart data={activity} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${stats.overallPercent}%`}
          description="Across all courses"
          icon={TrendingUp}
          accent="indigo"
        />
        <StatCard
          label="Lessons Completed"
          value={stats.completedLessons}
          description="Total finished"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          label="Remaining Lessons"
          value={stats.remainingLessons}
          description="Left to complete"
          icon={CircleDashed}
          accent="amber"
        />
        <StatCard
          label="Completed This Week"
          value={weeklyCount}
          description="In the last 7 days"
          icon={BarChart3}
          accent="violet"
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Progress by course
        </h2>
        <div className="space-y-3">
          {courseStats.map((item) => {
            const accent = getAccent(item.course.accent);
            return (
              <div
                key={item.course.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/courses/${item.course.id}`}
                    className="text-sm font-semibold text-slate-900 transition hover:text-indigo-600"
                  >
                    {item.course.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      {item.completed}/{item.total} lessons
                    </span>
                    <span className={`font-semibold ${accent.text}`}>
                      {item.percent}%
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={item.percent}
                    colorClass={accent.bar}
                    label={`${item.course.title} progress`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recently completed lessons
        </h2>
        {recent.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No completed lessons yet"
            description="Once you mark lessons as complete, they will appear here."
            action={
              <Link href="/courses" className={buttonClasses("primary", "md")}>
                Browse courses
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {recent.map((entry) => (
              <div
                key={entry.lesson.id}
                className="flex items-center gap-3 p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/lessons/${entry.lesson.id}`}
                    className="block truncate text-sm font-medium text-slate-800 transition hover:text-indigo-600"
                  >
                    {entry.lesson.title}
                  </Link>
                  <p className="truncate text-xs text-slate-400">
                    {entry.course.title}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {formatDate(entry.completedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
