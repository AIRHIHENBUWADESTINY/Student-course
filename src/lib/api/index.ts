import { http } from "@/lib/api/client";
import type {
  AiChatMessage,
  Course,
  CourseInput,
  DepartmentRecord,
  Lesson,
  LessonDetail,
  LessonStatus,
  LoginResult,
  MaterialCourseSummary,
  MaterialDetail,
  MaterialStatus,
  PortalSettings,
  ProgressMap,
  Registration,
  SessionResult,
  StudentProfile,
  StudentRecord,
  UserSettings,
} from "@/types";

export const coursesApi = {
  list: () => http.get<Course[]>("/courses"),
  get: (courseId: string) => http.get<Course>(`/courses/${courseId}`),
  create: (input: CourseInput) => http.post<Course>("/courses", input),
  update: (courseId: string, input: Partial<CourseInput>) =>
    http.put<Course>(`/courses/${courseId}`, input),
  remove: (courseId: string) =>
    http.delete<{ success: boolean }>(`/courses/${courseId}`),
};

export const lessonsApi = {
  list: () => http.get<Lesson[]>("/lessons"),
  get: (lessonId: string) => http.get<LessonDetail>(`/lessons/${lessonId}`),
  byCourse: (courseId: string) =>
    http.get<Lesson[]>(`/courses/${courseId}/lessons`),
};

export const progressApi = {
  get: () => http.get<ProgressMap>("/progress"),
  setLesson: (lessonId: string, status: LessonStatus) =>
    http.patch<ProgressMap>(`/progress/lessons/${lessonId}`, { status }),
  reset: () => http.post<ProgressMap>("/progress/reset"),
  clear: () => http.delete<ProgressMap>("/progress"),
};

export const profileApi = {
  get: () => http.get<StudentProfile>("/profile"),
  update: (updates: Partial<StudentProfile>) =>
    http.put<StudentProfile>("/profile", updates),
};

export const settingsApi = {
  get: () => http.get<UserSettings>("/settings"),
  update: (updates: Partial<UserSettings>) =>
    http.put<UserSettings>("/settings", updates),
};

export const authApi = {
  login: (email: string, password: string) =>
    http.post<LoginResult>("/auth/login", { email, password }),
  register: (
    name: string,
    email: string,
    password: string,
    dateOfBirth: string
  ) =>
    http.post<LoginResult>("/auth/register", {
      name,
      email,
      password,
      dateOfBirth,
    }),
  session: () => http.get<SessionResult>("/auth/session"),
  logout: () => http.post<{ success: boolean }>("/auth/logout"),
};

export const systemApi = {
  health: () =>
    http.get<{ status: string; service: string; time: string }>("/health"),
};

function withQuery(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  const suffix = query.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export const registrationsApi = {
  list: (params: { session?: string; semester?: string } = {}) =>
    http.get<Registration[]>(withQuery("/registrations", params)),
  register: (courseId: string, params: { session?: string; semester?: string } = {}) =>
    http.post<Registration>("/registrations", { courseId, ...params }),
  remove: (courseId: string, params: { session: string; semester: string }) =>
    http.delete<{ success: boolean }>(
      withQuery(`/registrations/${encodeURIComponent(courseId)}`, params)
    ),
  submit: (params: { session: string; semester: string }) =>
    http.post<Registration[]>(
      withQuery("/registrations/submit", params)
    ),
};

export const portalApi = {
  get: () => http.get<PortalSettings>("/portal"),
  update: (updates: Partial<PortalSettings>) =>
    http.put<PortalSettings>("/portal", updates),
};

export const materialsApi = {
  list: () => http.get<MaterialCourseSummary[]>("/materials"),
  get: (courseId: string) =>
    http.get<MaterialDetail>(`/materials/${encodeURIComponent(courseId)}`),
  setLesson: (courseId: string, lessonId: string, completed: boolean) =>
    http.patch<Record<string, MaterialStatus>>(
      `/materials/${encodeURIComponent(courseId)}`,
      { lessonId, completed }
    ),
};

export interface AiChatReply {
  reply: string;
  /** True when the assistant added or removed a course. */
  changed: boolean;
}

export const aiApi = {
  chat: (payload: {
    message: string;
    history?: AiChatMessage[];
    session?: string;
    semester?: string;
  }) => http.post<AiChatReply>("/ai/chat", payload),
};

export const studentsApi = {
  list: () => http.get<StudentRecord[]>("/students"),
  update: (userId: string, updates: Partial<StudentProfile>) =>
    http.put<StudentProfile>(`/students/${encodeURIComponent(userId)}`, updates),
  remove: (userId: string) =>
    http.delete<{ success: boolean }>(
      `/students/${encodeURIComponent(userId)}`
    ),
};

export const departmentsApi = {
  list: () => http.get<DepartmentRecord[]>("/departments"),
  create: (faculty: string, name: string) =>
    http.post<DepartmentRecord>("/departments", { faculty, name }),
  update: (id: string, updates: { faculty?: string; name?: string }) =>
    http.put<DepartmentRecord>(`/departments/${encodeURIComponent(id)}`, updates),
  remove: (id: string) =>
    http.delete<{ success: boolean }>(
      `/departments/${encodeURIComponent(id)}`
    ),
};

export {
  ApiError,
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
} from "@/lib/api/client";
export { http } from "@/lib/api/client";
