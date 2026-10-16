"use client";

import { useCallback, useState } from "react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { Course, CourseInput } from "@/types";

export function useCourseCrud() {
  const { createCourse, updateCourse, deleteCourse } = useProgress();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState<Course | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormKey((value) => value + 1);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((course: Course) => {
    setEditing(course);
    setFormKey((value) => value + 1);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const requestDelete = useCallback((course: Course) => {
    setDeleting(course);
  }, []);

  const closeDelete = useCallback(() => setDeleting(null), []);

  const submitForm = useCallback(
    async (input: CourseInput) => {
      if (editing) {
        await updateCourse(editing.id, input);
        toast("Course updated successfully");
      } else {
        await createCourse(input);
        toast("Course created successfully");
      }
      setFormOpen(false);
      setEditing(null);
    },
    [editing, createCourse, updateCourse, toast]
  );

  const confirmDelete = useCallback(async () => {
    if (!deleting) return;
    await deleteCourse(deleting.id);
    toast("Course deleted", "info");
    setDeleting(null);
  }, [deleting, deleteCourse, toast]);

  return {
    formOpen,
    formKey,
    editing,
    deleting,
    openCreate,
    openEdit,
    closeForm,
    requestDelete,
    closeDelete,
    submitForm,
    confirmDelete,
  };
}
