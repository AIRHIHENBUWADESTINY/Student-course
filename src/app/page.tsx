"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import ChatBot from "@/components/dashboard/ChatBot";
import Button, { buttonClasses } from "@/components/ui/Button";
import {
  COURSE_CATEGORIES,
  COURSE_SUGGESTIONS,
  DEFAULT_CREDIT_UNITS,
  TECHNOLOGY_FACULTY,
} from "@/lib/academics";
import { formatNaira } from "@/lib/format";

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100";
const labelClass = "block text-sm font-medium text-slate-700";

export default function DashboardPage() {
  const { profile, createCourse } = useProgress();
  const reg = useRegistration();

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(String(DEFAULT_CREDIT_UNITS));
  const [price, setPrice] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categoryCourses = category
    ? COURSE_SUGGESTIONS.filter((item) => item.category === category)
    : [];

  const firstName = profile.name.split(" ")[0] || "Student";

  const academicLine = [profile.faculty, profile.department, profile.level]
    .filter(Boolean)
    .join(" · ");

  const registrationStatusLabel = reg.portal?.registrationOpen
    ? "Open"
    : "Closed";
  const submitted = reg.summary.status === "submitted";
  const registrationClosed =
    reg.portal !== null && !reg.portal.registrationOpen;

  const registeredCourses = reg.registrations;
  const totalCreditUnits = reg.summary.totalCreditUnits;
  const totalPrice = registeredCourses.reduce(
    (sum, item) => sum + (item.course?.price ?? 0),
    0
  );

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const units = Number(amount);
    const priceValue = price.trim() === "" ? 0 : Number(price);
    if (!category) {
      setError("Please select a course category.");
      return;
    }
    if (!title) {
      setError("Please select a course from the list.");
      return;
    }
    if (!Number.isInteger(units) || units < 1 || units > 12) {
      setError("Amount must be a whole number between 1 and 12 credit units.");
      return;
    }
    if (!Number.isInteger(priceValue) || priceValue < 0 || priceValue > 10000000) {
      setError("Price must be a whole number between 0 and 10,000,000 naira.");
      return;
    }

    const match = categoryCourses.find((item) => item.title === title);

    setError(null);
    setSubmitting(true);
    try {
      const created = await createCourse({
        title,
        description: match?.description ?? "",
        category,
        faculty: profile.faculty || TECHNOLOGY_FACULTY,
        department: category,
        creditUnits: units,
        price: priceValue,
        semester: reg.summary.semester,
      });
      await reg.register(created.id);
      setCategory("");
      setTitle("");
      setAmount(String(DEFAULT_CREDIT_UNITS));
      setPrice("0");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to add the course."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome session */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-teal-600 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" />
              Student Course Registration
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 text-sm text-blue-100">
              {academicLine || "Set up your academic profile to get started."}
            </p>
            <p className="mt-1 text-xs text-blue-200">
              Matric number: {profile.matricNumber || "Not set"} ·{" "}
              {reg.portal?.session ?? profile.session} · Session
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className={buttonClasses(
                  "secondary",
                  "md",
                  "bg-white text-blue-700 hover:bg-blue-50"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                Browse catalogue
              </Link>
              <Link
                href="/registrations"
                className={buttonClasses(
                  "ghost",
                  "md",
                  "border border-white/30 text-white hover:bg-white/10"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                My registrations
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xs rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Registration window</span>
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    reg.portal?.registrationOpen
                      ? "bg-emerald-300"
                      : "bg-rose-300"
                  }`}
                />
                {registrationStatusLabel}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{reg.summary.count}</p>
                <p className="text-xs text-blue-100">Courses</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-2xl font-bold">{totalCreditUnits}</p>
                <p className="text-xs text-blue-100">Credit units</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-blue-100">
              {submitted
                ? "Your courses are submitted for this semester."
                : "You can still add or remove courses while the window is open."}
            </p>
          </div>
        </div>
      </section>

      {/* Registration assistant chat bot */}
      <ChatBot />

      {/* Add course session */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add course</h2>
            <p className="text-sm text-slate-500">
              Choose a category to see its courses, each tagged with its own
              price, then set the credit units and amount.
            </p>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            View full catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <form onSubmit={handleAdd} className="space-y-4" noValidate>
          <div>
            <label htmlFor="add-category" className={labelClass}>
              Category
            </label>
            <select
              id="add-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setTitle("");
              }}
              required
              className={inputClass}
            >
              <option value="">Select category…</option>
              {COURSE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className={labelClass}>
              {category
                ? `Courses in ${category} (${categoryCourses.length})`
                : "Courses by category"}
            </p>
            {category ? (
              <ul className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {categoryCourses.map((item) => {
                  const selected = title === item.title;
                  return (
                    <li key={item.title}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setTitle(item.title);
                          setPrice(String(item.price));
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition ${
                          selected ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate text-sm font-medium text-slate-800">
                            {item.title}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          {formatNaira(item.price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                Choose a category to see the courses it offers, each tagged with
                its own price.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="add-amount" className={labelClass}>
                Amount (credit units)
              </label>
              <input
                id="add-amount"
                type="number"
                min={1}
                max={12}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="add-price" className={labelClass}>
                Price (₦)
              </label>
              <input
                id="add-price"
                type="number"
                min={0}
                step={500}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {registrationClosed && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Course registration is currently closed, so you cannot add
              courses right now.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || registrationClosed}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Adding…" : "Add course"}
            </Button>
          </div>
        </form>
      </section>

      {/* Registered courses: title, category, level, price */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Registered courses
          </h2>
          <p className="text-sm text-slate-500">
            {registeredCourses.length} course
            {registeredCourses.length === 1 ? "" : "s"} ·{" "}
            <span className="font-semibold text-slate-700">
              {totalCreditUnits} credit units
            </span>{" "}
            ·{" "}
            <span className="font-semibold text-slate-700">
              {formatNaira(totalPrice)}
            </span>
          </p>
        </div>

        {registeredCourses.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            You have not registered any courses yet. Use “Add course” to get
            started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Level</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredCourses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.course?.title ?? item.courseId}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.course?.category ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {item.course ? "Beginner" : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {formatNaira(item.course?.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td
                    className="px-4 py-3 font-semibold text-slate-700"
                    colSpan={3}
                  >
                    Total fee
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {formatNaira(totalPrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
