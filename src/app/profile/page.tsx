"use client";

import Link from "next/link";
import { useProgress } from "@/components/providers/ProgressProvider";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProgressBar from "@/components/dashboard/ProgressBar";
import Badge from "@/components/ui/Badge";
import { getAccent } from "@/lib/theme";
import { getAllCourseStats } from "@/lib/progress";

export default function ProfilePage() {
  const { progress, profile, courses } = useProgress();
  const courseStats = getAllCourseStats(courses, progress);

  return (
    <div className="space-y-6">
      <ProfileCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Enrolled courses
          </h2>
          <div className="space-y-3">
            {courseStats.map((item) => {
              const accent = getAccent(item.course.accent);
              return (
                <div
                  key={item.course.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/courses/${item.course.id}`}
                      className="text-sm font-semibold text-slate-900 transition hover:text-indigo-600"
                    >
                      {item.course.title}
                    </Link>
                    <span className={`text-xs font-semibold ${accent.text}`}>
                      {item.percent}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar
                      value={item.percent}
                      colorClass={accent.bar}
                      size="sm"
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
            Account details
          </h2>
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Full name
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.name}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="break-all text-sm font-medium text-slate-800">
                {profile.email}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Matric number
              </p>
              <p className="font-mono text-sm font-medium text-slate-800">
                {profile.matricNumber || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Faculty
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.faculty || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Department
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.department || "Not set"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Level
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {profile.level || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Session
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {profile.session || "Not set"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Date of birth
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.dateOfBirth || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Role
              </p>
              <Badge tone={profile.role === "admin" ? "violet" : "indigo"}>
                {profile.role === "admin" ? "Administrator" : "Student"}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Learning goal
              </p>
              <p className="text-sm font-medium text-slate-800">
                {profile.goal}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
