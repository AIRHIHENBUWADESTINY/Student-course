"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRegistration } from "@/components/providers/RegistrationProvider";
import { aiApi } from "@/lib/api";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const QUICK_PROMPTS = [
  "Summarize my registration",
  "Add Mobile App Development",
  "Show me the course categories",
];

export default function ChatBot() {
  const reg = useRegistration();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(1);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;

    const history = messages.map((item) => ({
      role: item.role === "user" ? ("user" as const) : ("model" as const),
      text: item.text,
    }));

    setMessages((prev) => [
      ...prev,
      { id: nextIdRef.current++, role: "user", text },
    ]);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const result = await aiApi.chat({
        message: text,
        history,
        session: reg.summary.session,
        semester: reg.summary.semester,
      });
      setMessages((prev) => [
        ...prev,
        { id: nextIdRef.current++, role: "assistant", text: result.reply },
      ]);
      if (result.changed) reg.reload();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to reach the assistant. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Registration assistant
          </h2>
          <p className="text-sm text-slate-500">
            Chat about your registration to add or remove courses for you. Ask
            me anything, or try one of the suggestions below
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Gemini
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={busy || messages.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear chat
          </Button>
        </div>
      </div>

      {(messages.length > 0 || busy) && (
        <div
          ref={scrollRef}
          className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-4"
        >
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "rounded-br-sm bg-blue-600 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <p className="whitespace-pre-line">{item.text}</p>
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
        >
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            disabled={busy}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={
            reg.summary.count === 0
              ? "e.g. Add Mobile App Development"
              : "Ask about your registration…"
          }
          disabled={busy}
          aria-label="Message the registration assistant"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
        />
        <Button type="submit" disabled={busy || !input.trim()}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {busy ? "Sending…" : "Send"}
        </Button>
      </form>
    </section>
  );
}
