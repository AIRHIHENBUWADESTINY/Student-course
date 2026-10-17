import { randomUUID } from "node:crypto";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, createSeedProgress } from "@/lib/storage";
import type {
  AccentKey,
  Course,
  CourseInput,
  CourseLevel,
  CourseType,
  DepartmentRecord,
  Lesson,
  LessonStatus,
  MaterialStatus,
  PortalSettings,
  ProgressMap,
  Registration,
  RegistrationState,
  RegistrationStatus,
  Semester,
  StudentProfile,
  StudentRecord,
  UserRole,
  UserSettings,
} from "@/types";

interface LessonRow {
  id: string;
  course_id: string;
  sort_order: number;
  title: string;
  summary: string;
  duration: number;
  content: string[] | null;
  storage_path: string | null;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: string;
  accent: string;
  icon: string;
  owner_id: string | null;
  image_url: string | null;
  total_lessons: number | null;
  start_date: string | null;
  faculty: string | null;
  department: string | null;
  course_code: string | null;
  semester: string | null;
  credit_units: number | null;
  price: number | null;
  course_type: string | null;
  registration_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  lessons: LessonRow[] | null;
}

interface ProfileRow {
  name: string | null;
  email: string | null;
  bio: string | null;
  goal: string | null;
  date_of_birth: string | null;
  matric_number: string | null;
  faculty: string | null;
  department: string | null;
  level: string | null;
  session: string | null;
  role: string | null;
}

const PROFILE_SELECT =
  "name, email, bio, goal, date_of_birth, matric_number, faculty, " +
  "department, level, session, role";

function mapProfile(row: ProfileRow): StudentProfile {
  return {
    name: row.name ?? "",
    email: row.email ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    bio: row.bio ?? "",
    goal: row.goal ?? "",
    matricNumber: row.matric_number ?? "",
    faculty: row.faculty ?? "",
    department: row.department ?? "",
    level: row.level ?? "",
    session: row.session ?? "",
    role: (row.role as UserRole | null) ?? "student",
  };
}

interface SettingsRow {
  email_notifications: boolean;
  weekly_reminder: boolean;
  weekly_goal: number;
}

interface ProgressRow {
  lesson_id: string;
  status: LessonStatus;
  completed_at: string | null;
}

const COURSE_SELECT =
  "id, title, description, instructor, category, level, accent, icon, " +
  "owner_id, image_url, total_lessons, start_date, faculty, department, " +
  "course_code, semester, credit_units, price, course_type, registration_status, " +
  "created_at, updated_at, " +
  "lessons (id, course_id, sort_order, title, summary, duration, content, storage_path)";

const LESSON_SELECT =
  "id, course_id, sort_order, title, summary, duration, content, storage_path";

function toError(error: { message: string }): Error {
  return new Error(error.message);
}

function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    order: row.sort_order,
    title: row.title,
    summary: row.summary,
    duration: row.duration,
    content: row.content ?? [],
  };
}

function mapCourse(row: CourseRow): Course {
  const lessons = (row.lessons ?? [])
    .map(mapLesson)
    .sort((a, b) => a.order - b.order);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    instructor: row.instructor,
    category: row.category,
    level: row.level as CourseLevel,
    accent: row.accent as AccentKey,
    icon: row.icon,
    lessons,
    ownerId: row.owner_id ?? null,
    imageUrl: row.image_url ?? null,
    totalLessons: row.total_lessons ?? lessons.length,
    startDate: row.start_date ?? null,
    faculty: row.faculty ?? null,
    department: row.department ?? null,
    courseCode: row.course_code ?? null,
    semester: (row.semester as Semester | null) ?? "First Semester",
    creditUnits: row.credit_units ?? 3,
    price: row.price ?? 0,
    courseType: (row.course_type as CourseType | null) ?? "Core",
    registrationStatus:
      (row.registration_status as RegistrationStatus | null) ?? "Available",
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

/**
 * Combines the stored profile with the authoritative auth user so the client
 * always receives a name and email even before the profile row is populated.
 */
export function mergeProfile(profile: StudentProfile, user: User): StudentProfile {
  const meta = user.user_metadata as {
    name?: unknown;
    date_of_birth?: unknown;
  } | null;
  const metaName = typeof meta?.name === "string" ? meta.name : "";
  const metaDateOfBirth =
    typeof meta?.date_of_birth === "string" ? meta.date_of_birth : "";
  const email = user.email ?? profile.email;
  const name = profile.name || metaName || email.split("@")[0] || "Student";
  const dateOfBirth = profile.dateOfBirth || metaDateOfBirth;
  return { ...profile, name, email, dateOfBirth };
}

/* ------------------------------- catalog ------------------------------- */

export async function listCourses(supabase: SupabaseClient): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .order("id");
  if (error) throw toError(error);
  return ((data as unknown as CourseRow[] | null) ?? []).map(mapCourse);
}

export async function getCourseById(
  supabase: SupabaseClient,
  courseId: string
): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_SELECT)
    .eq("id", courseId)
    .maybeSingle();
  if (error) throw toError(error);
  return data ? mapCourse(data as unknown as CourseRow) : null;
}

export interface CourseAccess {
  /** True when the user may read every course (administrators). */
  all: boolean;
  /** Courses the user registered for or owns. */
  ids: Set<string>;
}

/**
 * Resolves the set of courses whose learning content a user is allowed to read:
 * the courses they registered for, plus any courses they own. Administrators
 * can read all courses. Used to gate lesson content at the API boundary.
 */
export async function getCourseAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<CourseAccess> {
  const profile = await getProfile(supabase, userId);
  if (profile.role === "admin") {
    return { all: true, ids: new Set() };
  }

  const [registrations, owned] = await Promise.all([
    supabase.from("registrations").select("course_id").eq("user_id", userId),
    supabase.from("courses").select("id").eq("owner_id", userId),
  ]);
  if (registrations.error) throw toError(registrations.error);
  if (owned.error) throw toError(owned.error);

  const ids = new Set<string>();
  for (const row of (registrations.data as { course_id: string }[] | null) ?? []) {
    ids.add(row.course_id);
  }
  for (const row of (owned.data as { id: string }[] | null) ?? []) {
    ids.add(row.id);
  }
  return { all: false, ids };
}

export async function createCourse(
  supabase: SupabaseClient,
  ownerId: string,
  input: CourseInput
): Promise<Course> {
  const id = randomUUID();
  const { error } = await supabase.from("courses").insert({
    id,
    owner_id: ownerId,
    title: input.title,
    description: input.description ?? "",
    instructor: input.instructor ?? "",
    category: input.category ?? "",
    faculty: input.faculty,
    department: input.department,
    course_code: input.courseCode ?? null,
    image_url: input.imageUrl ?? null,
    total_lessons: input.totalLessons ?? null,
    start_date: input.startDate ?? null,
    level: input.level ?? "Beginner",
    semester: input.semester ?? "First Semester",
    credit_units: input.creditUnits ?? 3,
    price: input.price ?? 0,
    course_type: input.courseType ?? "Core",
    registration_status: input.registrationStatus ?? "Available",
    accent: "blue",
    icon: "code",
  });
  if (error) throw toError(error);

  const course = await getCourseById(supabase, id);
  if (!course) throw new Error("Course could not be created");
  return course;
}

export async function updateCourse(
  supabase: SupabaseClient,
  ownerId: string,
  courseId: string,
  input: Partial<CourseInput>
): Promise<Course | null> {
  const { data: existing, error: findError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (findError) throw toError(findError);
  if (!existing) return null;

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.instructor !== undefined) payload.instructor = input.instructor;
  if (input.category !== undefined) payload.category = input.category;
  if (input.faculty !== undefined) payload.faculty = input.faculty;
  if (input.department !== undefined) payload.department = input.department;
  if (input.courseCode !== undefined) payload.course_code = input.courseCode ?? null;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl ?? null;
  if (input.totalLessons !== undefined) {
    payload.total_lessons = input.totalLessons ?? null;
  }
  if (input.startDate !== undefined) payload.start_date = input.startDate ?? null;
  if (input.level !== undefined) payload.level = input.level;
  if (input.semester !== undefined) payload.semester = input.semester;
  if (input.creditUnits !== undefined) payload.credit_units = input.creditUnits;
  if (input.price !== undefined) payload.price = input.price;
  if (input.courseType !== undefined) payload.course_type = input.courseType;
  if (input.registrationStatus !== undefined) {
    payload.registration_status = input.registrationStatus;
  }

  const { error } = await supabase
    .from("courses")
    .update(payload)
    .eq("id", courseId)
    .eq("owner_id", ownerId);
  if (error) throw toError(error);

  return getCourseById(supabase, courseId);
}

export async function deleteCourse(
  supabase: SupabaseClient,
  ownerId: string,
  courseId: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("courses")
    .delete({ count: "exact" })
    .eq("id", courseId)
    .eq("owner_id", ownerId);
  if (error) throw toError(error);
  return (count ?? 0) > 0;
}

export async function listLessons(supabase: SupabaseClient): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .order("course_id")
    .order("sort_order");
  if (error) throw toError(error);
  return ((data as LessonRow[] | null) ?? []).map(mapLesson);
}

export async function getLessonById(
  supabase: SupabaseClient,
  lessonId: string
): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .eq("id", lessonId)
    .maybeSingle();
  if (error) throw toError(error);
  return data ? mapLesson(data as LessonRow) : null;
}

/** A lesson together with its Storage object pointer, kept server-side only. */
export interface LessonSource {
  lesson: Lesson;
  /** Object path inside the lesson Storage bucket, or null for inline lessons. */
  storagePath: string | null;
}

/**
 * Loads a lesson and the Storage path of its .txt body without exposing the
 * path to clients. Used by the lesson route to stream gated content.
 */
export async function getLessonSource(
  supabase: SupabaseClient,
  lessonId: string
): Promise<LessonSource | null> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_SELECT)
    .eq("id", lessonId)
    .maybeSingle();
  if (error) throw toError(error);
  if (!data) return null;
  const row = data as LessonRow;
  return { lesson: mapLesson(row), storagePath: row.storage_path ?? null };
}

/* ------------------------------- profile ------------------------------- */

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<StudentProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw toError(error);

  if (!data) {
    const fallback: StudentProfile = { ...DEFAULT_PROFILE };
    try {
      await supabase.from("profiles").upsert({
        id: userId,
        name: fallback.name,
        email: fallback.email,
        bio: fallback.bio,
        goal: fallback.goal,
        date_of_birth: fallback.dateOfBirth || null,
        matric_number: fallback.matricNumber || null,
        faculty: fallback.faculty || null,
        department: fallback.department || null,
        level: fallback.level || null,
        session: fallback.session || null,
      });
    } catch {
      /* the auth user can still proceed with defaults */
    }
    return fallback;
  }

  return mapProfile(data as unknown as ProfileRow);
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  const payload: Record<string, unknown> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.goal !== undefined) payload.goal = updates.goal;
  if (updates.dateOfBirth !== undefined) {
    payload.date_of_birth = updates.dateOfBirth || null;
  }
  if (updates.matricNumber !== undefined) {
    payload.matric_number = updates.matricNumber || null;
  }
  if (updates.faculty !== undefined) payload.faculty = updates.faculty || null;
  if (updates.department !== undefined) {
    payload.department = updates.department || null;
  }
  if (updates.level !== undefined) payload.level = updates.level || null;
  if (updates.session !== undefined) payload.session = updates.session || null;
  if (updates.role !== undefined) payload.role = updates.role;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload)
    .select(PROFILE_SELECT)
    .single();
  if (error) throw toError(error);
  return mapProfile(data as unknown as ProfileRow);
}

/* ------------------------------ settings ------------------------------- */

function mapSettings(row: SettingsRow): UserSettings {
  return {
    emailNotifications: row.email_notifications,
    weeklyReminder: row.weekly_reminder,
    weeklyGoal: row.weekly_goal,
  };
}

export async function getSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("email_notifications, weekly_reminder, weekly_goal")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw toError(error);

  if (!data) {
    const fallback: UserSettings = { ...DEFAULT_SETTINGS };
    try {
      await supabase.from("user_settings").upsert({
        user_id: userId,
        email_notifications: fallback.emailNotifications,
        weekly_reminder: fallback.weeklyReminder,
        weekly_goal: fallback.weeklyGoal,
      });
    } catch {
      /* the auth user can still proceed with defaults */
    }
    return fallback;
  }

  return mapSettings(data as SettingsRow);
}

export async function updateSettings(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.emailNotifications !== undefined) {
    payload.email_notifications = updates.emailNotifications;
  }
  if (updates.weeklyReminder !== undefined) {
    payload.weekly_reminder = updates.weeklyReminder;
  }
  if (updates.weeklyGoal !== undefined) {
    payload.weekly_goal = updates.weeklyGoal;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(payload)
    .select("email_notifications, weekly_reminder, weekly_goal")
    .single();
  if (error) throw toError(error);
  return mapSettings(data as SettingsRow);
}

/* ------------------------------ progress ------------------------------- */

export async function getProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressMap> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, status, completed_at")
    .eq("user_id", userId);
  if (error) throw toError(error);

  const map: ProgressMap = {};
  for (const row of (data as ProgressRow[] | null) ?? []) {
    map[row.lesson_id] = {
      status: row.status,
      completedAt: row.completed_at,
    };
  }
  return map;
}

export async function setLessonStatus(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string,
  status: LessonStatus
): Promise<ProgressMap> {
  if (status === "not-started") {
    const { error } = await supabase
      .from("lesson_progress")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    if (error) throw toError(error);
    return getProgress(supabase, userId);
  }

  let completedAt: string | null = null;
  if (status === "completed") {
    const { data } = await supabase
      .from("lesson_progress")
      .select("completed_at")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    completedAt = data?.completed_at ?? new Date().toISOString();
  }

  const { error } = await supabase.from("lesson_progress").upsert({
    user_id: userId,
    lesson_id: lessonId,
    status,
    completed_at: completedAt,
    updated_at: new Date().toISOString(),
  });
  if (error) throw toError(error);

  return getProgress(supabase, userId);
}

export async function clearProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressMap> {
  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId);
  if (error) throw toError(error);
  return {};
}

export async function resetProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<ProgressMap> {
  const { error: deleteError } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId);
  if (deleteError) throw toError(deleteError);

  const rows = Object.entries(createSeedProgress()).map(([lessonId, value]) => ({
    user_id: userId,
    lesson_id: lessonId,
    status: value.status,
    completed_at: value.completedAt,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("lesson_progress").upsert(rows);
    if (error) throw toError(error);
  }

  return getProgress(supabase, userId);
}

/* ---------------------------- registrations ---------------------------- */

interface RegistrationRow {
  id: string;
  user_id: string;
  course_id: string;
  session: string;
  semester: string;
  status: string;
  created_at: string;
  updated_at: string;
  courses?: CourseRow | CourseRow[] | null;
}

const REGISTRATION_SELECT =
  "id, user_id, course_id, session, semester, status, created_at, " +
  `updated_at, courses (${COURSE_SELECT})`;

function mapRegistration(row: RegistrationRow): Registration {
  const joined = row.courses;
  const courseRow = Array.isArray(joined) ? joined[0] : joined;
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    session: row.session,
    semester: row.semester as Semester,
    status: row.status as RegistrationState,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    course: courseRow ? mapCourse(courseRow) : null,
  };
}

export async function listRegistrations(
  supabase: SupabaseClient,
  userId: string,
  filter: { session?: string; semester?: string } = {}
): Promise<Registration[]> {
  let query = supabase
    .from("registrations")
    .select(REGISTRATION_SELECT)
    .eq("user_id", userId);
  if (filter.session) query = query.eq("session", filter.session);
  if (filter.semester) query = query.eq("semester", filter.semester);

  const { data, error } = await query.order("created_at");
  if (error) throw toError(error);
  return ((data as unknown as RegistrationRow[] | null) ?? []).map(
    mapRegistration
  );
}

export async function createRegistration(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  session: string,
  semester: string
): Promise<Registration> {
  const { data, error } = await supabase
    .from("registrations")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        session,
        semester,
        status: "draft",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_id,session,semester" }
    )
    .select(REGISTRATION_SELECT)
    .single();
  if (error) throw toError(error);
  return mapRegistration(data as unknown as RegistrationRow);
}

export async function deleteRegistration(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  session: string,
  semester: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("registrations")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("session", session)
    .eq("semester", semester);
  if (error) throw toError(error);
  return (count ?? 0) > 0;
}

export async function submitRegistrations(
  supabase: SupabaseClient,
  userId: string,
  session: string,
  semester: string
): Promise<Registration[]> {
  const { error } = await supabase
    .from("registrations")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("session", session)
    .eq("semester", semester);
  if (error) throw toError(error);
  return listRegistrations(supabase, userId, { session, semester });
}

/* --------------------------- portal settings --------------------------- */

interface PortalSettingsRow {
  registration_open: boolean;
  session: string;
  deadline: string | null;
  updated_at: string | null;
}

function mapPortalSettings(row: PortalSettingsRow): PortalSettings {
  return {
    registrationOpen: row.registration_open,
    session: row.session,
    deadline: row.deadline,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getPortalSettings(
  supabase: SupabaseClient
): Promise<PortalSettings> {
  const { data, error } = await supabase
    .from("portal_settings")
    .select("registration_open, session, deadline, updated_at")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw toError(error);
  if (!data) {
    return { registrationOpen: true, session: "2026/2027", deadline: null };
  }
  return mapPortalSettings(data as PortalSettingsRow);
}

export async function updatePortalSettings(
  supabase: SupabaseClient,
  updates: Partial<PortalSettings>
): Promise<PortalSettings> {
  const payload: Record<string, unknown> = {
    id: "default",
    updated_at: new Date().toISOString(),
  };
  if (updates.registrationOpen !== undefined) {
    payload.registration_open = updates.registrationOpen;
  }
  if (updates.session !== undefined) payload.session = updates.session;
  if (updates.deadline !== undefined) payload.deadline = updates.deadline;

  const { data, error } = await supabase
    .from("portal_settings")
    .upsert(payload)
    .select("registration_open, session, deadline, updated_at")
    .single();
  if (error) throw toError(error);
  return mapPortalSettings(data as PortalSettingsRow);
}

/* ------------------------------- students ------------------------------ */

export async function listStudents(
  supabase: SupabaseClient
): Promise<StudentRecord[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`${PROFILE_SELECT}, id`);
  if (error) throw toError(error);

  const { data: registrations, error: regError } = await supabase
    .from("registrations")
    .select("user_id, courses (credit_units)");
  if (regError) throw toError(regError);

  const totals = new Map<string, { count: number; credits: number }>();
  for (const row of (registrations as unknown as {
    user_id: string;
    courses: { credit_units: number | null } | { credit_units: number | null }[] | null;
  }[] | null) ?? []) {
    const current = totals.get(row.user_id) ?? { count: 0, credits: 0 };
    const joined = row.courses;
    const courseRow = Array.isArray(joined) ? joined[0] : joined;
    current.count += 1;
    current.credits += courseRow?.credit_units ?? 0;
    totals.set(row.user_id, current);
  }

  return ((profiles as unknown as (ProfileRow & { id: string })[] | null) ?? [])
    .map((row) => {
      const stats = totals.get(row.id) ?? { count: 0, credits: 0 };
      return {
        id: row.id,
        name: row.name ?? "",
        email: row.email ?? "",
        matricNumber: row.matric_number ?? null,
        faculty: row.faculty ?? null,
        department: row.department ?? null,
        level: row.level ?? null,
        session: row.session ?? null,
        role: (row.role as UserRole | null) ?? "student",
        registeredCourses: stats.count,
        totalCreditUnits: stats.credits,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateStudent(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<StudentProfile>
): Promise<StudentProfile> {
  const payload: Record<string, unknown> = {
    id: userId,
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.matricNumber !== undefined) {
    payload.matric_number = updates.matricNumber || null;
  }
  if (updates.faculty !== undefined) payload.faculty = updates.faculty || null;
  if (updates.department !== undefined) {
    payload.department = updates.department || null;
  }
  if (updates.level !== undefined) payload.level = updates.level || null;
  if (updates.session !== undefined) payload.session = updates.session || null;
  if (updates.role !== undefined) payload.role = updates.role;

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(PROFILE_SELECT)
    .single();
  if (error) throw toError(error);
  return mapProfile(data as unknown as ProfileRow);
}

export async function deleteStudent(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("profiles")
    .delete({ count: "exact" })
    .eq("id", userId);
  if (error) throw toError(error);
  return (count ?? 0) > 0;
}

/* ----------------------------- departments ----------------------------- */

interface DepartmentRow {
  id: string;
  faculty: string;
  name: string;
  created_at: string | null;
}

function mapDepartment(row: DepartmentRow): DepartmentRecord {
  return {
    id: row.id,
    faculty: row.faculty,
    name: row.name,
    createdAt: row.created_at ?? undefined,
  };
}

export async function listDepartments(
  supabase: SupabaseClient
): Promise<DepartmentRecord[]> {
  const { data, error } = await supabase
    .from("departments")
    .select("id, faculty, name, created_at")
    .order("faculty")
    .order("name");
  if (error) throw toError(error);
  return ((data as DepartmentRow[] | null) ?? []).map(mapDepartment);
}

export async function createDepartment(
  supabase: SupabaseClient,
  faculty: string,
  name: string
): Promise<DepartmentRecord> {
  const { data, error } = await supabase
    .from("departments")
    .insert({ faculty, name })
    .select("id, faculty, name, created_at")
    .single();
  if (error) throw toError(error);
  return mapDepartment(data as DepartmentRow);
}

export async function updateDepartment(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<DepartmentRecord, "faculty" | "name">>
): Promise<DepartmentRecord | null> {
  const payload: Record<string, unknown> = {};
  if (updates.faculty !== undefined) payload.faculty = updates.faculty;
  if (updates.name !== undefined) payload.name = updates.name;

  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("id", id)
    .select("id, faculty, name, created_at")
    .maybeSingle();
  if (error) throw toError(error);
  return data ? mapDepartment(data as DepartmentRow) : null;
}

export async function deleteDepartment(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("departments")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw toError(error);
  return (count ?? 0) > 0;
}

/* --------------------------- material progress --------------------------- */

interface MaterialProgressRow {
  user_id: string;
  course_id: string;
  lesson_id: string;
  status: MaterialStatus;
}

export async function hasRegistration(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("registrations")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .limit(1);
  if (error) throw toError(error);
  return ((data as { id: string }[] | null) ?? []).length > 0;
}

export async function getMaterialProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
): Promise<Record<string, MaterialStatus>> {
  const { data, error } = await supabase
    .from("material_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId);
  if (error) throw toError(error);

  const progress: Record<string, MaterialStatus> = {};
  for (const row of (data as MaterialProgressRow[] | null) ?? []) {
    progress[row.lesson_id] = row.status;
  }
  return progress;
}

export async function listMaterialProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, Record<string, MaterialStatus>>> {
  const { data, error } = await supabase
    .from("material_progress")
    .select("user_id, course_id, lesson_id, status")
    .eq("user_id", userId);
  if (error) throw toError(error);

  const byCourse: Record<string, Record<string, MaterialStatus>> = {};
  for (const row of (data as MaterialProgressRow[] | null) ?? []) {
    (byCourse[row.course_id] ??= {})[row.lesson_id] = row.status;
  }
  return byCourse;
}

export async function setMaterialLessonStatus(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<void> {
  if (completed) {
    const now = new Date().toISOString();
    const { error } = await supabase.from("material_progress").upsert(
      {
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: now,
        updated_at: now,
      },
      { onConflict: "user_id,course_id,lesson_id" }
    );
    if (error) throw toError(error);
    return;
  }

  const { error } = await supabase
    .from("material_progress")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId);
  if (error) throw toError(error);
}
