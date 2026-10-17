"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  Loader2,
  Lock,
} from "lucide-react";
import { ApiError, materialsApi } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import ProgressBar from "@/components/dashboard/ProgressBar";
import MaterialContent from "@/components/materials/MaterialContent";
import { useToast } from "@/components/providers/ToastProvider";
import type { MaterialDetail } from "@/types";

type PageState = "loading" | "ready" | "error";

export default function CourseMaterialPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [state, setState] = useState<PageState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadedCourseId, setLoadedCourseId] = useState(courseId);

  // Reset to a loading state during render when the route's course changes,
  // instead of setting state synchronously inside the effect below.
  if (loadedCourseId !== courseId) {
    setLoadedCourseId(courseId);
    setMaterial(null);
    setState("loading");
    setError(null);
    setErrorStatus(null);
    setActiveIndex(0);
  }

  useEffect(() => {
    let active = true;
    materialsApi
      .get(courseId)
      .then((data) => {
        if (!active) return;
        setMaterial(data);
        const firstIncomplete = data.lessons.findIndex(
          (lesson) => data.progress[lesson.id] !== "completed"
        );
        setActiveIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
        setState("ready");
      })
      .catch((cause) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load this course's materials."
        );
        setErrorStatus(cause instanceof ApiError ? cause.status : null);
        setState("error");
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  const lessons = material?.lessons ?? [];
  const activeLesson = lessons[activeIndex];
  const lessonCount = lessons.length;
  const completedCount = material
    ? lessons.filter((lesson) => material.progress[lesson.id] === "completed")
        .length
    : 0;
  const percent =
    lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const isActiveCompleted = Boolean(
    material && activeLesson && material.progress[activeLesson.id] === "completed"
  );

  const goTo = (index: number) => {
    if (index < 0 || index >= lessonCount) return;
    setActiveIndex(index);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleComplete = async () => {
    if (!material || !activeLesson || saving) return;
    setSaving(true);
    try {
      const progress = await materialsApi.setLesson(
        courseId,
        activeLesson.id,
        !isActiveCompleted
      );
      setMaterial((prev) => (prev ? { ...prev, progress } : prev));
      toast(
        isActiveCompleted
          ? "Marked as not completed."
          : "Lesson marked as completed.",
        "success"
      );
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not update progress.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-24 text-sm text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading course materials...
      </div>
    );
  }

  if (state === "error" || !material) {
    const notRegistered = errorStatus === 403;
    return (
      <div className="space-y-5">
        <BackLink />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
            {notRegistered ? (
              <Lock className="h-7 w-7" />
            ) : (
              <BookOpen className="h-7 w-7" />
            )}
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            {notRegistered ? "Registration required" : "Materials unavailable"}
          </h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {error ?? "Something went wrong loading these materials."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/catalogue" className={buttonClasses("primary", "md")}>
              Go to Course Catalogue
            </Link>
            <Link href="/materials" className={buttonClasses("outline", "md")}>
              My Learning Materials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BackLink />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="blue">{material.category}</Badge>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {material.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {material.department ?? "General"}
              {material.level ? ` · ${material.level}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
            <GraduationCap className="h-5 w-5" />
            <div>
              <p className="text-lg font-semibold leading-none">{percent}%</p>
              <p className="text-xs">
                {completedCount} of {lessonCount} lessons
              </p>
            </div>
          </div>
        </div>
        <ProgressBar
          value={percent}
          className="mt-5"
          label={`${material.title} reading progress`}
        />
      </section>

      {material.overview && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            About this course
          </h2>
          <div className="mt-3">
            <MaterialContent markdown={material.overview} />
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Lessons
            </p>

            <select
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 lg:hidden"
              value={activeIndex}
              aria-label="Select a lesson"
              onChange={(event) => goTo(Number(event.target.value))}
            >
              {lessons.map((lesson, index) => (
                <option key={lesson.id} value={index}>
                  {index + 1}. {lesson.title}
                </option>
              ))}
            </select>

            <ol className="mt-3 hidden space-y-1 lg:block">
              {lessons.map((lesson, index) => {
                const done =
                  material.progress[lesson.id] === "completed";
                const active = index === activeIndex;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                        active
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <span>
                        <span className="text-xs text-slate-400">
                          Lesson {index + 1}
                        </span>
                        <span className="block">{lesson.title}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        <main ref={contentRef} className="space-y-5">
          {activeLesson ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Lesson {activeIndex + 1} of {lessonCount}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {activeLesson.title}
              </h2>
              <div className="mt-5">
                <MaterialContent markdown={activeLesson.content} />
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                <Button
                  variant="outline"
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant={isActiveCompleted ? "secondary" : "primary"}
                  onClick={toggleComplete}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isActiveCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  {isActiveCompleted ? "Completed" : "Mark as Completed"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex >= lessonCount - 1}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              This course does not have any lessons yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/materials"
      className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to My Courses
    </Link>
  );
}
