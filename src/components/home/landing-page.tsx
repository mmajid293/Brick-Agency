"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { useApp } from "@/context/app-context";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Worker Management",
    titleUr: "مزدور انتظام",
    desc: "Attendance, advances (Peshgi), and daily wages in one place.",
  },
  {
    title: "Inventory Control",
    titleUr: "اسٹاک کنٹرول",
    desc: "Track bricks, raw materials, and fuel with low-stock alerts.",
  },
  {
    title: "Production Tracking",
    titleUr: "پیداوار",
    desc: "Daily output, kiln cycles, fuel usage, and efficiency.",
  },
  {
    title: "Finance & Payroll",
    titleUr: "مالیات",
    desc: "Income, expenses, payroll, and profit/loss reports.",
  },
  {
    title: "Dispatch & Sales",
    titleUr: "ڈسپیچ",
    desc: "Orders, truck dispatch, challans, and customer payments.",
  },
  {
    title: "Reports & Analytics",
    titleUr: "رپورٹس",
    desc: "Export data and grow your bhatha with clear numbers.",
  },
];

export function LandingPage() {
  const { translate, locale, setLocale } = useApp();

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="fixed top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/90 px-4 py-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="shrink-0">
            <Logo height={44} />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === "en" ? "ur" : "en")}
              className={locale === "ur" ? "font-urdu" : ""}
            >
              <Globe className="mr-1 h-4 w-4" />
              {locale === "en" ? "اردو" : "EN"}
            </Button>
            <ThemeToggle size="sm" />
            <Link href="/login">
              <Button size="sm" className="gap-1">
                {translate("getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Home banner */}
      <section className="relative pt-[72px]">
        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl md:rounded-3xl">
            <Image
              src={BRAND.banner}
              alt={BRAND.name}
              width={1920}
              height={720}
              className="h-auto w-full object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>

          <div className="relative z-10 -mt-8 mx-auto max-w-4xl px-2 pb-8 md:-mt-12 md:pb-12">
            <div className="glass-card heat-glow rounded-2xl border border-primary/20 p-6 text-center md:p-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary md:text-sm">
                {locale === "ur"
                  ? "ہوشیار انتظام • بہتر پیداوار • زیادہ منافع"
                  : "Smart Management • Better Production • Higher Profit"}
              </p>
              <h1
                className={cn(
                  "font-display text-3xl font-extrabold leading-tight text-on-surface md:text-5xl",
                  locale === "ur" && "font-urdu"
                )}
              >
                {translate("heroTitle")}
              </h1>
              <p
                className={cn(
                  "mx-auto mt-4 max-w-2xl text-base text-on-surface-variant md:text-lg",
                  locale === "ur" && "font-urdu leading-loose"
                )}
              >
                {translate("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/login">
                  <Button size="lg" className="group gap-2">
                    {translate("getStarted")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {locale === "ur" ? "ڈیش بورڈ" : "View Dashboard"}
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-on-surface-variant">{BRAND.taglineEn}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pattern py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 text-center">
            <h2
              className={cn(
                "font-display text-2xl font-bold text-on-surface md:text-4xl",
                locale === "ur" && "font-urdu"
              )}
            >
              {translate("aboutBhatha")}
            </h2>
            <p className={cn("mt-2 text-on-surface-variant", locale === "ur" && "font-urdu")}>
              {locale === "ur"
                ? "ایک ہی سسٹم سے پورا بھٹہ چلائیں"
                : "Run your entire kiln from one unified system."}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card heat-glow rounded-xl p-6">
                <h3
                  className={cn(
                    "font-display mb-2 text-lg font-semibold text-on-surface",
                    locale === "ur" && "font-urdu"
                  )}
                >
                  {locale === "ur" ? f.titleUr : f.title}
                </h3>
                <p className={cn("text-sm text-on-surface-variant", locale === "ur" && "font-urdu")}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-variant bg-surface-container-lowest px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo height={40} />
          <p className="text-center text-sm text-on-surface-variant md:text-left">
            © 2026 {BRAND.name}. {BRAND.taglineEn}
          </p>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            {translate("login")} →
          </Link>
        </div>
      </footer>
    </div>
  );
}
