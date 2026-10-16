import { COURSE_TYPES, REGISTRATION_STATUSES, SEMESTERS } from "@/lib/academics";
import type {
  CourseInput,
  CourseLevel,
  CourseType,
  RegistrationStatus,
  Semester,
} from "@/types";

const LEVELS: CourseLevel[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "100L",
  "200L",
  "300L",
  "400L",
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^(https?:\/\/|\/)/i;

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;
const MAX_INSTRUCTOR = 120;
const MAX_CATEGORY = 80;
const MAX_FACULTY = 120;
const MAX_DEPARTMENT = 120;
const MAX_COURSE_CODE = 32;
const MAX_IMAGE_URL = 2048;
const MAX_COURSE_PRICE = 10_000_000;

export type CourseParseResult =
  | { ok: true; value: Partial<CourseInput> }
  | { ok: false; message: string };

const TEXT_FIELDS = [
  ["title", MAX_TITLE],
  ["faculty", MAX_FACULTY],
  ["department", MAX_DEPARTMENT],
] as const;

function clean(value: unknown): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function isValidDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value;
}

/**
 * Validates and normalises a course create/update payload. When `partial` is
 * true, only the provided fields are validated and returned (used for updates).
 */
export function parseCourseInput(
  raw: unknown,
  { partial = false }: { partial?: boolean } = {}
): CourseParseResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, message: "Invalid request body" };
  }
  const body = raw as Record<string, unknown>;
  const value: Partial<CourseInput> = {};

  for (const [field, max] of TEXT_FIELDS) {
    if (!(field in body)) {
      if (partial) continue;
      return { ok: false, message: `${field} is required` };
    }
    const fieldValue = clean(body[field]);
    if (!fieldValue) {
      return { ok: false, message: `${field} is required` };
    }
    if (fieldValue.length > max) {
      return { ok: false, message: `${field} must be ${max} characters or fewer` };
    }
    value[field] = fieldValue;
  }

  if ("description" in body) {
    const description = clean(body.description) ?? "";
    if (description.length > MAX_DESCRIPTION) {
      return {
        ok: false,
        message: `description must be ${MAX_DESCRIPTION} characters or fewer`,
      };
    }
    value.description = description;
  }

  if ("category" in body) {
    const category = clean(body.category) ?? "";
    if (category.length > MAX_CATEGORY) {
      return {
        ok: false,
        message: `category must be ${MAX_CATEGORY} characters or fewer`,
      };
    }
    value.category = category;
  }

  if ("instructor" in body) {
    const instructor = clean(body.instructor);
    if (instructor) {
      if (instructor.length > MAX_INSTRUCTOR) {
        return {
          ok: false,
          message: `instructor must be ${MAX_INSTRUCTOR} characters or fewer`,
        };
      }
      value.instructor = instructor;
    } else {
      value.instructor = "";
    }
  }

  if ("courseCode" in body) {
    const courseCode = clean(body.courseCode);
    if (courseCode) {
      if (courseCode.length > MAX_COURSE_CODE) {
        return {
          ok: false,
          message: `courseCode must be ${MAX_COURSE_CODE} characters or fewer`,
        };
      }
      value.courseCode = courseCode;
    } else {
      value.courseCode = null;
    }
  }

  if ("imageUrl" in body) {
    const imageUrl = clean(body.imageUrl);
    if (imageUrl) {
      if (imageUrl.length > MAX_IMAGE_URL) {
        return { ok: false, message: "imageUrl is too long" };
      }
      if (!URL_PATTERN.test(imageUrl)) {
        return {
          ok: false,
          message: "imageUrl must start with http://, https:// or /",
        };
      }
      value.imageUrl = imageUrl;
    } else {
      value.imageUrl = null;
    }
  }

  if ("totalLessons" in body) {
    const rawLessons = body.totalLessons;
    if (rawLessons === null || rawLessons === undefined || rawLessons === "") {
      value.totalLessons = null;
    } else {
      const num =
        typeof rawLessons === "number" ? rawLessons : Number(rawLessons);
      if (!Number.isInteger(num) || num < 0 || num > 1000) {
        return {
          ok: false,
          message: "Total lessons must be a whole number between 0 and 1000",
        };
      }
      value.totalLessons = num;
    }
  }

  if ("startDate" in body) {
    const startDate = clean(body.startDate);
    if (startDate) {
      if (!isValidDate(startDate)) {
        return { ok: false, message: "Please provide a valid start date" };
      }
      value.startDate = startDate;
    } else {
      value.startDate = null;
    }
  }

  if ("level" in body) {
    const level = clean(body.level);
    if (level) {
      if (!LEVELS.includes(level as CourseLevel)) {
        return { ok: false, message: "Invalid course level" };
      }
      value.level = level as CourseLevel;
    }
  }

  if ("semester" in body) {
    const semester = clean(body.semester);
    if (semester) {
      if (!SEMESTERS.includes(semester as Semester)) {
        return { ok: false, message: "Invalid semester" };
      }
      value.semester = semester as Semester;
    }
  }

  if ("courseType" in body) {
    const courseType = clean(body.courseType);
    if (courseType) {
      if (!COURSE_TYPES.includes(courseType as CourseType)) {
        return { ok: false, message: "Invalid course type" };
      }
      value.courseType = courseType as CourseType;
    }
  }

  if ("registrationStatus" in body) {
    const status = clean(body.registrationStatus);
    if (status) {
      if (!REGISTRATION_STATUSES.includes(status as RegistrationStatus)) {
        return { ok: false, message: "Invalid registration status" };
      }
      value.registrationStatus = status as RegistrationStatus;
    }
  }

  if ("creditUnits" in body) {
    const rawUnits = body.creditUnits;
    if (rawUnits === null || rawUnits === undefined || rawUnits === "") {
      value.creditUnits = undefined;
    } else {
      const num = typeof rawUnits === "number" ? rawUnits : Number(rawUnits);
      if (!Number.isInteger(num) || num < 1 || num > 12) {
        return {
          ok: false,
          message: "Credit units must be a whole number between 1 and 12",
        };
      }
      value.creditUnits = num;
    }
  }

  if ("price" in body) {
    const rawPrice = body.price;
    if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
      value.price = undefined;
    } else {
      const num = typeof rawPrice === "number" ? rawPrice : Number(rawPrice);
      if (!Number.isInteger(num) || num < 0 || num > MAX_COURSE_PRICE) {
        return {
          ok: false,
          message: `Price must be a whole number between 0 and ${MAX_COURSE_PRICE} naira`,
        };
      }
      value.price = num;
    }
  }

  return { ok: true, value };
}
