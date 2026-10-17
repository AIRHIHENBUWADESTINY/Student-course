"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";

type Mode = "signin" | "signup";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Course registration",
    description:
      "Browse your faculty catalogue, add courses and submit your semester registration in minutes.",
  },
  {
    icon: BookOpen,
    title: "Structured lessons",
    description:
      "Every course is broken into clear, ordered lessons so you always know what to study next.",
  },
  {
    icon: BarChart3,
    title: "Progress tracking",
    description:
      "Track completed lessons and credit units across the semester from one simple dashboard.",
  },
  {
    icon: GraduationCap,
    title: "Learning materials",
    description:
      "Open curated course material for each registered course without losing your place.",
  },
];

const STEPS = [
  {
    icon: Compass,
    title: "Create your account",
    description:
      "Sign up with your name, email and date of birth to set up your student profile.",
  },
  {
    icon: CalendarCheck,
    title: "Register your courses",
    description:
      "Pick your faculty, department and level, then add the courses for the semester.",
  },
  {
    icon: TrendingUp,
    title: "Learn and track progress",
    description:
      "Work through lessons, open materials and watch your progress grow each week.",
  },
];

const POINTS = [
  "Built around real university course registration",
  "Clear credit-unit totals before you submit",
  "Materials and lessons in one focused place",
  "A calm, distraction-free study dashboard",
];

function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/icon.png"
        alt="Deeplearn logo"
        width={40}
        height={40}
        className={`${className} rounded-lg shadow-sm`}
        priority
      />
      <span className="text-lg font-bold tracking-tight text-slate-900">
        Deep
        <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          learn
        </span>
      </span>
    </span>
  );
}

export default function LandingPage({
  onSignIn,
}: {
  onSignIn: (mode: Mode) => void;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="transition hover:text-slate-900">
              How it works
            </a>
            <a href="#why" className="transition hover:text-slate-900">
              Why Deeplearn
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => onSignIn("signin")}
            >
              Sign in
            </Button>
            <Button size="sm" onClick={() => onSignIn("signup")}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Learn smarter, not harder
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Your personal hub for{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  deep, focused learning
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Deeplearn brings your course registration, lessons, materials and
                progress together in one calm dashboard — so you can spend less
                time organising and more time actually learning.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => onSignIn("signup")}>
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onSignIn("signin")}
                >
                  I already have an account
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  No credit card needed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  Set up in under a minute
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      My semester
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    Registration open
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { code: "CSC 301", title: "Data Structures", units: 3, done: 78 },
                    { code: "CSC 305", title: "Operating Systems", units: 3, done: 45 },
                    { code: "MTH 341", title: "Linear Algebra", units: 2, done: 62 },
                  ].map((course) => (
                    <div
                      key={course.code}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-800">
                          {course.code}
                        </span>
                        <span className="text-slate-400">
                          {course.units} units
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {course.title}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500"
                          style={{ width: `${course.done}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2.5 text-sm">
                  <span className="font-medium text-blue-800">
                    Total credit units
                  </span>
                  <span className="font-bold text-blue-800">8</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Lesson complete
                  </p>
                  <p className="text-xs text-slate-500">Keep the streak going</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-slate-100 bg-slate-50/70 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need to learn with intent
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Deeplearn replaces scattered notes and spreadsheets with one
                focused workspace for your courses.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight">
                Up and running in three steps
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                From sign-up to your first completed lesson, Deeplearn keeps the
                path short and clear.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <span className="absolute right-6 top-6 text-4xl font-extrabold text-slate-100">
                    {index + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="why"
          className="border-y border-slate-100 bg-slate-50/70 py-16 sm:py-20"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Positioned for real student life
              </h2>
              <p className="mt-3 text-lg text-slate-600">
                Deeplearn is built for students who want structure without the
                clutter — a single, reliable place to plan a semester and study
                every day.
              </p>
              <ul className="mt-6 space-y-3">
                {POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <span className="text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" onClick={() => onSignIn("signup")}>
                  Start learning today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Your learning, in one place
                  </p>
                  <p className="text-xs text-slate-500">
                    Register, study, and track — together
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[
                  { label: "Courses per semester", value: "Up to 12" },
                  { label: "Ordered lessons", value: "Guided" },
                  { label: "Credit tracking", value: "Automatic" },
                  { label: "Materials", value: "Curated" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                  >
                    <p className="text-lg font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-teal-500 px-8 py-12 text-center shadow-xl sm:px-12">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Ready to learn deeper?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-blue-50">
                Create your free Deeplearn account and bring your whole semester
                into focus today.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onSignIn("signup")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 text-base font-medium text-emerald-950 shadow-sm transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSignIn("signin")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/40 px-5 text-base font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <Logo className="h-8 w-8" />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Deeplearn. Learn deeper, every day.
          </p>
        </div>
      </footer>
    </div>
  );
}
