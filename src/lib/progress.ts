import type {
  Course,
  CourseStats,
  DashboardStats,
  Lesson,
  LessonStatus,
  ProgressMap,
} from "@/types";

export function getLessonStatus(
  progress: ProgressMap,
  lessonId: string
): LessonStatus {
  return progress[lessonId]?.status ?? "not-started";
}

export function applyLessonStatus(
  progress: ProgressMap,
  lessonId: string,
  status: LessonStatus
): ProgressMap {
  const next: ProgressMap = { ...progress };
  if (status === "not-started") {
    delete next[lessonId];
  } else {
    next[lessonId] = {
      status,
      completedAt:
        status === "completed"
          ? next[lessonId]?.completedAt ?? new Date().toISOString()
          : null,
    };
  }
  return next;
}

export function getCourseStats(
  course: Course,
  progress: ProgressMap
): CourseStats {
  const total = course.totalLessons ?? course.lessons.length;
  let completed = 0;
  let inProgress = 0;
  for (const lesson of course.lessons) {
    const status = getLessonStatus(progress, lesson.id);
    if (status === "completed") completed += 1;
    else if (status === "in-progress") inProgress += 1;
  }
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return {
    course,
    total,
    completed,
    inProgress,
    notStarted: total - completed - inProgress,
    percent,
  };
}

export function getAllCourseStats(
  courses: Course[],
  progress: ProgressMap
): CourseStats[] {
  return courses.map((course) => getCourseStats(course, progress));
}

export function getDashboardStats(
  courses: Course[],
  lessons: Lesson[],
  progress: ProgressMap
): DashboardStats {
  const totalLessons = lessons.length;
  let completedLessons = 0;
  for (const lesson of lessons) {
    if (getLessonStatus(progress, lesson.id) === "completed") {
      completedLessons += 1;
    }
  }
  const overallPercent =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  return {
    totalCourses: courses.length,
    totalLessons,
    completedLessons,
    remainingLessons: totalLessons - completedLessons,
    overallPercent,
  };
}

export function getNextLesson(
  course: Course,
  progress: ProgressMap
): Lesson | undefined {
  const inProgress = course.lessons.find(
    (lesson) => getLessonStatus(progress, lesson.id) === "in-progress"
  );
  if (inProgress) return inProgress;
  return course.lessons.find(
    (lesson) => getLessonStatus(progress, lesson.id) !== "completed"
  );
}

export interface CompletedEntry {
  lesson: Lesson;
  course: Course;
  completedAt: string;
}

export function getCompletedEntries(
  lessons: Lesson[],
  courses: Course[],
  progress: ProgressMap
): CompletedEntry[] {
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const entries: CompletedEntry[] = [];
  for (const [lessonId, value] of Object.entries(progress)) {
    if (value.status !== "completed" || !value.completedAt) continue;
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson) continue;
    const course = courseMap.get(lesson.courseId);
    if (!course) continue;
    entries.push({ lesson, course, completedAt: value.completedAt });
  }
  return entries.sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export interface ActivityPoint {
  label: string;
  shortLabel: string;
  count: number;
  isToday: boolean;
}

export function getWeeklyActivity(progress: ProgressMap): ActivityPoint[] {
  const points: ActivityPoint[] = [];
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedDates = Object.values(progress)
    .filter((value) => value.status === "completed" && value.completedAt)
    .map((value) => {
      const date = new Date(value.completedAt as string);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const timestamp = date.getTime();
    points.push({
      label: formatter.format(date),
      shortLabel: formatter.format(date).slice(0, 1),
      count: completedDates.filter((item) => item === timestamp).length,
      isToday: offset === 0,
    });
  }
  return points;
}

export function countCompletedThisWeek(progress: ProgressMap): number {
  return getWeeklyActivity(progress).reduce((sum, point) => sum + point.count, 0);
}
