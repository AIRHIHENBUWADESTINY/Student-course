export type LessonStatus = "not-started" | "in-progress" | "completed";

export type AccentKey =
  | "indigo"
  | "emerald"
  | "fuchsia"
  | "sky"
  | "amber"
  | "violet"
  | "rose";

export type AcademicLevel = "100L" | "200L" | "300L" | "400L";

export type CourseLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | AcademicLevel;

export type Semester = "First Semester" | "Second Semester";

export type CourseType = "Core" | "Elective";

export type RegistrationStatus = "Available" | "Closed";

export type UserRole = "student" | "admin";

export type RegistrationState = "draft" | "submitted";

/** One turn of the AI chat transcript, in Gemini conversation order. */
export interface AiChatMessage {
  role: "user" | "model";
  text: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  duration: number;
  content: string[];
}

/** Where a lesson body came from: an uploaded .txt file or the inline array. */
export type LessonContentSource = "storage" | "inline";

/**
 * A single lesson with its full body. `text` is populated for lessons stored as
 * a .txt file in private Storage; otherwise `content` holds the inline body.
 */
export interface LessonDetail extends Lesson {
  text?: string | null;
  source?: LessonContentSource;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: CourseLevel;
  accent: AccentKey;
  icon: string;
  lessons: Lesson[];
  ownerId?: string | null;
  imageUrl?: string | null;
  totalLessons?: number;
  startDate?: string | null;
  faculty?: string | null;
  department?: string | null;
  courseCode?: string | null;
  semester?: Semester;
  creditUnits?: number;
  price?: number | null;
  courseType?: CourseType;
  registrationStatus?: RegistrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseInput {
  title: string;
  description?: string;
  category?: string;
  faculty: string;
  department: string;
  instructor?: string;
  imageUrl?: string | null;
  totalLessons?: number | null;
  startDate?: string | null;
  level?: CourseLevel;
  courseCode?: string | null;
  semester?: Semester;
  creditUnits?: number;
  /** Course fee in naira. */
  price?: number;
  courseType?: CourseType;
  registrationStatus?: RegistrationStatus;
}

/** A course a student has added to their registration basket. */
export interface Registration {
  id: string;
  userId: string;
  courseId: string;
  session: string;
  semester: Semester;
  status: RegistrationState;
  createdAt: string;
  updatedAt: string;
  course?: Course | null;
}

/** Portal-wide registration window controlled by administrators. */
export interface PortalSettings {
  registrationOpen: boolean;
  session: string;
  deadline: string | null;
  updatedAt?: string;
}

/** Aggregate figures for the student's current registration basket. */
export interface RegistrationSummary {
  count: number;
  totalCreditUnits: number;
  status: RegistrationState;
  session: string;
  semester: Semester;
}

/** An administrator-facing view of a student account. */
export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  matricNumber: string | null;
  faculty: string | null;
  department: string | null;
  level: string | null;
  session: string | null;
  role: UserRole;
  registeredCourses: number;
  totalCreditUnits: number;
}

export interface DepartmentRecord {
  id: string;
  faculty: string;
  name: string;
  createdAt?: string;
}

export interface LessonProgress {
  status: LessonStatus;
  completedAt: string | null;
}

export type ProgressMap = Record<string, LessonProgress>;

export interface StudentProfile {
  name: string;
  email: string;
  dateOfBirth: string;
  bio: string;
  goal: string;
  matricNumber: string;
  faculty: string;
  department: string;
  level: string;
  session: string;
  role: UserRole;
}

export interface UserSettings {
  emailNotifications: boolean;
  weeklyReminder: boolean;
  weeklyGoal: number;
}

export interface LoginResult {
  token: string;
  refreshToken?: string;
  user: StudentProfile;
}

export interface SessionResult {
  authenticated: boolean;
  user: StudentProfile;
}

export interface CourseStats {
  course: Course;
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percent: number;
}

export interface DashboardStats {
  totalCourses: number;
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  overallPercent: number;
}

/* ---------------------------- learning materials ---------------------------- */

/** Completion state for a single reading-material lesson. */
export type MaterialStatus = "in-progress" | "completed";

/** A registered course with its available learning materials, for the list page. */
export interface MaterialCourseSummary {
  courseId: string;
  title: string;
  category: string;
  department: string | null;
  level: string;
  /** Number of lessons in the course's material file (0 when none exist). */
  lessonCount: number;
  /** Number of lessons this student has completed. */
  completedCount: number;
  /** Completion percentage (0-100). */
  percent: number;
  /** False when no material file exists for the course yet. */
  available: boolean;
}

/** One lesson inside a course's reading material. */
export interface MaterialLesson {
  id: string;
  title: string;
  /** Lesson body as Markdown. */
  content: string;
}

/** A full course reading material, returned only to registered students. */
export interface MaterialDetail {
  courseId: string;
  title: string;
  category: string;
  department: string | null;
  level: string;
  /** Course overview / introduction as Markdown. */
  overview: string;
  lessons: MaterialLesson[];
  /** lesson id -> status for the signed-in student. */
  progress: Record<string, MaterialStatus>;
}
