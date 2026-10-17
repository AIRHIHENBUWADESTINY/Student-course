"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Clock,
  GraduationCap,
  Layers,
  Loader2,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import LessonItem from "@/components/dashboard/LessonItem";
import ProgressBar from "@/components/dashboard/ProgressBar";
import CourseFormModal from "@/components/dashboard/CourseFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCourseCrud } from "@/components/dashboard/useCourseCrud";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { getCourseStats, getNextLesson } from "@/lib/progress";
import { getAccent, renderCourseIcon } from "@/lib/theme";
import { formatNaira } from "@/lib/format";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { progress, getCourse, profile } = useProgress();
  const reg = useRegistration();
  const { toast } = useToast();
  const crud = useCourseCrud();
  const [registering, setRegistering] = useState(false);
  const course = getCourse(params.courseId);

  if (!course) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Course not found"
        description="The course you are looking for does not exist or has been removed."
        action={
          <Link href="/courses" className={buttonClasses("primary", "md")}>
            Back to courses
          </Link>
        }
      />
    );
  }

  const registered = reg.isRegistered(course.id);
  const canAccess =
    registered || Boolean(course.ownerId) || profile.role === "admin";
  const registrationClosed =
    reg.portal !== null && !reg.portal.registrationOpen;

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await reg.register(course.id);
      toast("Course added to your registration");
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

  const stats = getCourseStats(course, progress);
  const accent = getAccent(course.accent);
  const nextLesson = getNextLesson(course, progress);
  const totalMinutes = course.lessons.reduce(
    (sum, lesson) => sum + lesson.duration,
    0
  );

  const summary = [
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: Clock,
      classes: "bg-amber-50 text-amber-600",
    },
    {
      label: "Not started",
      value: stats.notStarted,
      icon: CircleDashed,
      classes: "bg-slate-100 text-slate-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        {course.ownerId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => crud.openEdit(course)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 hover:border-rose-200 hover:bg-rose-50"
              onClick={() => crud.requestDelete(course)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <section
        className={`overflow-hidden rounded-2xl bg-gradient-to-br ${accent.gradient} p-6 text-white shadow-sm sm:p-8`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                {renderCourseIcon(course.icon, "h-6 w-6")}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {course.courseCode && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium backdrop-blur">
                    {course.courseCode}
                  </span>
                )}
                {course.category && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium backdrop-blur">
                    {course.category}
                  </span>
                )}
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium backdrop-blur">
                  {course.level}
                </span>
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-2 text-sm text-white/85">{course.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              {course.instructor && (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {course.instructor}
                </span>
              )}
              {(course.faculty || course.department) && (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {[course.faculty, course.department]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                {stats.total} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                {formatNaira(course.price)}
              </span>
              {totalMinutes > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {totalMinutes} min total
                </span>
              )}
            </div>
          </div>

          <div className="w-full max-w-xs rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Course progress</span>
              <span className="text-lg font-semibold">{stats.percent}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={stats.percent}
                colorClass="bg-white"
                label={`${course.title} progress`}
              />
            </div>
            {!canAccess ? (
              <div className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/15 text-sm font-medium text-white/90">
                <Lock className="h-4 w-4" />
                Register to access lessons
              </div>
            ) : course.lessons.length === 0 ? (
              <Link
                href={`/materials/${course.id}`}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-slate-800 transition hover:bg-white/90"
              >
                <BookOpen className="h-4 w-4" />
                Read course material
              </Link>
            ) : nextLesson ? (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-slate-800 transition hover:bg-white/90"
              >
                <PlayCircle className="h-4 w-4" />
                {stats.percent === 0 ? "Start course" : "Continue learning"}
              </Link>
            ) : (
              <div className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white/20 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Course completed
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.classes}`}
            >
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {item.value}
              </p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Course lessons</h2>
          <Badge tone="blue">{stats.total} lessons</Badge>
        </div>
        {!canAccess ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Lock className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Lessons are locked
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              You can read about this course, but its lessons are only available
              once you register for it.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
                Back to catalogue
              </Link>
            </div>
          </div>
        ) : course.lessons.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Read this course as study material"
            description="This course does not list individual lessons yet, but its full study material is ready to read."
            action={
              <Link
                href={`/materials/${course.id}`}
                className={buttonClasses("primary", "md")}
              >
                <BookOpen className="h-4 w-4" />
                Read course material
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson) => (
              <LessonItem key={lesson.id} lesson={lesson} course={course} />
            ))}
          </div>
        )}
      </section>

      <CourseFormModal
        key={crud.formKey}
        open={crud.formOpen}
        onClose={crud.closeForm}
        onSubmit={crud.submitForm}
        initial={crud.editing}
      />

      <ConfirmDialog
        open={Boolean(crud.deleting)}
        onClose={crud.closeDelete}
        onConfirm={async () => {
          await crud.confirmDelete();
          router.push("/courses");
        }}
        title="Delete course"
        description={
          crud.deleting
            ? `Are you sure you want to delete "${crud.deleting.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete course"
      />
    </div>
  );
}
