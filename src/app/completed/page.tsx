"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, SearchX } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import LessonItem from "@/components/dashboard/LessonItem";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";
import { getCompletedEntries } from "@/lib/progress";

export default function CompletedPage() {
  const { progress, courses, lessons, profile } = useProgress();
  const reg = useRegistration();
  const [query, setQuery] = useState("");
  const entries = useMemo(
    () =>
      getCompletedEntries(lessons, courses, progress).filter(
        (entry) =>
          reg.isRegistered(entry.course.id) ||
          Boolean(entry.course.ownerId) ||
          profile.role === "admin"
      ),
    [lessons, courses, progress, reg, profile.role]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter(
      (entry) =>
        entry.lesson.title.toLowerCase().includes(term) ||
        entry.course.title.toLowerCase().includes(term)
    );
  }, [entries, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold title-gradient">
            Completed Lessons
          </h1>
          <p className="text-sm text-slate-500">
            {entries.length} lesson{entries.length === 1 ? "" : "s"} completed so
            far. Great job!
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No completed lessons yet"
          description="Mark a lesson as complete and it will show up here with the completion date."
          action={
            <Link href="/lessons" className={buttonClasses("primary", "md")}>
              Go to lessons
            </Link>
          }
        />
      ) : (
        <>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search completed lessons..."
            className="w-full sm:max-w-sm"
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching lessons"
              description={`No completed lessons match "${query}".`}
              action={
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-lg bg-blue-400 px-4 py-2 text-sm font-medium text-blue-950 transition hover:bg-brand-dark"
                >
                  Clear search
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((entry) => (
                <LessonItem
                  key={entry.lesson.id}
                  lesson={entry.lesson}
                  course={entry.course}
                  showCourse
                  completedAt={entry.completedAt}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
