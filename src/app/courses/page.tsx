"use client";

import { useMemo, useState } from "react";
import { BookOpen, Plus, SearchX } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import CourseCard from "@/components/dashboard/CourseCard";
import CourseFormModal from "@/components/dashboard/CourseFormModal";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useCourseCrud } from "@/components/dashboard/useCourseCrud";
import { getAllCourseStats } from "@/lib/progress";

type StatusFilter = "all" | "not-started" | "in-progress" | "completed";

export default function CoursesPage() {
  const { progress, courses } = useProgress();
  const crud = useCourseCrud();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(courses.map((item) => item.category))).filter(
        Boolean
      ).sort(),
    [courses]
  );
  const allStats = useMemo(
    () => getAllCourseStats(courses, progress),
    [courses, progress]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allStats.filter((item) => {
      const { course, percent, completed, inProgress } = item;
      const matchesQuery =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        course.instructor.toLowerCase().includes(term) ||
        course.category.toLowerCase().includes(term) ||
        (course.faculty ?? "").toLowerCase().includes(term) ||
        (course.department ?? "").toLowerCase().includes(term);
      const matchesCategory = category === "all" || course.category === category;
      const matchesStatus =
        status === "all" ||
        (status === "completed" && percent === 100) ||
        (status === "in-progress" &&
          percent < 100 &&
          (inProgress > 0 || completed > 0)) ||
        (status === "not-started" && completed === 0 && inProgress === 0);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [allStats, query, category, status]);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Courses</h1>
            <p className="text-sm text-slate-500">
              {allStats.length} courses enrolled · explore and continue learning
            </p>
          </div>
        </div>
        <Button onClick={crud.openCreate}>
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search courses, instructors or topics..."
          className="w-full lg:max-w-sm"
        />
        <div className="flex flex-1 flex-wrap gap-3">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Filter by progress status"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All progress</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="not-started">Not started</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:ml-auto"
          >
            Reset
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course to start tracking lessons and progress."
            action={
              <Button onClick={crud.openCreate}>
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No courses found"
            description="Try adjusting your search terms or filters to find the course you are looking for."
            action={<Button onClick={resetFilters}>Reset filters</Button>}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <CourseCard
              key={item.course.id}
              stats={item}
              onEdit={item.course.ownerId ? crud.openEdit : undefined}
              onDelete={item.course.ownerId ? crud.requestDelete : undefined}
            />
          ))}
        </div>
      )}

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
        onConfirm={crud.confirmDelete}
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
