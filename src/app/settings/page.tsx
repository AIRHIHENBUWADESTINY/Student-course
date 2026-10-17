"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Database,
  RefreshCw,
  Settings as SettingsIcon,
  Target,
  Trash2,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useToast } from "@/components/providers/ToastProvider";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { getDashboardStats } from "@/lib/progress";

function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    progress,
    courses,
    lessons,
    resetAllProgress,
    clearAllProgress,
  } = useProgress();
  const { toast } = useToast();
  const stats = useMemo(
    () => getDashboardStats(courses, lessons, progress),
    [courses, lessons, progress]
  );

  const [resetOpen, setResetOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState(String(settings.weeklyGoal));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold title-gradient">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage your preferences and learning data.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-900">
            Notifications
          </h2>
        </div>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <label
                htmlFor="email-notifications"
                className="text-sm font-medium text-slate-800"
              >
                Email notifications
              </label>
              <p className="text-xs text-slate-500">
                Receive updates about new lessons and achievements.
              </p>
            </div>
            <Toggle
              id="email-notifications"
              label="Email notifications"
              checked={settings.emailNotifications}
              onChange={(value) => {
                updateSettings({ emailNotifications: value });
                toast(
                  value
                    ? "Email notifications enabled"
                    : "Email notifications disabled",
                  "info"
                );
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div>
              <label
                htmlFor="weekly-reminder"
                className="text-sm font-medium text-slate-800"
              >
                Weekly reminder
              </label>
              <p className="text-xs text-slate-500">
                Get a nudge each week to keep your streak going.
              </p>
            </div>
            <Toggle
              id="weekly-reminder"
              label="Weekly reminder"
              checked={settings.weeklyReminder}
              onChange={(value) => {
                updateSettings({ weeklyReminder: value });
                toast(
                  value ? "Weekly reminder enabled" : "Weekly reminder disabled",
                  "info"
                );
              }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-900">
            Learning goal
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Set how many lessons you aim to complete each week.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="number"
            min={1}
            max={48}
            value={goalDraft}
            onChange={(event) => setGoalDraft(event.target.value)}
            aria-label="Weekly lesson goal"
            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-32"
          />
          <Button
            variant="secondary"
            onClick={() => {
              const value = Number(goalDraft);
              if (!Number.isFinite(value) || value < 1 || value > 48) {
                toast("Please enter a goal between 1 and 48", "error");
                return;
              }
              updateSettings({ weeklyGoal: Math.round(value) });
              toast("Weekly goal updated");
            }}
          >
            Save goal
          </Button>
          <span className="text-xs text-slate-400">
            Current goal: {settings.weeklyGoal} lessons / week
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold text-slate-900">
            Learning data
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Your progress is stored in this browser. You currently have{" "}
          <span className="font-medium text-slate-700">
            {stats.completedLessons}
          </span>{" "}
          completed lessons.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RefreshCw className="h-4 w-4" />
            Reset to sample data
          </Button>
          <Button variant="danger" onClick={() => setClearOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Clear all progress
          </Button>
        </div>
      </section>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset progress"
        description="This restores the original sample progress (18 completed lessons) and discards your current changes."
        footer={
          <>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                resetAllProgress();
                setResetOpen(false);
                toast("Progress reset to sample data");
              }}
            >
              Reset progress
            </Button>
          </>
        }
      />

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="Clear all progress"
        description="This removes every completed lesson. You will start from a clean slate. This cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setClearOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearAllProgress();
                setClearOpen(false);
                toast("All progress cleared", "info");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Clear everything
            </Button>
          </>
        }
      />
    </div>
  );
}
