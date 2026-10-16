import type { ProgressMap, StudentProfile, UserSettings } from "@/types";

export const STORAGE_KEYS = {
  token: "sld.token.v1",
  refreshToken: "sld.refresh.v1",
} as const;

const SEED_COMPLETED: string[] = [
  "web-development-1",
  "web-development-2",
  "web-development-3",
  "web-development-4",
  "python-programming-1",
  "python-programming-2",
  "python-programming-3",
  "ui-ux-design-1",
  "ui-ux-design-2",
  "ui-ux-design-3",
  "cloud-computing-1",
  "cloud-computing-2",
  "database-fundamentals-1",
  "database-fundamentals-2",
  "database-fundamentals-3",
  "introduction-to-devops-1",
  "introduction-to-devops-2",
  "introduction-to-devops-3",
];

const SEED_IN_PROGRESS: string[] = [
  "web-development-5",
  "python-programming-4",
  "ui-ux-design-4",
  "cloud-computing-3",
  "database-fundamentals-4",
  "introduction-to-devops-4",
];

const SEED_DAY_OFFSETS: number[] = [
  6, 6, 5, 5, 5, 4, 4, 3, 3, 3, 2, 2, 1, 1, 1, 0, 0, 0,
];

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function createSeedProgress(): ProgressMap {
  const map: ProgressMap = {};
  SEED_COMPLETED.forEach((id, index) => {
    map[id] = {
      status: "completed",
      completedAt: daysAgoIso(SEED_DAY_OFFSETS[index] ?? 0),
    };
  });
  SEED_IN_PROGRESS.forEach((id) => {
    map[id] = { status: "in-progress", completedAt: null };
  });
  return map;
}

export const DEFAULT_PROFILE: StudentProfile = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  dateOfBirth: "2000-01-01",
  bio: "Software Development student registering courses for the academic session.",
  goal: "Register the right courses for my department and level",
  matricNumber: "TEC/2023/001",
  faculty: "Faculty of Technology",
  department: "Software Development",
  level: "200L",
  session: "2026/2027",
  role: "student",
};

export const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  weeklyReminder: false,
  weeklyGoal: 5,
};
