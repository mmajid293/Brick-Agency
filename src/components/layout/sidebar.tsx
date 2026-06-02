"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Wallet,
  Package,
  Factory,
  Truck,
  FileText,
  Shield,
  Settings,
  ShoppingCart,
  BarChart3,
  Boxes,
  UserCircle,
  Receipt,
  Flame,
  Car,
} from "lucide-react";
import { useUserRole } from "@/context/role-context";
import { ROLE_NAV } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useApp } from "@/context/app-context";
import type { TranslationKey } from "@/lib/i18n";

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  key: TranslationKey;
  labelUr: string;
  labelEn?: string;
  section: "daily" | "money" | "stock" | "other";
};

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard", labelUr: "ہوم", section: "daily" },
  { href: "/dashboard/today", icon: BarChart3, key: "reports", labelUr: "آج کی رپورٹ", labelEn: "Today Report", section: "daily" },
  { href: "/dashboard/attendance", icon: ClipboardCheck, key: "attendance", labelUr: "حاضری", section: "daily" },
  { href: "/dashboard/workers", icon: Users, key: "workers", labelUr: "مزدور", section: "daily" },
  { href: "/dashboard/production", icon: Factory, key: "production", labelUr: "پیداوار", section: "daily" },
  { href: "/dashboard/kilns", icon: Flame, key: "kilns", labelUr: "بھٹے", labelEn: "Kilns", section: "daily" },
  { href: "/dashboard/customers", icon: ShoppingCart, key: "customers", labelUr: "گاہک", section: "money" },
  { href: "/dashboard/agents", icon: UserCircle, key: "agents", labelUr: "سیلز ایجنٹ", labelEn: "Sales agents", section: "money" },
  { href: "/dashboard/rates", icon: Receipt, key: "rates", labelUr: "شرح نامہ", labelEn: "Rate card", section: "money" },
  { href: "/dashboard/invoices", icon: FileText, key: "invoices", labelUr: "انوائس", labelEn: "Invoices", section: "money" },
  { href: "/dashboard/finance", icon: BarChart3, key: "finance", labelUr: "مالیات", section: "money" },
  { href: "/dashboard/payroll", icon: Wallet, key: "payroll", labelUr: "تنخواہ", section: "money" },
  { href: "/dashboard/inventory", icon: Package, key: "inventory", labelUr: "اینٹیں", section: "stock" },
  { href: "/dashboard/materials", icon: Boxes, key: "materials", labelUr: "خام مال", section: "stock" },
  { href: "/dashboard/dispatch", icon: Truck, key: "dispatch", labelUr: "ٹرک", section: "stock" },
  { href: "/dashboard/vehicles", icon: Car, key: "vehicles", labelUr: "گاڑیاں", labelEn: "Fleet", section: "stock" },
  { href: "/dashboard/portal", icon: UserCircle, key: "workerPortal", labelUr: "مزدور پورٹل", section: "other" },
  { href: "/dashboard/reports", icon: FileText, key: "reports", labelUr: "رپورٹ", section: "other" },
  { href: "/dashboard/audit", icon: Shield, key: "reports", labelUr: "سرگرمی لاگ", labelEn: "Activity log", section: "other" },
  { href: "/dashboard/settings", icon: Settings, key: "settings", labelUr: "ترتیبات", section: "other" },
];

const sectionKeys: Record<NavItem["section"], TranslationKey> = {
  daily: "sectionDaily",
  money: "sectionMoney",
  stock: "sectionStock",
  other: "sectionOther",
};

function navLabel(item: NavItem, locale: "en" | "ur", translate: (k: TranslationKey) => string) {
  if (locale === "ur") return item.labelUr;
  if (item.labelEn) return item.labelEn;
  return translate(item.key);
}

export function Sidebar({
  mobile,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { translate, locale } = useApp();
  const role = useUserRole();
  const sections: NavItem["section"][] = ["daily", "money", "stock", "other"];

  function canSeeItem(item: NavItem) {
    const allowed = ROLE_NAV[role];
    if (allowed.includes("*")) return true;
    if (item.href === "/dashboard") return allowed.includes("dashboard");
    const key = item.href.replace("/dashboard/", "").split("/")[0];
    return allowed.includes(key);
  }

  const visibleNav = navItems.filter(canSeeItem);

  return (
    <aside
      className={cn(
        "flex h-screen w-72 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low p-4",
        mobile
          ? "fixed inset-y-0 left-0 z-50 shadow-2xl"
          : "fixed inset-y-0 left-0 z-30 hidden lg:flex"
      )}
    >
      <Link
        href="/dashboard"
        className="mb-5 block rounded-xl border border-outline-variant/40 bg-surface-container/60 px-3 py-3"
        onClick={onClose}
      >
        <Image
          src={BRAND.logo}
          alt={BRAND.name}
          width={320}
          height={96}
          className="h-[4.5rem] w-full object-contain object-left md:h-20"
          priority
        />
      </Link>

      <nav className="flex-1 space-y-4 overflow-y-auto scrollbar-thin">
        {sections.map((section) => {
          const items = visibleNav.filter((i) => i.section === section);
          return (
            <div key={section}>
              <p
                className={cn(
                  "mb-2 px-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant",
                  locale === "ur" && "font-urdu normal-case text-sm"
                )}
              >
                {translate(sectionKeys[section])}
              </p>
              <div className="space-y-1">
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const label = navLabel(item, locale, translate);
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          "easy-tap flex items-center gap-3 rounded-xl px-4 py-4 transition-all active:scale-[0.98]",
                          active
                            ? "bg-primary text-on-primary shadow-md"
                            : "text-on-surface hover:bg-surface-variant",
                          locale === "ur" && "font-urdu"
                        )}
                      >
                        <Icon className="h-6 w-6 shrink-0" />
                        <span className="text-base font-bold leading-tight">{label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <p
        className={cn(
          "mt-4 border-t border-outline-variant pt-3 text-center text-xs text-on-surface-variant",
          locale === "ur" && "font-urdu text-sm"
        )}
      >
        {locale === "ur" ? "ایجنسی پینل" : "Brick agency panel"}
      </p>
    </aside>
  );
}
