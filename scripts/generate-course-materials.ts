// Generates the optional self-study learning materials that power the
// "Learning Materials" dashboard feature.
//
// Output:
//   content/course-materials/<category-slug>/<course-slug>.md
//   content/course-materials/index.json   (manifest: course id -> file + lessons)
//
// Run with: node scripts/generate-course-materials.ts
//
// The materials are original, beginner-friendly study guides derived from the
// course catalogue in src/lib/academics.ts. They are supplementary study notes,
// not an official curriculum or accreditation.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  TECHNOLOGY_AREAS,
  TECHNOLOGY_FACULTY,
} from "../src/lib/academics.ts";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ACRONYMS: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  sql: "SQL",
  api: "API",
  apis: "APIs",
  ui: "UI",
  ux: "UX",
  http: "HTTP",
  https: "HTTPS",
  dns: "DNS",
  dhcp: "DHCP",
  "tcp/ip": "TCP/IP",
  vlan: "VLAN",
  iot: "IoT",
  "ci/cd": "CI/CD",
  ai: "AI",
  ml: "ML",
  nlp: "NLP",
  vr: "VR",
  ar: "AR",
};

/** Capitalises a phrase, restoring well-known acronyms in the first word. */
function titleCase(value: string): string {
  const [first, ...rest] = value.split(" ");
  const cased = ACRONYMS[first.toLowerCase()] ?? first.charAt(0).toUpperCase() + first.slice(1);
  return [cased, ...rest].join(" ");
}

/** Splits prose into sentences without breaking common abbreviations badly. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

const LIST_MARKER =
  /\b(?:include|includes|including|such as|topics include|like|explore|explores|examine|examines|study|studies|learn|learns|cover|covers)\b[:\s]+(.+)$/i;

const GENERIC_FOCUS = [
  "the core idea",
  "the typical workflow",
  "the main tool",
  "quality and accuracy",
  "the common mistake",
  "an end-to-end example",
];

/** Pulls concrete concepts out of a course description (the "Topics include…" lists). */
function extractConcepts(description: string): string[] {
  const found: string[] = [];
  for (const sentence of splitSentences(description)) {
    const match = sentence.match(LIST_MARKER);
    if (!match) continue;
    const tail = match[1].replace(/\.$/, "").replace(/\band\b/gi, ",");
    for (const part of tail.split(/[,;]/)) {
      const clean = part
        .trim()
        .replace(/^(?:and|or|the|a|an)\s+/i, "")
        .replace(/[.]+$/, "");
      if (
        clean.length >= 2 &&
        clean.length <= 46 &&
        /^[a-z]/i.test(clean) &&
        !/^(etc|share mental model)$/i.test(clean)
      ) {
        found.push(clean);
      }
    }
  }
  const unique = Array.from(new Set(found.map((c) => c.toLowerCase())));
  return unique.map(titleCase).slice(0, 10);
}

interface LessonDraft {
  title: string;
  focus: string[];
}

function buildLessonPlan(title: string, concepts: string[]): LessonDraft[] {
  const focus = [...concepts];
  let gi = 0;
  while (focus.length < 10) {
    focus.push(titleCase(GENERIC_FOCUS[gi % GENERIC_FOCUS.length]));
    gi += 1;
  }
  return [
    { title: `Foundations of ${title}`, focus: [focus[0], focus[1]] },
    { title: "Core Concepts and Key Terms", focus: [focus[2], focus[3]] },
    { title: "Tools, Environment, and Workflow", focus: [focus[4], focus[5]] },
    { title: "A Guided Practical Example", focus: [focus[6], focus[0]] },
    {
      title: "Common Problems and How to Solve Them",
      focus: [focus[7], focus[8]],
    },
    { title: `Bringing ${title} Together`, focus: [focus[9], focus[1]] },
  ];
}

function formatFocus(focus: string[]): string {
  const items = focus.filter(Boolean);
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function lessonBody(draft: LessonDraft, index: number, title: string): string {
  const lower = title.toLowerCase();
  const focusText = formatFocus(draft.focus);
  const [a, b] = draft.focus;

  const intros = [
    `Every field has a shared language. This lesson introduces ${focusText} so that the rest of the course makes sense. Read each idea slowly and, if something is unfamiliar, look it up before moving on.`,
    `Now that the vocabulary is in place, we connect the pieces. This lesson looks at ${focusText} and shows how they fit into a working ${lower} process.`,
    `Ideas only become useful when you can apply them. Here we look at ${focusText} and how they shape the tools and steps you will use when working on ${lower}.`,
    `This lesson walks through a small, realistic scenario from start to finish. We use ${focusText} to show how the concepts behave when you actually put them to work.`,
    `Things rarely go perfectly the first time. This lesson covers ${focusText} and gives you a calm, repeatable way to find and fix problems.`,
    `This final lesson pulls the course together. We revisit ${focusText} and connect the earlier lessons into one picture so you can continue learning with confidence.`,
  ];

  const explainers = [
    `${titleCase(a)} sets the scene for everything else in ${lower}. Once you can describe it in your own words, you have a reliable starting point for later lessons. ${titleCase(
      b
    )} builds directly on top of it and explains why the topic matters to real tasks.`,
    `${titleCase(a)} and ${titleCase(
      b
    )} are the ideas you will meet most often. Understanding how they relate — rather than memorising them in isolation — is what lets you reason about new situations instead of only repeating examples.`,
    `Choosing the right approach is part of the skill. Understanding ${focusText} helps you decide what to do first, what to check, and what to leave for a later pass when you are working on ${lower}.`,
    `A worked example is the fastest way to learn. Follow the steps below and try to predict the next step before you read it. If your prediction differs, that is a useful signal about which concept needs more attention.`,
    `Problems in ${lower} usually have recognisable patterns. Learning ${focusText} helps you move from guessing to diagnosing: you form a hypothesis, test it, and only then change the work.`,
    `Taken together, ${focusText} show how the parts of ${title} support one another. With this overview you can revisit any lesson, practise deliberately, and set your own next goals.`,
  ];

  const examples = [
    `Create a one-page reference sheet. On one side list ${a}; on the other, write one sentence explaining ${b} in plain language. Keep it nearby as you study.`,
    `Take a recent example of ${lower} you have seen (in a tutorial, a product, or the news). Identify where ${a} appears and where ${b} matters. Write two or three sentences connecting them.`,
    `Sketch the steps you would follow to complete a small ${lower} task. Mark on your sketch where ${a} and ${b} appear and why the order matters.`,
    `Work through a small example by hand. Change one detail — a value, a rule, or an input — and predict what will happen before you check. Explain the result using ${a}.`,
    `Look at a piece of work that contains a mistake. Describe what is wrong, which concept was ignored, and what you would do differently.`,
    `Plan a small project you could finish in a few hours. List the concepts from this course you would need and write down how you would know it worked.`,
  ];

  const questions = [
    `In your own words, what is ${a}, and why does it matter in ${lower}?`,
    `How are ${a} and ${b} connected?`,
    `What is one practical situation where this lesson would help you?`,
  ];

  return [
    `### What you will learn`,
    ``,
    `- What ${a} means and why it matters.`,
    `- How ${b} fits into the wider picture.`,
    `- A small way to practise the idea today.`,
    ``,
    `### Explanation`,
    ``,
    intros[index],
    ``,
    explainers[index],
    ``,
    `### Practical example`,
    ``,
    examples[index],
    ``,
    `### Review questions`,
    ``,
    questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
  ].join("\n");
}

interface GeneratedCourse {
  id: string;
  title: string;
  department: string;
  file: string;
  markdown: string;
  lessons: { id: string; title: string }[];
}

function buildCourse(
  faculty: string,
  department: string,
  note: string,
  title: string,
  description: string,
  level: string
): GeneratedCourse {
  const concepts = extractConcepts(description);
  const plan = buildLessonPlan(title, concepts);
  const id = slug(`${faculty}-${department}-${level}-${title}`);
  const introSentence = splitSentences(description)[0] ?? description;

  const objectiveLines = [
    `- Explain the main ideas that make up ${title.toLowerCase()}.`,
    ...concepts
      .slice(0, 5)
      .map((c) => `- Describe ${c.toLowerCase()} and how it is used.`),
    `- Apply the concepts to a small, realistic task.`,
    `- Recognise common mistakes and know how to avoid them.`,
  ];

  const lessonSections = plan.map((draft, i) => {
    const heading = `## Lesson ${i + 1}: ${draft.title}`;
    return `${heading}\n\n${lessonBody(draft, i, title)}`;
  });

  const markdown = [
    `# ${title}`,
    ``,
    `_${department} · ${faculty} · Level ${level}_`,
    ``,
    `## Overview`,
    ``,
    `${title} is part of the ${department} area. ${introSentence} This self-study guide takes you from the core vocabulary through to a small practical project so you can learn at your own pace.`,
    ``,
    `## Learning Objectives`,
    ``,
    `By the end of this course you should be able to:`,
    ``,
    objectiveLines.join("\n"),
    ``,
    `## Introduction`,
    ``,
    `${note}`,
    ``,
    `In this subject, the goal is not just to memorise facts but to build a reliable way of thinking about ${title.toLowerCase()}. Work through each lesson in order, try the examples, and answer the review questions before moving on. If a term is new, write a one-line definition in your own words — that habit alone will make the material stick.`,
    ``,
    lessonSections.join("\n\n"),
    ``,
    `## Summary`,
    ``,
    `You have covered the foundations of ${title.toLowerCase()}, the key terms, the tools and workflow, a guided example, and common problems. Taken together, these lessons give you a working understanding you can build on through practice.`,
    ``,
    `## Suggested next steps`,
    ``,
    `- Re-read your notes and rewrite the review questions in your own words.`,
    `- Build one small project that uses at least three concepts from this course.`,
    `- Read an introductory article or watch a short tutorial on ${title.toLowerCase()} and compare it with what you learned here.`,
    `- Explore a related course in the ${department} area to widen your skills.`,
    ``,
  ].join("\n");

  const lessons = plan.map((draft, i) => ({
    id: `lesson-${i + 1}-${slug(draft.title)}`,
    title: draft.title,
  }));

  const file = `${slug(department)}/${slug(title)}.md`;
  return { id, title, department, file, markdown, lessons };
}

// ---------------------------------------------------------------------------

const LEVEL = "100L";
const rootDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
  "course-materials"
);

const courses: GeneratedCourse[] = [];
for (const area of TECHNOLOGY_AREAS) {
  for (const subunit of area.subunits) {
    courses.push(
      buildCourse(
        TECHNOLOGY_FACULTY,
        area.department,
        area.note,
        subunit.title,
        subunit.description,
        LEVEL
      )
    );
  }
}

mkdirSync(rootDir, { recursive: true });

for (const course of courses) {
  const filePath = path.join(rootDir, course.file);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, course.markdown, "utf8");
}

const manifest = {
  faculty: TECHNOLOGY_FACULTY,
  level: LEVEL,
  generatedAt: new Date().toISOString(),
  courses: Object.fromEntries(
    courses.map((course) => [
      course.id,
      {
        file: course.file,
        title: course.title,
        department: course.department,
        lessons: course.lessons,
      },
    ])
  ),
};

writeFileSync(
  path.join(rootDir, "index.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log(
  `Wrote ${courses.length} course material files + index.json to ${rootDir}`
);
