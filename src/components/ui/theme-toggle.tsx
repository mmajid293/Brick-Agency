"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  size?: "sm" | "md";
};

/** Theme toggle with icon/colors that contrast the current background */
export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-surface-container",
          size === "sm" ? "h-9 w-9" : "h-10 w-10",
          className
        )}
        aria-hidden
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border transition-all duration-200",
        size === "sm" ? "h-9 w-9" : "h-10 w-10",
        isDark
          ? "border-outline-variant/50 bg-surface-container-high text-secondary hover:border-primary/40 hover:bg-primary-container/25 hover:text-primary hover:shadow-[0_0_20px_rgba(183,65,14,0.25)]"
          : "border-primary-container/60 bg-primary-container/30 text-primary hover:border-primary hover:bg-primary hover:text-on-primary hover:shadow-[0_0_16px_rgba(183,65,14,0.2)]",
        className
      )}
    >
      {isDark ? (
        <Sun className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2} />
      ) : (
        <Moon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2} />
      )}
    </button>
  );
}
