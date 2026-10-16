"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  ACADEMIC_LEVELS,
  COURSE_CREDIT_UNITS,
  COURSE_TYPES,
  DEFAULT_COURSE_TYPE,
  DEFAULT_CREDIT_UNITS,
  DEFAULT_SEMESTER,
  FACULTIES,
  REGISTRATION_STATUSES,
  SEMESTERS,
  generateCourseSpec,
  getDepartments,
  getLevelStartDate,
  getSuggestions,
  suggestCourseCode,
  type CourseSuggestion,
} from "@/lib/academics";
import { formatNaira } from "@/lib/format";
import type {
  AcademicLevel,
  Course,
  CourseInput,
  CourseType,
  RegistrationStatus,
  Semester,
} from "@/types";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CourseInput) => Promise<void>;
  initial?: Course | null;
}

interface FormState {
  faculty: string;
  department: string;
  level: string;
  courseCode: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  totalLessons: string;
  startDate: string;
  semester: Semester;
  creditUnits: string;
  price: string;
  courseType: CourseType;
  registrationStatus: RegistrationStatus;
}

const EMPTY: FormState = {
  faculty: "",
  department: "",
  level: "",
  courseCode: "",
  title: "",
  description: "",
  category: "",
  imageUrl: "",
  totalLessons: "",
  startDate: "",
  semester: DEFAULT_SEMESTER,
  creditUnits: String(DEFAULT_CREDIT_UNITS),
  price: "0",
  courseType: DEFAULT_COURSE_TYPE,
  registrationStatus: "Available",
};

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";

const labelClass = "block text-sm font-medium text-slate-700";

function fromCourse(course: Course): FormState {
  return {
    faculty: course.faculty ?? "",
    department: course.department ?? "",
    level: course.level ?? "",
    courseCode: course.courseCode ?? "",
    title: course.title,
    description: course.description,
    category: course.category,
    imageUrl: course.imageUrl ?? "",
    totalLessons:
      course.totalLessons === undefined || course.totalLessons === null
        ? ""
        : String(course.totalLessons),
    startDate: course.startDate ?? "",
    semester: course.semester ?? DEFAULT_SEMESTER,
    creditUnits: String(course.creditUnits ?? DEFAULT_CREDIT_UNITS),
    price: String(course.price ?? 0),
    courseType: course.courseType ?? DEFAULT_COURSE_TYPE,
    registrationStatus: course.registrationStatus ?? "Available",
  };
}

export default function CourseFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: CourseFormModalProps) {
  const titleListId = useId();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(() =>
    initial ? fromCourse(initial) : EMPTY
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const departments = useMemo(
    () => getDepartments(form.faculty),
    [form.faculty]
  );

  // Suggestions are scoped strictly to the selected department so only related
  // courses are ever offered for a department.
  const departmentSuggestions = useMemo(() => {
    if (!form.faculty || !form.department) return [];
    const matches = getSuggestions(form.faculty, form.department);
    if (!form.level) return matches;
    return [
      ...matches.filter((item) => item.level === form.level),
      ...matches.filter((item) => item.level !== form.level),
    ];
  }, [form.faculty, form.department, form.level]);

  const titleOptions = useMemo(
    () => Array.from(new Set(departmentSuggestions.map((item) => item.title))),
    [departmentSuggestions]
  );

  const update = (key: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleLevelChange = (level: string) =>
    setForm((current) => ({
      ...current,
      level,
      startDate:
        !current.startDate && level ? getLevelStartDate(level) : current.startDate,
      courseCode:
        !current.courseCode && current.department && level
          ? suggestCourseCode(current.department, level)
          : current.courseCode,
    }));

  const handleDepartmentChange = (department: string) =>
    setForm((current) => ({
      ...current,
      department,
      courseCode:
        !current.courseCode && department && current.level
          ? suggestCourseCode(department, current.level)
          : current.courseCode,
    }));

  const applySuggestion = (suggestion: CourseSuggestion) => {
    setForm((current) => ({
      ...current,
      faculty: suggestion.faculty,
      department: suggestion.department,
      level: suggestion.level,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      price: String(suggestion.price),
      startDate: getLevelStartDate(suggestion.level) || current.startDate,
    }));
  };

  const handleGenerate = () => {
    const spec = generateCourseSpec(
      form.faculty,
      form.department,
      form.level || undefined
    );
    if (!spec) {
      setError("Select a faculty and department first.");
      return;
    }
    setError(null);
    applySuggestion(spec);
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const validate = (): string | null => {
    if (!form.faculty.trim()) return "Please select a faculty.";
    if (!form.department.trim()) return "Please select a department.";
    if (!form.level.trim()) return "Please select a level.";
    if (!form.title.trim()) return "Course title is required.";
    if (form.imageUrl.trim() && !/^(https?:\/\/|\/)/i.test(form.imageUrl.trim())) {
      return "Image URL must start with http://, https:// or /.";
    }
    if (form.totalLessons.trim()) {
      const value = Number(form.totalLessons);
      if (!Number.isInteger(value) || value < 0 || value > 1000) {
        return "Total lessons must be a whole number between 0 and 1000.";
      }
    }
    const units = Number(form.creditUnits);
    if (!Number.isInteger(units) || units < 1 || units > 12) {
      return "Credit units must be a whole number between 1 and 12.";
    }
    const price = Number(form.price);
    if (!Number.isInteger(price) || price < 0 || price > 10000000) {
      return "Price must be a whole number between 0 and 10,000,000 naira.";
    }
    if (form.courseCode.trim() && form.courseCode.trim().length > 32) {
      return "Course code must be 32 characters or fewer.";
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        faculty: form.faculty.trim(),
        department: form.department.trim(),
        level: (form.level.trim() || undefined) as
          | AcademicLevel
          | undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        courseCode: form.courseCode.trim() ? form.courseCode.trim() : null,
        imageUrl: form.imageUrl.trim() ? form.imageUrl.trim() : null,
        totalLessons: form.totalLessons.trim()
          ? Number(form.totalLessons)
          : null,
        startDate: form.startDate ? form.startDate : null,
        semester: form.semester,
        creditUnits: Number(form.creditUnits),
        price: Number(form.price),
        courseType: form.courseType,
        registrationStatus: form.registrationStatus,
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save the course."
      );
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit course" : "Add new course"}
      description={
        isEdit
          ? "Update the details for this course."
          : "Register a course you are taking so you can track it on your dashboard."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="course-faculty" className={labelClass}>
              Faculty
            </label>
            <select
              id="course-faculty"
              value={form.faculty}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  faculty: event.target.value,
                  department: "",
                }))
              }
              required
              className={inputClass}
            >
              <option value="">Select faculty…</option>
              {FACULTIES.map((faculty) => (
                <option key={faculty.name} value={faculty.name}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-department" className={labelClass}>
              Department
            </label>
            <select
              id="course-department"
              value={form.department}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              required
              disabled={!form.faculty}
              className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
            >
              <option value="">
                {form.faculty ? "Select department…" : "Select a faculty first"}
              </option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="course-code" className={labelClass}>
              Course code <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="course-code"
              value={form.courseCode}
              onChange={(event) => update("courseCode", event.target.value)}
              maxLength={32}
              placeholder="e.g. SWE 201"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="course-level" className={labelClass}>
              Level
            </label>
            <select
              id="course-level"
              value={form.level}
              onChange={(event) => handleLevelChange(event.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select level…</option>
              {ACADEMIC_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="course-semester" className={labelClass}>
              Semester
            </label>
            <select
              id="course-semester"
              value={form.semester}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  semester: event.target.value as Semester,
                }))
              }
              className={inputClass}
            >
              {SEMESTERS.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-credit-units" className={labelClass}>
              Credit units
            </label>
            <select
              id="course-credit-units"
              value={form.creditUnits}
              onChange={(event) => update("creditUnits", event.target.value)}
              className={inputClass}
            >
              {COURSE_CREDIT_UNITS.map((units) => (
                <option key={units} value={String(units)}>
                  {units}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-price" className={labelClass}>
              Price (₦)
            </label>
            <input
              id="course-price"
              type="number"
              min={0}
              step={500}
              value={form.price}
              onChange={(event) => update("price", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="course-type" className={labelClass}>
              Course type
            </label>
            <select
              id="course-type"
              value={form.courseType}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  courseType: event.target.value as CourseType,
                }))
              }
              className={inputClass}
            >
              {COURSE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="course-registration-status" className={labelClass}>
              Registration status
            </label>
            <select
              id="course-registration-status"
              value={form.registrationStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  registrationStatus: event.target.value as RegistrationStatus,
                }))
              }
              className={inputClass}
            >
              {REGISTRATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              Suggested courses
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Generate course specification
            </button>
          </div>
          {departmentSuggestions.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {departmentSuggestions.map((suggestion) => (
                <button
                  key={suggestion.title}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white py-1 pl-3 pr-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-100"
                >
                  {suggestion.title}
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {formatNaira(suggestion.price)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              {form.department
                ? "No suggested courses for this department yet. Use “Generate course specification” or enter the details manually."
                : "Choose a faculty and department to see related courses."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="course-title" className={labelClass}>
            Course title
          </label>
          <input
            id="course-title"
            list={titleListId}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            required
            maxLength={200}
            placeholder="Start typing for suggestions…"
            className={inputClass}
          />
          <datalist id={titleListId}>
            {titleOptions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          {titleOptions.length > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Pick a suggestion or type your own title.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="course-image" className={labelClass}>
            Image URL <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="course-image"
            type="url"
            value={form.imageUrl}
            onChange={(event) => update("imageUrl", event.target.value)}
            placeholder="https://example.com/image.jpg"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="course-total-lessons" className={labelClass}>
              Total number of lessons
            </label>
            <input
              id="course-total-lessons"
              type="number"
              min={0}
              max={1000}
              value={form.totalLessons}
              onChange={(event) => update("totalLessons", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="course-start-date" className={labelClass}>
              Start date <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="course-start-date"
              type="date"
              value={form.startDate}
              onChange={(event) => update("startDate", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
          >
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save changes"
                : "Create course"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
