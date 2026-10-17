"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  LogOut,
  Menu,
  PlayCircle,
  Search,
  User,
  X,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { initials } from "@/components/dashboard/ProfileCard";
import { getCompletedEntries } from "@/lib/progress";

export default function TopNavbar({
  onOpenMobile,
}: {
  onOpenMobile: () => void;
}) {
  const { profile, progress, courses, lessons, getCourse } = useProgress();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return { courses: [], lessons: [] };
    return {
      courses: courses
        .filter(
          (course) =>
            course.title.toLowerCase().includes(term) ||
            course.description.toLowerCase().includes(term) ||
            course.instructor.toLowerCase().includes(term) ||
            course.category.toLowerCase().includes(term)
        )
        .slice(0, 4),
      lessons: lessons
        .filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(term) ||
            lesson.summary.toLowerCase().includes(term)
        )
        .slice(0, 5),
    };
  }, [query, courses, lessons]);

  const notifications = useMemo(() => {
    const recent = getCompletedEntries(lessons, courses, progress).slice(0, 4);
    const items = recent.map((entry) => ({
      id: entry.lesson.id,
      title: `Completed "${entry.lesson.title}"`,
      body: entry.course.title,
      href: `/lessons/${entry.lesson.id}`,
    }));
    items.push({
      id: "tip",
      title: "Keep your streak going",
      body: "Complete one more lesson this week to stay on track.",
      href: "/lessons",
    });
    return items;
  }, [progress, lessons, courses]);

  const firstName = profile.name.split(" ")[0] || "Student";
  const hasResults =
    results.courses.length > 0 || results.lessons.length > 0;

  const closeAll = () => {
    setSearchOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    toast("You have been logged out", "info");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-slate-900">
            Welcome back, {firstName}!
          </p>
          <p className="truncate text-xs text-slate-500">
            Here is your learning overview for today.
          </p>
        </div>

        <div className="relative ml-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search courses and lessons..."
            aria-label="Search courses and lessons"
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {searchOpen && query.trim() && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSearchOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 right-0 top-12 z-20 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                {!hasResults && (
                  <p className="px-3 py-6 text-center text-sm text-slate-500">
                    No courses or lessons match &ldquo;{query}&rdquo;.
                  </p>
                )}
                {results.courses.length > 0 && (
                  <div className="mb-1">
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Courses
                    </p>
                    {results.courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        onClick={() => {
                          setQuery("");
                          closeAll();
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50"
                      >
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span className="flex-1">
                          <span className="block font-medium text-slate-800">
                            {course.title}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {course.category} · {course.instructor}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {results.lessons.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Lessons
                    </p>
                    {results.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        onClick={() => {
                          setQuery("");
                          closeAll();
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-50"
                      >
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                        <span className="flex-1">
                          <span className="block font-medium text-slate-800">
                            {lesson.title}
                          </span>
                          <span className="block text-xs text-slate-400">
                            {getCourse(lesson.courseId)?.title}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((value) => !value);
              setMenuOpen(false);
            }}
            className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setNotifOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-12 z-20 w-80 max-w-[85vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Notifications
                  </p>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {notifications.length} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-800">
                          {item.title}
                        </span>
                        <span className="block text-xs text-slate-400">
                          {item.body}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMenuOpen((value) => !value);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-slate-100"
            aria-label="Account menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials(profile.name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-slate-800">
                {profile.name}
              </span>
              <span className="block text-xs text-slate-400">Student</span>
            </span>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {profile.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <Search className="h-4 w-4 text-slate-400" />
                  Preferences
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
