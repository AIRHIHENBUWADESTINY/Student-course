import type { MaterialLesson } from "@/types";

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
  gui: "GUI",
  rest: "REST",
  cpu: "CPU",
  ram: "RAM",
  os: "OS",
  rag: "RAG",
};

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "vs",
  "with",
]);

/** URL/file-safe slug used for course folders, files and lesson ids. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Capitalises a phrase, restoring well-known acronyms and small words. */
function titleCase(value: string): string {
  const words = value.split(/\s+/).filter(Boolean);
  return words
    .map((word, index) => {
      const key = word.toLowerCase().replace(/[^a-z0-9/+#]/g, "");
      if (ACRONYMS[key]) return ACRONYMS[key];
      if (index > 0 && SMALL_WORDS.has(key)) return key;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/** Lowercases a topic for use mid-sentence while keeping known acronyms. */
function lowerTopic(value: string): string {
  return value
    .split(/\s+/)
    .map((word, index) => {
      const key = word.toLowerCase().replace(/[^a-z0-9/+#]/g, "");
      if (ACRONYMS[key]) return ACRONYMS[key];
      if (index === 0) return word.charAt(0).toLowerCase() + word.slice(1);
      return word.toLowerCase();
    })
    .join(" ");
}

/** Splits prose into sentences without breaking common abbreviations badly. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

const TOPIC_MARKER =
  /\b(?:including|includes?|such as|topics include|examin(?:e|es|ing)|explor(?:e|es|ing)|studi(?:es|ed|ying)|study|learn(?:s|ing|t)?|cover(?:s|ing|ed)?)\b[:\s]+(.+)$/i;

const IGNORED_TOPICS = /\b(?:etc|and so on|share mental model)\b/i;

function cleanTopic(raw: string): string {
  return raw
    .trim()
    .replace(/^[\s:;,\-]+/, "")
    .replace(
      /^(?:about|how|to|that|which|where|the|a|an|and|or|using|their|its|some|other|these|those|various|different)\s+/i,
      ""
    )
    .replace(/[,;.]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pulls concrete topics out of a course description (its "Topics include…" lists). */
function extractTopics(description: string): string[] {
  const found: string[] = [];
  for (const sentence of splitSentences(description)) {
    const match = sentence.match(TOPIC_MARKER);
    if (!match) continue;
    const tail = match[1].replace(/\.$/, "").replace(/\s+and\s+/gi, ",");
    for (const part of tail.split(/[,;]/)) {
      const topic = cleanTopic(part);
      if (
        topic.length >= 3 &&
        topic.length <= 42 &&
        /^[a-z0-9]/i.test(topic) &&
        !IGNORED_TOPICS.test(topic)
      ) {
        found.push(topic);
      }
    }
  }
  const unique = new Map<string, string>();
  for (const topic of found) {
    const key = topic.toLowerCase();
    if (!unique.has(key)) unique.set(key, titleCase(topic));
  }
  return Array.from(unique.values()).slice(0, 8);
}

function introLessonBody(
  title: string,
  department: string,
  firstSentence: string,
  note: string
): string {
  return [
    `### What this lesson covers`,
    ``,
    firstSentence ||
      `${title} sits inside the wider ${department} area of technology.`,
    ``,
    `### Explanation`,
    ``,
    `This opening lesson gives you the map for the whole course. You will meet the vocabulary, the purpose of ${title.toLowerCase()}, and the way the later lessons build on one another. Aim to finish this lesson able to explain, in one or two sentences, what ${title} is and why it belongs to ${department}.`,
    ``,
    `The goal is not to memorise everything at once. Read the description once for the big picture, then return to the words you could not yet define and look them up before continuing.`,
    ``,
    ...(note ? [`_About the area:_ ${note}`, ``] : []),
    `### Practice`,
    ``,
    `Write a short paragraph (three or four sentences) answering: "What is ${title}, and what kinds of problems does it solve?" Keep it somewhere handy so you can improve it as you read on.`,
    ``,
    `### Review questions`,
    ``,
    `1. In your own words, what is ${title}?`,
    `2. Which ideas in this course are already familiar, and which are new?`,
    `3. Why does ${title} matter within the ${department} area?`,
  ].join("\n");
}

function topicLessonBody(
  title: string,
  department: string,
  topic: string
): string {
  const lowerTitle = title.toLowerCase();
  const topicText = lowerTopic(topic);
  return [
    `### What this lesson covers`,
    ``,
    `A closer look at ${topicText} and the part it plays in ${lowerTitle}.`,
    ``,
    `### Explanation`,
    ``,
    `"${topic}" is one of the building blocks of ${title}. You will recognise it whenever you work on a ${lowerTitle} task, because it shapes the decisions you make and the results you produce.`,
    ``,
    `Getting comfortable with ${topicText} makes the rest of the ${department} material easier to follow, since later topics build on it. Read the description again slowly, then write your own one-sentence definition before moving on.`,
    ``,
    `### Practice`,
    ``,
    `Write a short definition of ${topicText} in your own words, then find one real example — from a tutorial, a product, or your own work — and describe where ${topicText} appears and why it matters.`,
    ``,
    `### Review questions`,
    ``,
    `1. What is ${topicText}, and why does it matter in ${lowerTitle}?`,
    `2. Give one example of ${topicText} in a real ${department.toLowerCase()} task.`,
    `3. Which other topic in this course does ${topicText} connect to, and how?`,
  ].join("\n");
}

function capstoneLessonBody(
  title: string,
  department: string,
  lastSentence: string,
  topics: string[]
): string {
  const lowerTitle = title.toLowerCase();
  const topicList =
    topics.length > 0
      ? topics.map((topic) => lowerTopic(topic)).join(", ")
      : `the core ideas of ${lowerTitle}`;
  return [
    `### What this lesson covers`,
    ``,
    lastSentence ||
      `Bringing every part of ${title} together into one workable picture.`,
    ``,
    `### Explanation`,
    ``,
    `This final lesson brings ${title} together. You have looked at ${topicList} and seen how they relate. Individually they are manageable; together they describe how ${lowerTitle} work is actually done, from understanding a problem to producing something that works.`,
    ``,
    `### Practice`,
    ``,
    `Plan a small project you could finish in a few hours. List which of the topics from this course you would need, put them in the order you would tackle them, and write down how you would know the result worked.`,
    ``,
    `### Course summary`,
    ``,
    `You have covered the foundations of ${lowerTitle}, its key terms, and ${
      topics.length > 0
        ? `the core topics (${topics.length})`
        : "the core topics"
    }, and how they fit together. That gives you a working base you can build on with practice.`,
    ``,
    `### Suggested next steps`,
    ``,
    `- Re-read your notes and rewrite the review questions in your own words.`,
    `- Build one small project that uses at least three of the topics above.`,
    `- Read an introductory article or watch a short tutorial on ${lowerTitle} and compare it with what you learned here.`,
    `- Explore a related course in the ${department} area to broaden your skills.`,
    ``,
    `### Review questions`,
    ``,
    `1. How do the topics in this course connect to one another?`,
    `2. Which topic do you feel least confident about, and what will you do next to improve?`,
    `3. What would a realistic first project in ${lowerTitle} look like for you?`,
  ].join("\n");
}

export interface BuiltMaterial {
  overview: string;
  lessons: MaterialLesson[];
}

export interface MaterialSource {
  title: string;
  department: string;
  /** Optional category/area introduction supplied by the catalogue. */
  note?: string;
  description: string;
}

/**
 * Builds readable self-study material (overview + ordered lessons) from a
 * course description. The lesson plan is derived from the topics named in the
 * description, so every course gets content that reflects its own catalogue
 * entry. Used both by the offline generator and the runtime fallback.
 */
export function buildMaterialFromDescription({
  title,
  department,
  note = "",
  description,
}: MaterialSource): BuiltMaterial {
  const sentences = splitSentences(description);
  const topics = extractTopics(description);

  const objectiveLines = [
    `- Explain the main ideas that make up ${title.toLowerCase()}.`,
    ...topics
      .slice(0, 5)
      .map((topic) => `- Describe ${lowerTopic(topic)} and how it is used.`),
    `- Apply the concepts to a small, realistic task.`,
    `- Recognise common mistakes and know how to avoid them.`,
  ];

  const overview = [
    `## Overview`,
    ``,
    description,
    ``,
    `## Learning Objectives`,
    ``,
    `By the end of this course you should be able to:`,
    ``,
    objectiveLines.join("\n"),
    ``,
    `## Introduction`,
    ``,
    ...(note ? [note, ``] : []),
    `In this subject, the goal is not just to memorise facts but to build a reliable way of thinking about ${title.toLowerCase()}. Work through each lesson in order, try the examples, and answer the review questions before moving on. If a term is new, write a one-line definition in your own words — that habit alone will make the material stick.`,
  ].join("\n");

  const drafts: { title: string; content: string }[] = [];

  drafts.push({
    title: `Introduction to ${title}`,
    content: introLessonBody(title, department, sentences[0] ?? "", note),
  });

  for (const topic of topics) {
    const lessonTitle = topic === title ? `${topic} in Detail` : topic;
    drafts.push({
      title: lessonTitle,
      content: topicLessonBody(title, department, topic),
    });
  }

  drafts.push({
    title: `${title}: Putting It into Practice`,
    content: capstoneLessonBody(
      title,
      department,
      sentences[sentences.length - 1] ?? "",
      topics
    ),
  });

  const lessons: MaterialLesson[] = drafts.map((draft, index) => ({
    id: `lesson-${index + 1}-${slugify(draft.title)}`,
    title: draft.title,
    content: draft.content,
  }));

  return { overview, lessons };
}

export interface MaterialRenderMeta {
  faculty: string;
  level: string;
}

export interface ComposedMaterial extends BuiltMaterial {
  markdown: string;
}

/**
 * Composes a full course material file (heading, meta line, overview, lessons)
 * for the offline generator. `parseMaterial` reads exactly this shape back.
 */
export function composeCourseMaterial(
  source: MaterialSource,
  meta: MaterialRenderMeta
): ComposedMaterial {
  const { overview, lessons } = buildMaterialFromDescription(source);
  const lessonSections = lessons.map(
    (lesson, index) => `## Lesson ${index + 1}: ${lesson.title}\n\n${lesson.content}`
  );

  const markdown = [
    `# ${source.title}`,
    ``,
    `_${source.department} · ${meta.faculty} · Level ${meta.level}_`,
    ``,
    overview,
    ``,
    lessonSections.join("\n\n"),
    ``,
  ].join("\n");

  return { overview, lessons, markdown };
}
