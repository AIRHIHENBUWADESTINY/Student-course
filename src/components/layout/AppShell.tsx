"use client";

import { Suspense, useState, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import Button from "@/components/ui/Button";
import { useProgress } from "@/components/providers/ProgressProvider";

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-800">
        We couldn&apos;t load your dashboard
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      <Button className="mt-5" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { ready, error, reload } = useProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Suspense
        fallback={<div className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:block" />}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : ready ? (
              children
            ) : (
              <LoadingState />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
