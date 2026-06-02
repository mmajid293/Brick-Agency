"use client";

import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  titleUr: string;
  hint?: string;
  hintUr?: string;
  className?: string;
};

export function PageHeader({ title, titleUr, hint, hintUr, className }: Props) {
  const { locale } = useApp();

  return (
    <header className={cn("space-y-2", className)}>
      <h1
        className={cn(
          "font-display text-2xl font-bold text-on-surface md:text-3xl",
          locale === "ur" && "font-urdu"
        )}
      >
        {locale === "ur" ? titleUr : title}
      </h1>
      {(hint || hintUr) && (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed text-on-surface-variant",
            locale === "ur" && "font-urdu"
          )}
        >
          {locale === "ur" ? hintUr ?? hint : hint ?? hintUr}
        </p>
      )}
    </header>
  );
}
