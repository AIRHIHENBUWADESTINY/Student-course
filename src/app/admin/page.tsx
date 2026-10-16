"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  ShieldAlert,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useCourseCrud } from "@/components/dashboard/useCourseCrud";
import CourseFormModal from "@/components/dashboard/CourseFormModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { departmentsApi, studentsApi } from "@/lib/api";
import {
  ACADEMIC_LEVELS,
  ACADEMIC_SESSIONS,
  FACULTIES,
  getDepartments,
} from "@/lib/academics";
import { formatNaira } from "@/lib/format";
import type {
  DepartmentRecord,
  StudentProfile,
  StudentRecord,
  UserRole,
} from "@/types";

type Tab = "courses" | "students" | "departments" | "portal";

const inputClass =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "block text-sm font-medium text-slate-700";

/* --------------------------------- Courses -------------------------------- */

function CoursesTab() {
  const { courses } = useProgress();
  const crud = useCourseCrud();

  const sorted = useMemo(
    () =>
      [...courses].sort((a, b) =>
        (a.courseCode ?? a.title).localeCompare(b.courseCode ?? b.title)
      ),
    [courses]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {courses.length} course(s) in the catalogue
        </p>
        <Button onClick={crud.openCreate}>
          <Plus className="h-4 w-4" />
          Add course
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create the first course so students can register for it."
          action={
            <Button onClick={crud.openCreate}>
              <Plus className="h-4 w-4" />
              Add course
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Department
                </th>
                <th className="px-4 py-3 font-medium">Level</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Semester
                </th>
                <th className="px-4 py-3 text-center font-medium">Units</th>
                <th className="px-4 py-3 text-right font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {course.courseCode || "---"}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {course.title}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {course.department ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{course.level}</td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                    {course.semester ?? "First Semester"}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-slate-700">
                    {course.creditUnits ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    {formatNaira(course.price)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        course.registrationStatus === "Closed"
                          ? "rose"
                          : "emerald"
                      }
                    >
                      {course.registrationStatus ?? "Available"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => crud.openEdit(course)}
                        aria-label={`Edit ${course.title}`}
                      >
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => crud.requestDelete(course)}
                        aria-label={`Delete ${course.title}`}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            ? `Are you sure you want to delete "${crud.deleting.title}"? This also removes student registrations for it.`
            : ""
        }
        confirmLabel="Delete course"
      />
    </div>
  );
}

/* -------------------------------- Students -------------------------------- */

const EMPTY_STUDENT: Partial<StudentProfile> = {
  name: "",
  matricNumber: "",
  faculty: "",
  department: "",
  level: "",
  session: ACADEMIC_SESSIONS[0],
  role: "student",
};

function StudentsTab() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<StudentRecord | null>(null);
  const [form, setForm] = useState<Partial<StudentProfile>>(EMPTY_STUDENT);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<StudentRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStudents(await studentsApi.list());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to load students."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const openEdit = (student: StudentRecord) => {
    setEditing(student);
    setForm({
      name: student.name,
      matricNumber: student.matricNumber ?? "",
      faculty: student.faculty ?? "",
      department: student.department ?? "",
      level: student.level ?? "",
      session: student.session ?? ACADEMIC_SESSIONS[0],
      role: student.role,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await studentsApi.update(editing.id, form);
      toast("Student updated successfully");
      setEditing(null);
      await load();
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not update the student.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    try {
      await studentsApi.remove(removing.id);
      toast("Student removed", "info");
      setRemoving(null);
      await load();
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not remove the student.",
        "error"
      );
    }
  };

  const departments = useMemo(
    () => (form.faculty ? getDepartments(form.faculty) : []),
    [form.faculty]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading students…
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Could not load students"
        description={error}
        action={<Button onClick={() => void load()}>Try again</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{students.length} student(s) enrolled</p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Matric number
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Department
              </th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">
                Courses
              </th>
              <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">
                Units
              </th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.email}</p>
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-slate-600 md:table-cell">
                  {student.matricNumber || "—"}
                </td>
                <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">
                  {student.department || "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {student.level || "—"}
                </td>
                <td className="hidden px-4 py-3 text-center text-slate-600 sm:table-cell">
                  {student.registeredCourses}
                </td>
                <td className="hidden px-4 py-3 text-center text-slate-600 sm:table-cell">
                  {student.totalCreditUnits}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={student.role === "admin" ? "violet" : "slate"}>
                    {student.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(student)}
                      aria-label={`Edit ${student.name}`}
                    >
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoving(student)}
                      aria-label={`Remove ${student.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit student"
        description={editing?.email}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="student-name">
              Full name
            </label>
            <input
              id="student-name"
              value={form.name ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="student-matric">
                Matric number
              </label>
              <input
                id="student-matric"
                value={form.matricNumber ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    matricNumber: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="student-level">
                Level
              </label>
              <select
                id="student-level"
                value={form.level ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, level: event.target.value }))
                }
                className={inputClass}
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
              <label className={labelClass} htmlFor="student-faculty">
                Faculty
              </label>
              <select
                id="student-faculty"
                value={form.faculty ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    faculty: event.target.value,
                    department: "",
                  }))
                }
                className={inputClass}
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
              <label className={labelClass} htmlFor="student-department">
                Department
              </label>
              <select
                id="student-department"
                value={form.department ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    department: event.target.value,
                  }))
                }
                disabled={!form.faculty}
                className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
              >
                <option value="">Not set</option>
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
              <label className={labelClass} htmlFor="student-session">
                Academic session
              </label>
              <select
                id="student-session"
                value={form.session ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    session: event.target.value,
                  }))
                }
                className={inputClass}
              >
                {ACADEMIC_SESSIONS.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="student-role">
                Role
              </label>
              <select
                id="student-role"
                value={form.role ?? "student"}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as UserRole,
                  }))
                }
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        title="Remove student"
        description={
          removing
            ? `Remove ${removing.name}? Their profile and registrations will be deleted. The login account itself remains in Supabase Auth.`
            : ""
        }
        confirmLabel="Remove student"
      />
    </div>
  );
}

/* ------------------------------ Departments ------------------------------- */

function DepartmentsTab() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<DepartmentRecord | null>(null);
  const [editForm, setEditForm] = useState({ faculty: "", name: "" });
  const [removing, setRemoving] = useState<DepartmentRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDepartments(await departmentsApi.list());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!faculty.trim() || !name.trim()) return;
    setSaving(true);
    try {
      await departmentsApi.create(faculty.trim(), name.trim());
      setName("");
      toast("Department added");
      await load();
    } catch (cause) {
      toast(
        cause instanceof Error ? cause.message : "Could not add the department.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await departmentsApi.update(editing.id, editForm);
      toast("Department updated");
      setEditing(null);
      await load();
    } catch (cause) {
      toast(
        cause instanceof Error
          ? cause.message
          : "Could not update the department.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    try {
      await departmentsApi.remove(removing.id);
      toast("Department removed", "info");
      setRemoving(null);
      await load();
    } catch (cause) {
      toast(
        cause instanceof Error
          ? cause.message
          : "Could not remove the department.",
        "error"
      );
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className={labelClass} htmlFor="dept-faculty">
            Faculty
          </label>
          <select
            id="dept-faculty"
            value={faculty}
            onChange={(event) => setFaculty(event.target.value)}
            className={inputClass}
          >
            <option value="">Select faculty…</option>
            {FACULTIES.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className={labelClass} htmlFor="dept-name">
            Department name
          </label>
          <input
            id="dept-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mechatronics Engineering"
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={saving || !faculty || !name}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add department
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading departments…
        </div>
      ) : error ? (
        <EmptyState
          icon={Building2}
          title="Could not load departments"
          description={error}
          action={<Button onClick={() => void load()}>Try again</Button>}
        />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments added"
          description="Add custom departments here. They are merged with the built-in academic structure."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Faculty</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((department) => (
                <tr key={department.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500">
                    {department.faculty}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {department.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(department);
                          setEditForm({
                            faculty: department.faculty,
                            name: department.name,
                          });
                        }}
                        aria-label={`Edit ${department.name}`}
                      >
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemoving(department)}
                        aria-label={`Delete ${department.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit department"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleUpdate()} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="edit-dept-faculty">
              Faculty
            </label>
            <select
              id="edit-dept-faculty"
              value={editForm.faculty}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  faculty: event.target.value,
                }))
              }
              className={inputClass}
            >
              {FACULTIES.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-dept-name">
              Department name
            </label>
            <input
              id="edit-dept-name"
              value={editForm.name}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className={inputClass}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        title="Delete department"
        description={
          removing ? `Delete the "${removing.name}" department?` : ""
        }
        confirmLabel="Delete department"
      />
    </div>
  );
}

/* --------------------------------- Portal --------------------------------- */

function PortalTab() {
  const reg = useRegistration();
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [session, setSession] = useState(ACADEMIC_SESSIONS[0]);
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (reg.portal && !loaded) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setRegistrationOpen(reg.portal.registrationOpen);
      setSession(reg.portal.session);
      setDeadline(
        reg.portal.deadline
          ? reg.portal.deadline.slice(0, 16)
          : ""
      );
      setLoaded(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [reg.portal, loaded]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await reg.savePortal({
        registrationOpen,
        session,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      });
    } catch (cause) {
      void cause;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-800">
            Course registration window
          </p>
          <p className="text-xs text-slate-500">
            Open or close registration for all students.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={registrationOpen}
          onClick={() => setRegistrationOpen((value) => !value)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
            registrationOpen ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
              registrationOpen ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <Power className="h-3.5 w-3.5" />
        Registration is currently{" "}
        <strong>{registrationOpen ? "open" : "closed"}</strong>
      </div>

      <div>
        <label className={labelClass} htmlFor="portal-session">
          Active academic session
        </label>
        <select
          id="portal-session"
          value={session}
          onChange={(event) => setSession(event.target.value)}
          className={inputClass}
        >
          {Array.from(new Set([...ACADEMIC_SESSIONS, session])).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="portal-deadline">
          Registration deadline <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="portal-deadline"
          type="datetime-local"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className={inputClass}
        />
      </div>

      <Button onClick={() => void handleSave()} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save settings
      </Button>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "courses", label: "Courses", icon: ShieldAlert },
  { id: "students", label: "Students", icon: Users },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "portal", label: "Registration", icon: Power },
];

export default function AdminPage() {
  const { profile } = useProgress();
  const [tab, setTab] = useState<Tab>("courses");

  if (profile.role !== "admin") {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Administrator access required"
        description="This area is only available to administrators. Ask an administrator to grant your account the admin role."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">
            Manage courses, students, departments and registration.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "courses" && <CoursesTab />}
      {tab === "students" && <StudentsTab />}
      {tab === "departments" && <DepartmentsTab />}
      {tab === "portal" && <PortalTab />}
    </div>
  );
}
