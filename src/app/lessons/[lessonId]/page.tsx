"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ListChecks,
  Loader2,
  Lock,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Button, { buttonClasses } from "@/components/ui/Button";
import { lessonsApi } from "@/lib/api";
import { getLessonStatus } from "@/lib/progress";
import type { LessonDetail } from "@/types";

export default function LessonDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const {
    progress,
    profile,
    setLessonStatus,
    toggleLessonComplete,
    getCourse,
    getLesson,
  } = useProgress();
  const reg = useRegistration();
  const { toast } = useToast();
  const [registering, setRegistering] = useState(false);

  const lesson = getLesson(params.lessonId);
  const course = lesson ? getCourse(lesson.courseId) : undefined;

  const canAccess = Boolean(
    course &&
      (reg.isRegistered(course.id) ||
        Boolean(course.ownerId) ||
        profile.role === "admin")
  );
  const registrationClosed =
    reg.portal !== null && !reg.portal.registrationOpen;

  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [contentState, setContentState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!lesson || !canAccess) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setDetail(null);
      setContentState("ready");
      setContentError(null);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    let cancelled = false;
    setContentState("loading");
    setContentError(null);

    lessonsApi
      .get(lesson.id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setContentState("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setContentError(
          cause instanceof Error
            ? cause.message
            : "Could not load this lesson's content."
        );
        setContentState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [lesson, canAccess]);

  const handleRegister = async () => {
    if (!course) return;
    setRegistering(true);
    try {
      await reg.register(course.id);
    } catch (cause) {
      toast(
        cause instanceof Error
          ? cause.message
          : "Could not register for the course.",
        "error"
      );
    } finally {
      setRegistering(false);
    }
  };

  if (!lesson) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Lesson not found"
        description="The lesson you are looking for does not exist or has been removed."
        action={
          <Link href="/lessons" className={buttonClasses("primary", "md")}>
            Back to lessons
          </Link>
        }
      />
    );
  }

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course unavailable"
        description="This lesson is not linked to a valid course."
      />
    );
  }

  if (!canAccess) {
    return (
      <div className="space-y-5">
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {course.title}
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Lesson locked
          </h1>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            You must register for {course.title} before you can read its lesson
            materials.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => void handleRegister()}
              disabled={registering || registrationClosed}
            >
              {registering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {registrationClosed
                ? "Registration closed"
                : "Register for this course"}
            </Button>
            <Link href="/catalogue" className={buttonClasses("outline", "md")}>
              Go to Course Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = getLessonStatus(progress, lesson.id);
  const isComplete = status === "completed";

  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const prevLesson = index > 0 ? course.lessons[index - 1] : undefined;
  const nextLesson =
    index < course.lessons.length - 1 ? course.lessons[index + 1] : undefined;

  const handleComplete = () => {
    toggleLessonComplete(lesson.id);
    toast(`"${lesson.title}" marked as complete`);
  };

  const handleInProgress = () => {
    setLessonStatus(lesson.id, "in-progress");
    toast(`"${lesson.title}" marked as in progress`, "info");
  };

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/courses"
          className="transition hover:text-blue-600"
        >
          Courses
        </Link>
        <span>/</span>
        <Link
          href={`/courses/${course.id}`}
          className="transition hover:text-blue-600"
        >
          {course.title}
        </Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Lesson {lesson.order}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <BookOpen className="h-3.5 w-3.5" />
                {course.title}
              </span>
              <StatusBadge status={status} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {lesson.order}. {lesson.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {lesson.duration} min estimated
              </span>
              <span className="inline-flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" />
                Lesson {lesson.order} of {course.lessons.length}
              </span>
            </div>

            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-600">
              {lesson.summary}
            </p>

            <div className="mt-6">
              {contentState === "loading" ? (
                <div
                  className="flex items-center gap-2 text-sm text-slate-500"
                  aria-live="polite"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading lesson content…
                </div>
              ) : contentState === "error" ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {contentError}
                </div>
              ) : detail?.text ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {detail.text}
                </div>
              ) : (detail?.content ?? lesson.content).length > 0 ? (
                <div className="space-y-4">
                  {(detail?.content ?? lesson.content).map((paragraph, i) => (
                    <p key={i} className="text-sm leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  This lesson&apos;s content has not been published yet. Please
                  check back soon.
                </div>
              )}
            </div>

            {isComplete && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Lesson completed
                  </p>
                  <p className="text-xs text-emerald-700">
                    Great work! Your course progress has been updated and saved
                    automatically.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              {isComplete ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    toggleLessonComplete(lesson.id);
                    toast(`"${lesson.title}" marked as not complete`, "info");
                  }}
                >
                  Mark as not complete
                </Button>
              ) : (
                <>
                  <Button onClick={handleComplete}>
                    <Check className="h-4 w-4" />
                    Mark as complete
                  </Button>
                  {status !== "in-progress" && (
                    <Button variant="outline" onClick={handleInProgress}>
                      <Clock className="h-4 w-4" />
                      Mark as in progress
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {prevLesson ? (
              <Link
                href={`/lessons/${prevLesson.id}`}
                className={buttonClasses("outline", "md", "justify-start")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="truncate">Previous: {prevLesson.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {nextLesson && (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className={buttonClasses(
                  "primary",
                  "md",
                  "justify-between sm:justify-end"
                )}
              >
                <span className="truncate">Next: {nextLesson.title}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Course lessons
            </h2>
            <ul className="mt-3 space-y-1">
              {course.lessons.map((item) => {
                const itemStatus = getLessonStatus(progress, item.id);
                const isCurrent = item.id === lesson.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/lessons/${item.id}`}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition ${
                        isCurrent
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                          itemStatus === "completed"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {itemStatus === "completed" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          item.order
                        )}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Instructor
            </h2>
            <p className="mt-2 text-sm text-slate-600">{course.instructor}</p>
            <p className="mt-1 text-xs text-slate-400">
              {course.category} · {course.level}
            </p>
            <Link
              href={`/courses/${course.id}`}
              className={buttonClasses("secondary", "sm", "mt-4 w-full")}
            >
              View course
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
