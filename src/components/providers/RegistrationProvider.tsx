"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { portalApi, registrationsApi } from "@/lib/api";
import { DEFAULT_SEMESTER } from "@/lib/academics";
import { useToast } from "@/components/providers/ToastProvider";
import type {
  PortalSettings,
  Registration,
  RegistrationSummary,
  Semester,
} from "@/types";

interface RegistrationContextValue {
  ready: boolean;
  error: string | null;
  reload: () => void;
  portal: PortalSettings | null;
  semester: Semester;
  setSemester: (semester: Semester) => void;
  registrations: Registration[];
  summary: RegistrationSummary;
  isRegistered: (courseId: string) => boolean;
  register: (courseId: string) => Promise<void>;
  remove: (courseId: string) => Promise<void>;
  submit: () => Promise<void>;
  savePortal: (updates: Partial<PortalSettings>) => Promise<void>;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(
  null
);

const FALLBACK_PORTAL: PortalSettings = {
  registrationOpen: true,
  session: "2026/2027",
  deadline: null,
};

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [portal, setPortal] = useState<PortalSettings | null>(null);
  const [semester, setSemester] = useState<Semester>(DEFAULT_SEMESTER);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /* eslint-disable react-hooks/set-state-in-effect */
    setReady(false);
    setError(null);
    /* eslint-enable react-hooks/set-state-in-effect */

    (async () => {
      try {
        const portalSettings = await portalApi.get();
        const list = await registrationsApi.list();
        if (cancelled) return;
        setPortal(portalSettings);
        setAllRegistrations(list);
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to load your registration data."
        );
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  // Keep every registration the student has made (across sessions/semesters) so
  // course access stays stable — the server grants content for any registration.
  // The `registrations` list below is scoped to the active session/semester and
  // is what the registration UI displays.
  const registrations = useMemo(
    () =>
      allRegistrations.filter(
        (item) =>
          item.semester === semester &&
          (!portal?.session || item.session === portal.session)
      ),
    [allRegistrations, semester, portal]
  );

  const isRegistered = useCallback(
    (courseId: string) =>
      allRegistrations.some((item) => item.courseId === courseId),
    [allRegistrations]
  );

  const register = useCallback(
    async (courseId: string) => {
      const active = portal ?? FALLBACK_PORTAL;
      const registration = await registrationsApi.register(courseId, {
        session: active.session,
        semester,
      });
      setAllRegistrations((current) => {
        const exists = current.some(
          (item) =>
            item.courseId === courseId &&
            item.session === registration.session &&
            item.semester === registration.semester
        );
        return exists ? current : [...current, registration];
      });
      toast("Course added to your registration");
    },
    [portal, semester, toast]
  );

  const remove = useCallback(
    async (courseId: string) => {
      const active = portal ?? FALLBACK_PORTAL;
      await registrationsApi.remove(courseId, {
        session: active.session,
        semester,
      });
      setAllRegistrations((current) =>
        current.filter(
          (item) =>
            !(
              item.courseId === courseId &&
              item.session === active.session &&
              item.semester === semester
            )
        )
      );
      toast("Course removed from your registration", "info");
    },
    [portal, semester, toast]
  );

  const submit = useCallback(async () => {
    const active = portal ?? FALLBACK_PORTAL;
    const list = await registrationsApi.submit({
      session: active.session,
      semester,
    });
    setAllRegistrations((current) => [
      ...current.filter(
        (item) =>
          !(item.session === active.session && item.semester === semester)
      ),
      ...list,
    ]);
    toast("Registration submitted successfully");
  }, [portal, semester, toast]);

  const savePortal = useCallback(
    async (updates: Partial<PortalSettings>) => {
      const next = await portalApi.update(updates);
      setPortal(next);
      toast("Portal settings updated");
      if (next.session !== portal?.session) reload();
    },
    [portal?.session, reload, toast]
  );

  const summary = useMemo<RegistrationSummary>(() => {
    const count = registrations.length;
    const totalCreditUnits = registrations.reduce(
      (sum, item) => sum + (item.course?.creditUnits ?? 0),
      0
    );
    // Courses added after the last submission stay "draft"; everything the
    // student already submitted keeps the "submitted" status. Splitting them
    // lets the UI calculate what is genuinely new since the previous submission.
    const newRegistrations = registrations.filter(
      (item) => item.status === "draft"
    );
    const submittedRegistrations = registrations.filter(
      (item) => item.status === "submitted"
    );
    const status =
      count > 0 && submittedRegistrations.length === count
        ? "submitted"
        : "draft";
    return {
      count,
      totalCreditUnits,
      status,
      session: portal?.session ?? FALLBACK_PORTAL.session,
      semester,
      newCount: newRegistrations.length,
      newCreditUnits: newRegistrations.reduce(
        (sum, item) => sum + (item.course?.creditUnits ?? 0),
        0
      ),
      newFee: newRegistrations.reduce(
        (sum, item) => sum + (item.course?.price ?? 0),
        0
      ),
      submittedCount: submittedRegistrations.length,
    };
  }, [registrations, portal?.session, semester]);

  const value = useMemo<RegistrationContextValue>(
    () => ({
      ready,
      error,
      reload,
      portal,
      semester,
      setSemester,
      registrations,
      summary,
      isRegistered,
      register,
      remove,
      submit,
      savePortal,
    }),
    [
      ready,
      error,
      reload,
      portal,
      semester,
      registrations,
      summary,
      isRegistered,
      register,
      remove,
      submit,
      savePortal,
    ]
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration(): RegistrationContextValue {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return context;
}
