"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Cake,
  Info,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { MIN_AGE, maxDateOfBirth, minDateOfBirth } from "@/lib/validation";

type Mode = "signin" | "signup";

export default function LoginScreen({
  initialMode = "signin",
  onBack,
}: {
  initialMode?: Mode;
  onBack?: () => void;
}) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSubmitting(false);
    setName("");
    setEmail("");
    setPassword("");
    setDateOfBirth("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(name.trim(), email.trim(), password, dateOfBirth);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : mode === "signin"
            ? "Unable to sign in. Please try again."
            : "Unable to create your account. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>
        )}
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/icon.png"
            alt="Deeplearn logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl shadow-sm"
            priority
          />
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            {mode === "signin"
              ? "Welcome back to Deeplearn"
              : "Create your Deeplearn account"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "signin"
              ? "Sign in to continue tracking your learning progress."
              : "Register to start tracking your courses and lessons."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Date of birth
              </label>
              <div className="relative">
                <Cake className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="dateOfBirth"
                  type="date"
                  autoComplete="bday"
                  required
                  min={minDateOfBirth()}
                  max={maxDateOfBirth()}
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={mode === "signup" ? 6 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting
              ? mode === "signin"
                ? "Signing in…"
                : "Creating account…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>

          {mode === "signin" ? (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Sign in with an account you created earlier. No account yet?
                Switch to &quot;Create account&quot;.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Passwords must be at least 6 characters and you must be at
                least {MIN_AGE} years old. If your project has email
                confirmation enabled, confirm your inbox before signing in.
              </p>
            </div>
          )}

          <div className="text-center text-sm text-slate-500">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}