import { createElement, type ReactElement } from "react";
import {
  Cloud,
  Code2,
  Database,
  Infinity as InfinityIcon,
  Palette,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey } from "@/types";

export interface Accent {
  gradient: string;
  soft: string;
  text: string;
  ring: string;
  solid: string;
  bar: string;
}

export const accentStyles: Record<AccentKey, Accent> = {
  blue: {
    gradient: "from-blue-600 to-teal-500",
    soft: "bg-blue-50 text-blue-700",
    text: "text-blue-600",
    ring: "ring-blue-200",
    solid: "bg-blue-600",
    bar: "bg-blue-600",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    soft: "bg-emerald-50 text-emerald-700",
    text: "text-emerald-600",
    ring: "ring-emerald-200",
    solid: "bg-emerald-600",
    bar: "bg-emerald-600",
  },
  fuchsia: {
    gradient: "from-fuchsia-500 to-pink-600",
    soft: "bg-fuchsia-50 text-fuchsia-700",
    text: "text-fuchsia-600",
    ring: "ring-fuchsia-200",
    solid: "bg-fuchsia-600",
    bar: "bg-fuchsia-600",
  },
  sky: {
    gradient: "from-sky-500 to-cyan-600",
    soft: "bg-sky-50 text-sky-700",
    text: "text-sky-600",
    ring: "ring-sky-200",
    solid: "bg-sky-600",
    bar: "bg-sky-600",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    soft: "bg-amber-50 text-amber-700",
    text: "text-amber-600",
    ring: "ring-amber-200",
    solid: "bg-amber-500",
    bar: "bg-amber-500",
  },
  violet: {
    gradient: "from-violet-500 to-purple-600",
    soft: "bg-violet-50 text-violet-700",
    text: "text-violet-600",
    ring: "ring-violet-200",
    solid: "bg-violet-600",
    bar: "bg-violet-600",
  },
  rose: {
    gradient: "from-rose-500 to-red-600",
    soft: "bg-rose-50 text-rose-700",
    text: "text-rose-600",
    ring: "ring-rose-200",
    solid: "bg-rose-600",
    bar: "bg-rose-600",
  },
};

export const courseIcons: Record<string, LucideIcon> = {
  code: Code2,
  terminal: TerminalSquare,
  palette: Palette,
  cloud: Cloud,
  database: Database,
  infinity: InfinityIcon,
};

export function getAccent(key: AccentKey): Accent {
  return accentStyles[key] ?? accentStyles.blue;
}

export function getCourseIcon(key: string): LucideIcon {
  return courseIcons[key] ?? Code2;
}

export function renderCourseIcon(
  key: string,
  className: string
): ReactElement {
  const Icon = courseIcons[key] ?? Code2;
  return createElement(Icon, { className });
}
