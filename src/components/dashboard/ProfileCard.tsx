"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Cake,
  CheckCircle2,
  GraduationCap,
  Mail,
  Pencil,
  Target,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  ACADEMIC_LEVELS,
  ACADEMIC_SESSIONS,
  FACULTIES,
  getDepartments,
} from "@/lib/academics";
import { getDashboardStats } from "@/lib/progress";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfileCard() {
  const { profile, updateProfile, progress, courses, lessons } = useProgress();
  const { summary } = useRegistration();
  const { toast } = useToast();
  const stats = getDashboardStats(courses, lessons, progress);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(profile);
  const [error, setError] = useState<string | null>(null);

  const formDepartments = useMemo(
    () => (form.faculty ? getDepartments(form.faculty) : []),
    [form.faculty]
  );

  const openModal = () => {
    setForm(profile);
    setError(null);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      dateOfBirth: form.dateOfBirth,
      bio: form.bio.trim(),
      goal: form.goal.trim(),
      matricNumber: form.matricNumber.trim(),
      faculty: form.faculty,
      department: form.department,
      level: form.level,
      session: form.session,
    });
    setOpen(false);
    toast("Profile updated successfully");
  };

  const academicLine = [profile.faculty, profile.department, profile.level]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-teal-500" />
      <div className="px-6 pb-6">
        <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm">
              {initials(profile.name)}
            </span>
            <div className="pb-1">
              <h2 className="text-xl font-semibold text-slate-900">
                {profile.name}
              </h2>
              <p className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-4 w-4" />
                {profile.email}
              </p>
              {academicLine && (
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <GraduationCap className="h-4 w-4" />
                  {academicLine}
                </p>
              )}
              {profile.dateOfBirth && (
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Cake className="h-4 w-4" />
                  {profile.dateOfBirth}
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={openModal}>
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <p className="mt-5 max-w-2xl text-sm text-slate-600">{profile.bio}</p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <Target className="h-4 w-4" />
          <span className="font-medium">Goal:</span>
          {profile.goal}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {summary.count}
              </p>
              <p className="text-xs text-slate-500">
                Registered courses · {summary.totalCreditUnits} units
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {stats.completedLessons}
              </p>
              <p className="text-xs text-slate-500">Lessons completed</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit profile"
        description="Update your basic account details."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profile-name"
              className="block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <input
              id="profile-name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-matric"
                className="block text-sm font-medium text-slate-700"
              >
                Matric number
              </label>
              <input
                id="profile-matric"
                value={form.matricNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    matricNumber: event.target.value,
                  }))
                }
                placeholder="e.g. CSC/2023/001"
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label
                htmlFor="profile-level"
                className="block text-sm font-medium text-slate-700"
              >
                Level
              </label>
              <select
                id="profile-level"
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Not set</option>
                {ACADEMIC_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="profile-faculty"
                className="block text-sm font-medium text-slate-700"
              >
                Faculty
              </label>
              <select
                id="profile-faculty"
                value={form.faculty}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    faculty: event.target.value,
                    department: "",
                  }))
                }
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Not set</option>
                {FACULTIES.map((faculty) => (
                  <option key={faculty.name} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="profile-department"
                className="block text-sm font-medium text-slate-700"
              >
                Department
              </label>
              <select
                id="profile-department"
                value={form.department}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
                disabled={!form.faculty}
                className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Not set</option>
                {formDepartments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="profile-session"
              className="block text-sm font-medium text-slate-700"
            >
              Academic session
            </label>
            <select
              id="profile-session"
              value={form.session}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  session: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {ACADEMIC_SESSIONS.map((session) => (
                <option key={session} value={session}>
                  {session}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="profile-date-of-birth"
              className="block text-sm font-medium text-slate-700"
            >
              Date of birth
            </label>
            <input
              id="profile-date-of-birth"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dateOfBirth: event.target.value,
                }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label
              htmlFor="profile-bio"
              className="block text-sm font-medium text-slate-700"
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={form.bio}
              onChange={(event) =>
                setForm((current) => ({ ...current, bio: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label
              htmlFor="profile-goal"
              className="block text-sm font-medium text-slate-700"
            >
              Learning goal
            </label>
            <input
              id="profile-goal"
              value={form.goal}
              onChange={(event) =>
                setForm((current) => ({ ...current, goal: event.target.value }))
              }
              className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
