import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const HEADING_CLASSES: Record<string, string> = {
  h1: "text-2xl font-bold text-slate-900",
  h2: "text-xl font-bold text-slate-900",
  h3: "text-base font-semibold text-slate-900",
  h4: "text-sm font-semibold uppercase tracking-wide text-slate-500",
};

/**
 * Renders the learning materials as GitHub-flavoured Markdown. Raw HTML is not
 * enabled, so any HTML in the source is safely escaped by react-markdown.
 */
export default function MaterialContent({ markdown }: { markdown: string }) {
  return (
    <div className="text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className={`mt-5 mb-3 first:mt-0 ${HEADING_CLASSES.h1}`}>
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className={`mt-5 mb-3 first:mt-0 ${HEADING_CLASSES.h2}`}>
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className={`mt-4 mb-2 first:mt-0 ${HEADING_CLASSES.h3}`}>
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className={`mt-4 mb-2 first:mt-0 ${HEADING_CLASSES.h4}`}>
              {children}
            </h5>
          ),
          h5: ({ children }) => (
            <h5 className={`mt-4 mb-2 first:mt-0 ${HEADING_CLASSES.h4}`}>
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className={`mt-4 mb-2 first:mt-0 ${HEADING_CLASSES.h4}`}>
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1.5 pl-6 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1.5 pl-6 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          del: ({ children }) => <del className="line-through">{children}</del>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-blue-200 bg-blue-50 px-4 py-2 text-slate-700 last:mb-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-slate-200" />,
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100 last:mb-0">
              {children}
            </pre>
          ),
          code: ({ className, children }) => {
            const isBlock =
              typeof className === "string" && className.includes("language-");
            if (isBlock) {
              return <code className="font-mono">{children}</code>;
            }
            return (
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-rose-700">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-slate-200 px-3 py-2 align-top text-slate-700">
              {children}
            </td>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
