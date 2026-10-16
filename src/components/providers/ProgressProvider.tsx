"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  coursesApi,
  lessonsApi,
  profileApi,
  progressApi,
  settingsApi,
} from "@/lib/api";
import { DEFAULT_PROFILE, DEFAULT_SETTINGS } from "@/lib/storage";
import { applyLessonStatus } from "@/lib/progress";
import { useToast } from "@/components/providers/ToastProvider";
import type {
  Course,
  CourseInput,
  Lesson,
  LessonStatus,
  ProgressMap,
  StudentProfile,
  UserSettings,
} from "@/types";

interface ProgressContextValue {
  ready: boolean;
  error: string | null;
  reload: () => void;
  courses: Course[];
  lessons: Lesson[];
  getCourse: (courseId: string) => Course | undefined;
  getLesson: (lessonId: string) => Lesson | undefined;
  progress: ProgressMap;
  profile: StudentProfile;
  settings: UserSettings;
  setLessonStatus: (lessonId: string, status: LessonStatus) => void;
  toggleLessonComplete: (lessonId: string) => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetAllProgress: () => void;
  clearAllProgress: () => void;
  createCourse: (input: CourseInput) => Promise<Course>;
  updateCourse: (courseId: string, input: Partial<CourseInput>) => Promise<Course>;
  deleteCourse: (courseId: string) => Promise<void>;
}

interface AppState {
  courses: Course[];
  lessons: Lesson[];
  progress: ProgressMap;
  profile: StudentProfile;
  settings: UserSettings;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const INITIAL_STATE: AppState = {
  courses: [],
  lessons: [],
  progress: {},
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setReady(false);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const [courses, lessons, progress, profile, settings] =
          await Promise.all([
            coursesApi.list(),
            lessonsApi.list(),
            progressApi.get(),
            profileApi.get(),
            settingsApi.get(),
          ]);
        if (cancelled) return;
        setState({ courses, lessons, progress, profile, settings });
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load your dashboard data."
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const refreshProgress = useCallback(() => {
    progressApi
      .get()
      .then((progress) =>
        setState((current) => ({ ...current, progress }))
      )
      .catch(() => undefined);
  }, []);

  const setLessonStatus = useCallback(
    (lessonId: string, status: LessonStatus) => {
      setState((current) => ({
        ...current,
        progress: applyLessonStatus(current.progress, lessonId, status),
      }));
      progressApi
        .setLesson(lessonId, status)
        .then((progress) => setState((current) => ({ ...current, progress })))
        .catch((cause: unknown) => {
          toast(
            cause instanceof Error
              ? cause.message
              : "Could not save your progress.",
            "error"
          );
          refreshProgress();
        });
    },
    [refreshProgress, toast]
  );

  const toggleLessonComplete = useCallback(
    (lessonId: string) => {
      const isComplete =
        stateRef.current.progress[lessonId]?.status === "completed";
      setLessonStatus(lessonId, isComplete ? "not-started" : "completed");
    },
    [setLessonStatus]
  );

  const updateProfile = useCallback(
    (updates: Partial<StudentProfile>) => {
      setState((current) => ({
        ...current,
        profile: { ...current.profile, ...updates },
      }));
      profileApi
        .update(updates)
        .then((profile) => setState((current) => ({ ...current, profile })))
        .catch((cause: unknown) => {
          toast(
            cause instanceof Error ? cause.message : "Could not update profile.",
            "error"
          );
          profileApi
            .get()
            .then((profile) => setState((current) => ({ ...current, profile })))
            .catch(() => undefined);
        });
    },
    [toast]
  );

  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setState((current) => ({
        ...current,
        settings: { ...current.settings, ...updates },
      }));
      settingsApi
        .update(updates)
        .then((settings) => setState((current) => ({ ...current, settings })))
        .catch((cause: unknown) => {
          toast(
            cause instanceof Error
              ? cause.message
              : "Could not save your settings.",
            "error"
          );
          settingsApi
            .get()
            .then((settings) =>
              setState((current) => ({ ...current, settings }))
            )
            .catch(() => undefined);
        });
    },
    [toast]
  );

  const resetAllProgress = useCallback(() => {
    progressApi
      .reset()
      .then((progress) => setState((current) => ({ ...current, progress })))
      .catch(() => toast("Could not reset progress.", "error"));
  }, [toast]);

  const clearAllProgress = useCallback(() => {
    progressApi
      .clear()
      .then((progress) => setState((current) => ({ ...current, progress })))
      .catch(() => toast("Could not clear progress.", "error"));
  }, [toast]);

  const createCourse = useCallback(async (input: CourseInput) => {
    const course = await coursesApi.create(input);
    setState((current) => ({ ...current, courses: [...current.courses, course] }));
    return course;
  }, []);

  const updateCourse = useCallback(
    async (courseId: string, input: Partial<CourseInput>) => {
      const course = await coursesApi.update(courseId, input);
      setState((current) => ({
        ...current,
        courses: current.courses.map((item) =>
          item.id === courseId ? course : item
        ),
      }));
      return course;
    },
    []
  );

  const deleteCourse = useCallback(async (courseId: string) => {
    await coursesApi.remove(courseId);
    setState((current) => ({
      ...current,
      courses: current.courses.filter((item) => item.id !== courseId),
      progress: Object.fromEntries(
        Object.entries(current.progress).filter(
          ([lessonId]) => !lessonId.startsWith(`${courseId}-`)
        )
      ),
    }));
  }, []);

  const courseMap = useMemo(
    () => new Map(state.courses.map((course) => [course.id, course])),
    [state.courses]
  );
  const lessonMap = useMemo(
    () => new Map(state.lessons.map((lesson) => [lesson.id, lesson])),
    [state.lessons]
  );

  const getCourse = useCallback(
    (courseId: string) => courseMap.get(courseId),
    [courseMap]
  );
  const getLesson = useCallback(
    (lessonId: string) => lessonMap.get(lessonId),
    [lessonMap]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      error,
      reload,
      courses: state.courses,
      lessons: state.lessons,
      getCourse,
      getLesson,
      progress: state.progress,
      profile: state.profile,
      settings: state.settings,
      setLessonStatus,
      toggleLessonComplete,
      updateProfile,
      updateSettings,
      resetAllProgress,
      clearAllProgress,
      createCourse,
      updateCourse,
      deleteCourse,
    }),
    [
      ready,
      error,
      reload,
      state.courses,
      state.lessons,
      getCourse,
      getLesson,
      state.progress,
      state.profile,
      state.settings,
      setLessonStatus,
      toggleLessonComplete,
      updateProfile,
      updateSettings,
      resetAllProgress,
      clearAllProgress,
      createCourse,
      updateCourse,
      deleteCourse,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
