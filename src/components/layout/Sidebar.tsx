"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  ChevronsLeft,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldAlert,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Course Catalogue", href: "/catalogue", icon: LayoutGrid },
  { label: "My Registrations", href: "/registrations", icon: ClipboardList },
  { label: "Learning Progress", href: "/progress", icon: BarChart3 },
  { label: "Completed Lessons", href: "/completed", icon: CheckCircle2 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile } = useProgress();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const items: NavItem[] =
    profile.role === "admin"
      ? [
          ...navItems.slice(0, 1),
          { label: "Admin", href: "/admin", icon: ShieldAlert },
          ...navItems.slice(1),
        ]
      : navItems;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLogoutOpen(false);
    onCloseMobile();
    await signOut();
    toast("You have been logged out", "info");
    router.push("/");
  };

  const renderContent = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <Link
          href="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </span>
          {!compact && (
            <span className="flex flex-col leading-none">
              <span className="text-sm font-bold text-slate-900">LearnHub</span>
              <span className="text-[11px] text-slate-400">
                Student Dashboard
              </span>
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              title={compact ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${compact ? "justify-center" : ""}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              />
              {!compact && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          title={compact ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 ${
            compact ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-400" />
          {!compact && <span>Logout</span>}
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
          aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeft
            className={`h-5 w-5 shrink-0 transition-transform ${
              compact ? "rotate-180" : ""
            }`}
          />
          {!compact && <span>Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderContent(collapsed)}
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
        <div
          className={`absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderContent(false)}
        </div>
      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out"
        description="Are you sure you want to log out of your dashboard? Your progress is saved and will be here when you return."
        footer={
          <>
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                void handleLogout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </>
        }
      />
    </>
  );
}
