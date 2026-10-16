import type { ReactNode } from "react";

const INLINE_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/** Renders a small, safe subset of inline Markdown (**bold** and `code`). */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <code
          key={`${keyPrefix}-c${index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-rose-700"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = INLINE_PATTERN.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

const HEADING_CLASSES: Record<number, string> = {
  1: "text-2xl font-bold text-slate-900",
  2: "text-xl font-bold text-slate-900",
  3: "text-base font-semibold text-slate-900",
  4: "text-sm font-semibold uppercase tracking-wide text-slate-500",
};

/**
 * Renders the supported subset of Markdown used by the generated learning
 * materials. Everything is rendered as React elements (never raw HTML), so the
 * content is safe by construction.
 */
export default function MaterialContent({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  const isBlockStart = (line: string) =>
    /^(#{1,6})\s+/.test(line) ||
    line.trimStart().startsWith("```") ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line) ||
    line.startsWith(">");

  while (index < lines.length) {
    const line = lines[index];

    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100"
        >
          <code className="font-mono">{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      const classes = HEADING_CLASSES[level] ?? HEADING_CLASSES[4];
      const content = renderInline(heading[2], `h${key}`);
      blocks.push(
        level <= 2 ? (
          <h3 key={key++} className={classes}>
            {content}
          </h3>
        ) : (
          <h4 key={key++} className={classes}>
            {content}
          </h4>
        )
      );
      index += 1;
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="border-slate-200" />);
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="border-l-4 border-indigo-200 bg-indigo-50 px-4 py-2 text-slate-700"
        >
          {renderInline(quote.join(" "), `q${key}`)}
        </blockquote>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-6 text-slate-700">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `ul${key}-${i}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={key++} className="list-decimal space-y-1.5 pl-6 text-slate-700">
          {items.map((item, i) => (
            <li key={i}>{renderInline(item, `ol${key}-${i}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() !== "" &&
      !isBlockStart(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={key++} className="leading-relaxed text-slate-700">
        {renderInline(paragraph.join(" "), `p${key}`)}
      </p>
    );
  }

  return <div className="space-y-4">{blocks}</div>;
}
