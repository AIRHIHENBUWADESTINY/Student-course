"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Trash2,
  Wallet,
} from "lucide-react";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import { MAX_CREDIT_UNITS } from "@/lib/academics";
import { formatNaira } from "@/lib/format";
import type { Registration } from "@/types";

export default function RegistrationsPage() {
  const reg = useRegistration();
  const { toast } = useToast();
  const [removing, setRemoving] = useState<Registration | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { summary, registrations, portal } = reg;
  const registrationClosed = portal !== null && !portal.registrationOpen;
  const submitted = summary.status === "submitted" && summary.count > 0;
  const overLimit = summary.totalCreditUnits > MAX_CREDIT_UNITS;
  const totalPrice = registrations.reduce(
    (sum, item) => sum + (item.course?.price ?? 0),
    0
  );

  const handleRemove = async () => {
    if (!removing) return;
    setBusyId(removing.courseId);
    try {
      await reg.remove(removing.courseId);
      setRemoving(null);
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not remove the course.",
        "error"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async () => {
    await reg.submit();
    setSubmitOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-400 text-white">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold title-gradient">
              My Registered Courses
            </h1>
            <p className="text-sm text-slate-500">
              {summary.session} · {summary.semester}
            </p>
          </div>
        </div>
        {submitted ? (
          <Badge tone="emerald">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Registration submitted
          </Badge>
        ) : (
          <Badge tone="amber">Draft — not submitted</Badge>
        )}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered Courses"
          value={summary.count}
          description="In your current basket"
          icon={ClipboardList}
          accent="blue"
        />
        <StatCard
          label="Total Credit Units"
          value={`${summary.totalCreditUnits} / ${MAX_CREDIT_UNITS}`}
          description={`Maximum ${MAX_CREDIT_UNITS} per semester`}
          icon={BookOpenCheck}
          accent={overLimit ? "amber" : "emerald"}
        />
        <StatCard
          label="Total Course Fee"
          value={formatNaira(totalPrice)}
          description="Sum of the fees for your courses"
          icon={Wallet}
          accent="sky"
        />
        <StatCard
          label="Registration Status"
          value={submitted ? "Submitted" : summary.count > 0 ? "Draft" : "Empty"}
          description={
            registrationClosed ? "Portal closed" : "Portal open for changes"
          }
          icon={CheckCircle2}
          accent="violet"
        />
      </section>

      {overLimit && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            You have exceeded the {MAX_CREDIT_UNITS} credit unit limit. Remove
            some courses before submitting.
          </p>
        </div>
      )}

      {registrations.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No courses registered yet"
          description="Browse the course catalogue and add the courses for your department and level."
          action={
            <Link href="/catalogue" className={buttonClasses("primary", "md")}>
              Go to Course Catalogue
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Course title</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Type</th>
                <th className="px-4 py-3 text-center font-medium">Units</th>
                <th className="px-4 py-3 text-right font-medium">Fee</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {item.course?.courseCode || "---"}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {item.course?.title ?? "Course unavailable"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.course?.department ?? ""}
                      {item.course ? " · Beginner" : ""}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge tone={item.course?.courseType === "Elective" ? "sky" : "blue"}>
                      {item.course?.courseType ?? "Core"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                    {item.course?.creditUnits ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    {formatNaira(item.course?.price)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {item.course && (
                        <Link
                          href={`/courses/${item.course.id}`}
                          className={buttonClasses("ghost", "sm")}
                          title="View course notes"
                        >
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          View
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                          registrationClosed ||
                          busyId === item.courseId ||
                          submitted
                        }
                        onClick={() => setRemoving(item)}
                        title={
                          submitted
                            ? "Submitted registrations cannot be changed"
                            : "Remove course"
                        }
                      >
                        {busyId === item.courseId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 text-sm font-semibold text-slate-700">
                <td className="px-4 py-3" colSpan={3}>
                  Totals
                </td>
                <td className="px-4 py-3 text-center">
                  {summary.totalCreditUnits}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNaira(totalPrice)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {registrations.length > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <p className="text-sm text-slate-500">
            {submitted
              ? "Your registration has been submitted and is awaiting review."
              : registrationClosed
                ? "Registration is closed. You cannot submit or change courses."
                : "Review your courses carefully before submitting. Once submitted, you cannot make changes online."}
          </p>
          <Button
            onClick={() => setSubmitOpen(true)}
            disabled={
              registrationClosed ||
              submitted ||
              registrations.length === 0 ||
              overLimit
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            {submitted ? "Submitted" : "Submit registration"}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        title="Remove course"
        description={
          removing
            ? `Remove "${removing.course?.title ?? "this course"}" from your registration?`
            : ""
        }
        confirmLabel="Remove course"
      />

      <ConfirmDialog
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onConfirm={handleSubmit}
        title="Submit registration"
        tone="primary"
        description={`You are about to submit ${summary.count} course(s) totaling ${summary.totalCreditUnits} credit units for ${summary.session} ${summary.semester}. Do you want to continue?`}
        confirmLabel="Submit registration"
      />
    </div>
  );
}
