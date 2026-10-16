"use client";

import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import LoginScreen from "@/components/auth/LoginScreen";

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
        <GraduationCap className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-slate-400">
        Loading your dashboard…
      </p>
    </div>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") return <Splash />;
  if (status === "unauthenticated") return <LoginScreen />;

  return <>{children}</>;
}
