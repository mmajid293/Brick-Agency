"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useApp } from "@/context/app-context";
import {
  ClipboardCheck,
  Users,
  ShoppingCart,
  Truck,
  Wallet,
  Factory,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const actions: {
  href: string;
  icon: LucideIcon;
  labelEn: string;
  labelUr: string;
  color: string;
}[] = [
  { href: "/dashboard/attendance", icon: ClipboardCheck, labelEn: "Mark Attendance", labelUr: "حاضری لگائیں", color: "from-green-500/20 to-emerald-600/30 border-green-500/40" },
  { href: "/dashboard/workers", icon: Users, labelEn: "Workers", labelUr: "مزدور", color: "from-blue-500/20 to-indigo-600/30 border-blue-500/40" },
  { href: "/dashboard/customers", icon: ShoppingCart, labelEn: "Customers", labelUr: "گاہک", color: "from-purple-500/20 to-violet-600/30 border-purple-500/40" },
  { href: "/dashboard/dispatch", icon: Truck, labelEn: "Send Truck", labelUr: "ٹرک بھیجیں", color: "from-amber-500/20 to-orange-600/30 border-amber-500/40" },
  { href: "/dashboard/production", icon: Factory, labelEn: "Production", labelUr: "پیداوار", color: "from-red-500/20 to-rose-600/30 border-red-500/40" },
  { href: "/dashboard/finance", icon: Wallet, labelEn: "Money", labelUr: "رقم / خرچ", color: "from-teal-500/20 to-cyan-600/30 border-teal-500/40" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export function QuickActions() {
  const { locale, translate } = useApp();

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-4">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xl font-bold text-on-surface"
      >
        {locale === "ur" ? "فوری کام" : "Quick actions"}
      </motion.h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {actions.map((a) => {
          const Icon = a.icon;
          const label = locale === "ur" ? a.labelUr : a.labelEn;
          return (
            <motion.div key={a.href} variants={item}>
              <Link href={a.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`easy-tap flex flex-col items-center gap-2 rounded-2xl border-2 bg-gradient-to-br p-5 text-center shadow-sm ${a.color}`}
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <span className={`text-sm font-bold ${locale === "ur" ? "font-urdu" : ""}`}>
                    {label}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
