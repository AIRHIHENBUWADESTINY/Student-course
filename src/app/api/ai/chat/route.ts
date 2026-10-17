import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/supabase/server";
import {
  createCourse,
  createRegistration,
  deleteRegistration,
  getPortalSettings,
  getProfile,
  listRegistrations,
} from "@/lib/server/db";
import { serverError, unauthorized } from "@/lib/server/auth";
import {
  COURSE_SUGGESTIONS,
  DEFAULT_CREDIT_UNITS,
  DEFAULT_SEMESTER,
} from "@/lib/academics";
import { formatNaira } from "@/lib/format";
import type {
  AiChatMessage,
  PortalSettings,
  Registration,
  Semester,
  StudentProfile,
} from "@/types";

export const dynamic = "force-dynamic";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const MAX_HISTORY_MESSAGES = 12;

interface GeminiFunctionCall {
  name: string;
  args?: Record<string, unknown>;
  id?: string;
}

interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
  functionResponse?: { name: string; response: Record<string, unknown> };
  thoughtSignature?: string;
}

interface GeminiContent {
  role?: string;
  parts?: GeminiPart[];
}

interface GeminiResponse {
  candidates?: { content?: GeminiContent }[];
}

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "list_courses",
        description:
          "Lists course categories, or the courses inside one category, from the official catalogue. Call with no category to show every category; call with a category to show that category's courses.",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description:
                "Optional category (department) name. Omit to list all categories.",
            },
          },
        },
      },
      {
        name: "add_course",
        description:
          "Adds one course from the official catalogue to the student's registration for the current session and semester. Only call this once the student has chosen a specific catalogue course title.",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Exact catalogue course title.",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "remove_course",
        description:
          "Removes one course from the student's current registration for the current session and semester.",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description:
                "The exact title of a course in the student's current registration.",
            },
          },
          required: ["title"],
        },
      },
    ],
  },
];

interface ToolResult {
  output: string;
  changed: boolean;
}

interface ChatContext {
  auth: AuthContext;
  profile: StudentProfile;
  portal: PortalSettings;
  session: string;
  semester: Semester;
  registrations: Registration[];
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findCatalogueCourse(query: string) {
  const q = normalise(query);
  if (!q) return null;
  return (
    COURSE_SUGGESTIONS.find((item) => normalise(item.title) === q) ??
    COURSE_SUGGESTIONS.find(
      (item) =>
        normalise(item.title).includes(q) || q.includes(normalise(item.title))
    ) ??
    null
  );
}

function suggestTitles(query: string): string[] {
  const words = normalise(query).split(" ").filter((word) => word.length > 3);
  if (!words.length) return [];
  return COURSE_SUGGESTIONS.map((item) => item.title)
    .filter((title) => words.some((word) => normalise(title).includes(word)))
    .slice(0, 3);
}

function findRegistered(
  registrations: Registration[],
  query: string
): Registration | null {
  const q = normalise(query);
  if (!q) return null;
  return (
    registrations.find((item) => normalise(item.course?.title ?? "") === q) ??
    registrations.find((item) => {
      const title = normalise(item.course?.title ?? "");
      return title.includes(q) || q.includes(title);
    }) ??
    null
  );
}

function totals(registrations: Registration[]) {
  return registrations.reduce(
    (acc, item) => ({
      units: acc.units + (item.course?.creditUnits ?? 0),
      fee: acc.fee + (item.course?.price ?? 0),
    }),
    { units: 0, fee: 0 }
  );
}

interface CategoryOption {
  category: string;
  count: number;
}

function categoriesWithCounts(): CategoryOption[] {
  const counts = new Map<string, number>();
  for (const item of COURSE_SUGGESTIONS) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return Array.from(counts, ([category, count]) => ({ category, count })).sort(
    (a, b) => a.category.localeCompare(b.category)
  );
}

function findCategory(query: string): string | null {
  const q = normalise(query);
  if (!q) return null;
  const categories = categoriesWithCounts().map((item) => item.category);
  return (
    categories.find((category) => normalise(category) === q) ??
    categories.find(
      (category) =>
        normalise(category).includes(q) || q.includes(normalise(category))
    ) ??
    null
  );
}

function listCatalogue(
  ctx: ChatContext,
  args: Record<string, unknown> | undefined
): ToolResult {
  const query = typeof args?.category === "string" ? args.category : "";

  if (!query.trim()) {
    const options = categoriesWithCounts();
    const lines = [
      `The catalogue has ${options.length} categories. Show every category below and ask the student to choose one:`,
    ];
    for (const option of options) {
      const mine =
        normalise(ctx.profile.department) === normalise(option.category)
          ? " (their department)"
          : "";
      lines.push(`- ${option.category} — ${option.count} courses${mine}`);
    }
    return { output: lines.join("\n"), changed: false };
  }

  const category = findCategory(query);
  if (!category) {
    const names = categoriesWithCounts()
      .map((item) => item.category)
      .join(", ");
    return {
      output: `No category matches "${query}". The categories are: ${names}. Ask the student to choose one of these.`,
      changed: false,
    };
  }

  const courses = COURSE_SUGGESTIONS.filter(
    (item) => item.category === category
  );
  const lines = [
    `${category} has ${courses.length} courses. List all of them and ask the student which one to add:`,
  ];
  for (const course of courses) {
    lines.push(
      `- ${course.title} — ${course.level} — ${DEFAULT_CREDIT_UNITS} credit units — ${formatNaira(
        course.price
      )}`
    );
  }
  return { output: lines.join("\n"), changed: false };
}

async function addCourseToRegistration(
  ctx: ChatContext,
  args: Record<string, unknown> | undefined
): Promise<ToolResult> {
  const title = typeof args?.title === "string" ? args.title : "";
  if (!title.trim()) {
    return {
      output:
        "The call is missing a course title. Ask the student which course they want.",
      changed: false,
    };
  }

  const match = findCatalogueCourse(title);
  if (!match) {
    const suggestions = suggestTitles(title);
    return {
      output: `No catalogue course matches "${title}".${
        suggestions.length ? ` Similar titles: ${suggestions.join("; ")}.` : ""
      } Ask the student to confirm the exact title.`,
      changed: false,
    };
  }

  if (!ctx.portal.registrationOpen) {
    return {
      output: `Course registration is closed for ${ctx.session}, so nothing was added.`,
      changed: false,
    };
  }

  if (
    ctx.registrations.some(
      (item) => normalise(item.course?.title ?? "") === normalise(match.title)
    )
  ) {
    return {
      output: `The student is already registered for ${match.title}.`,
      changed: false,
    };
  }

  const courseType =
    (ctx.profile.department && match.department !== ctx.profile.department) ||
    (ctx.profile.level && match.level !== ctx.profile.level)
      ? "Elective"
      : "Core";

  const course = await createCourse(ctx.auth.supabase, ctx.auth.userId, {
    title: match.title,
    description: match.description,
    category: match.category,
    faculty: match.faculty,
    department: match.department,
    level: match.level,
    semester: ctx.semester,
    creditUnits: DEFAULT_CREDIT_UNITS,
    price: match.price,
    courseType,
  });
  const registration = await createRegistration(
    ctx.auth.supabase,
    ctx.auth.userId,
    course.id,
    ctx.session,
    ctx.semester
  );
  ctx.registrations.push({ ...registration, course });

  const after = totals(ctx.registrations);
  return {
    output: `Added ${match.title} (${match.department}, ${match.level}, ${courseType}, ${DEFAULT_CREDIT_UNITS} credit units, ${formatNaira(
      match.price
    )}). The student now has ${ctx.registrations.length} course(s), ${after.units} credit units and ${formatNaira(
      after.fee
    )} in fees.`,
    changed: true,
  };
}

async function removeCourseFromRegistration(
  ctx: ChatContext,
  args: Record<string, unknown> | undefined
): Promise<ToolResult> {
  const title = typeof args?.title === "string" ? args.title : "";
  if (!title.trim()) {
    return {
      output:
        "The call is missing a course title. Ask the student which course to remove.",
      changed: false,
    };
  }

  const match = findRegistered(ctx.registrations, title);
  if (!match) {
    return {
      output: `None of the student's registered courses matches "${title}".`,
      changed: false,
    };
  }

  if (!ctx.portal.registrationOpen) {
    return {
      output: `Course registration is closed for ${ctx.session}, so nothing was removed.`,
      changed: false,
    };
  }

  const removed = await deleteRegistration(
    ctx.auth.supabase,
    ctx.auth.userId,
    match.courseId,
    ctx.session,
    ctx.semester
  );
  if (!removed) {
    return { output: `Could not remove ${match.course?.title ?? title}.`, changed: false };
  }

  ctx.registrations = ctx.registrations.filter((item) => item.id !== match.id);
  const after = totals(ctx.registrations);
  return {
    output: `Removed ${
      match.course?.title ?? title
    }. The student now has ${ctx.registrations.length} course(s), ${
      after.units
    } credit units and ${formatNaira(after.fee)} in fees.`,
    changed: true,
  };
}

function buildSystemPrompt(ctx: ChatContext): string {
  const { units, fee } = totals(ctx.registrations);
  const lines = [
    "You are the registration assistant inside a university course registration app.",
    "You answer questions about the student's registration and manage it with the tools you are given.",
    "",
    "Rules:",
    "- When the student wants to add a course but has not named a specific one, call list_courses with no category. Show every category it returns, one per line, and ask which one they want.",
    "- When the student picks a category, call list_courses with that category, show every course it returns, and ask which one to add.",
    "- Only call add_course once the student has chosen a specific catalogue course title.",
    "- To add or remove a course you MUST call add_course or remove_course. Never claim a change happened without a successful tool result.",
    "- Only ever use the exact course titles and categories from the catalogue below.",
    "- When a tool returns a list, reproduce the whole list in your reply, one option per line, then ask your question.",
    "- After a successful add or remove, confirm briefly: what changed and the new totals.",
    "- Otherwise keep replies short and in plain text with no markdown headings.",
    "",
    `Student: ${ctx.profile.name || "Unknown"}${
      ctx.profile.matricNumber ? ` (${ctx.profile.matricNumber})` : ""
    }`,
    `Faculty: ${ctx.profile.faculty || "Not set"}`,
    `Department: ${ctx.profile.department || "Not set"}`,
    `Level: ${ctx.profile.level || "Not set"}`,
    `Session: ${ctx.session}`,
    `Semester: ${ctx.semester}`,
    `Registration window: ${ctx.portal.registrationOpen ? "Open" : "Closed"}`,
    `Credit units: unlimited (no maximum per semester)`,
    "",
    `Current registration (${ctx.registrations.length} course(s), ${units} credit units, ${formatNaira(
      fee
    )} in fees):`,
  ];

  if (ctx.registrations.length === 0) {
    lines.push("- (nothing registered yet)");
  } else {
    for (const item of ctx.registrations) {
      const course = item.course;
      lines.push(
        `- ${course?.title ?? "Unknown"} | ${
          course?.category ?? "n/a"
        } | ${course?.level ?? "n/a"} | ${course?.courseType ?? "Core"} | ${
          course?.creditUnits ?? 0
        } credit units | ${course ? formatNaira(course.price) : "n/a"}`
      );
    }
  }

  lines.push("");
  lines.push("Catalogue (title | department | level | fee):");
  for (const item of COURSE_SUGGESTIONS) {
    lines.push(
      `- ${item.title} | ${item.department} | ${item.level} | ${formatNaira(
        item.price
      )}`
    );
  }

  lines.push("");
  lines.push(
    `Adding a catalogue course automatically registers it with ${DEFAULT_CREDIT_UNITS} credit units and its catalogue fee for ${ctx.session}, ${ctx.semester}.`
  );

  return lines.join("\n");
}

async function callGemini(
  contents: GeminiContent[],
  systemPrompt: string,
  apiKey: string
): Promise<GeminiContent> {
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      tools: TOOLS,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 800,
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `AI service returned ${response.status}. ${detail.slice(0, 200)}`
    );
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates?.[0]?.content ?? {};
}

export async function POST(request: Request) {
  const auth = await getAuthContext(request);
  if (!auth) return unauthorized();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "AI assistant is not configured. Set GEMINI_API_KEY in .env.local and restart the dev server.",
      },
      { status: 503 }
    );
  }

  let body: {
    message?: string;
    history?: AiChatMessage[];
    session?: string;
    semester?: string;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
  if (!message) {
    return NextResponse.json(
      { message: "A message is required." },
      { status: 422 }
    );
  }

  try {
    const [profile, portal] = await Promise.all([
      getProfile(auth.supabase, auth.userId),
      getPortalSettings(auth.supabase),
    ]);
    const session = body.session?.trim() || portal.session;
    const semester: Semester =
      body.semester?.trim() === "Second Semester"
        ? "Second Semester"
        : DEFAULT_SEMESTER;

    const ctx: ChatContext = {
      auth,
      profile,
      portal,
      session,
      semester,
      registrations: await listRegistrations(auth.supabase, auth.userId, {
        session,
        semester,
      }),
    };
    const systemPrompt = buildSystemPrompt(ctx);

    const history: GeminiContent[] = (Array.isArray(body.history)
      ? body.history
      : []
    )
      .filter(
        (item) =>
          (item?.role === "user" || item?.role === "model") &&
          typeof item?.text === "string" &&
          item.text.trim() !== ""
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((item) => ({
        role: item.role,
        parts: [{ text: String(item.text).slice(0, 4000) }],
      }));

    const contents: GeminiContent[] = [
      ...history,
      { role: "user", parts: [{ text: message }] },
    ];

    const first = await callGemini(contents, systemPrompt, apiKey);
    const firstParts = first.parts ?? [];
    const calls = firstParts.filter((part) => part.functionCall);

    let replyParts = firstParts;
    let changed = false;

    if (calls.length > 0) {
      const responses: GeminiPart[] = [];
      for (const part of calls) {
        const call = part.functionCall;
        if (!call) continue;

        let result: ToolResult;
        if (call.name === "add_course") {
          result = await addCourseToRegistration(ctx, call.args);
        } else if (call.name === "remove_course") {
          result = await removeCourseFromRegistration(ctx, call.args);
        } else if (call.name === "list_courses") {
          result = listCatalogue(ctx, call.args);
        } else {
          result = { output: `Unknown tool "${call.name}".`, changed: false };
        }

        changed = changed || result.changed;
        responses.push({
          functionResponse: { name: call.name, response: { output: result.output } },
        });
      }

      // Gemini requires the model turn (including thoughtSignature) to be
      // echoed back before a functionResponse is accepted.
      const second = await callGemini(
        [
          ...contents,
          { role: "model", parts: firstParts },
          { role: "user", parts: responses },
        ],
        systemPrompt,
        apiKey
      );
      replyParts = second.parts ?? [];
    }

    const reply = replyParts
      .filter((part) => typeof part.text === "string")
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    return NextResponse.json({
      reply:
        reply ||
        (changed
          ? "Done — your registration has been updated."
          : "I could not put together a reply. Please try again."),
      changed,
    });
  } catch (cause) {
    return serverError(cause, "Failed to reach the AI assistant");
  }
}
