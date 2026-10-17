"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import LoginScreen from "@/components/auth/LoginScreen";
import LandingPage from "@/components/landing/LandingPage";

type Mode = "signin" | "signup";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <Image
        src="/icon.png"
        alt="Deeperlearn logo"
        width={48}
        height={48}
        className="h-12 w-12 animate-pulse rounded-2xl shadow-sm"
        priority
      />
      <p className="text-sm font-medium text-slate-400">
        Loading your dashboard…
      </p>
    </div>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [authMode, setAuthMode] = useState<Mode | null>(null);

  if (status === "loading") return <Splash />;
  if (status === "unauthenticated") {
    if (authMode) {
      return (
        <LoginScreen
          initialMode={authMode}
          onBack={() => setAuthMode(null)}
        />
      );
    }
    return <LandingPage onSignIn={setAuthMode} />;
  }

  return <>{children}</>;
}
