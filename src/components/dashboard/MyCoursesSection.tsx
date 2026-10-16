"use client";

import { useMemo } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import CourseCard from "@/components/dashboard/CourseCard";
import CourseFormModal from "@/components/dashboard/CourseFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useCourseCrud } from "@/components/dashboard/useCourseCrud";
import { getCourseStats } from "@/lib/progress";

export default function MyCoursesSection() {
  const { courses, progress } = useProgress();
  const crud = useCourseCrud();

  const owned = useMemo(
    () => courses.filter((course) => course.ownerId),
    [courses]
  );

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
          <Badge tone="indigo">{owned.length}</Badge>
        </div>
        <Button onClick={crud.openCreate}>
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      {owned.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create a course to track your learning progress on the dashboard."
          action={
            <Button onClick={crud.openCreate}>
              <Plus className="h-4 w-4" />
              Add your first course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {owned.map((course) => (
            <CourseCard
              key={course.id}
              stats={getCourseStats(course, progress)}
              onEdit={crud.openEdit}
              onDelete={crud.requestDelete}
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
    </section>
  );
}
