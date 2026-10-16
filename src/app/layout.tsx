import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import { RegistrationProvider } from "@/components/providers/RegistrationProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import AuthGate from "@/components/auth/AuthGate";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnHub | Student Learning Dashboard",
  description:
    "Manage your courses, access lessons and track your learning progress in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <ToastProvider>
          <AuthProvider>
            <AuthGate>
              <ProgressProvider>
                <RegistrationProvider>
                  <AppShell>{children}</AppShell>
                </RegistrationProvider>
              </ProgressProvider>
            </AuthGate>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
