"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); 
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.error || "Invalid email or password");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Cannot reach server. Run: npm run dev");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 z-0">
        <Image src={BRAND.banner} alt="" fill className="object-cover opacity-35" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
      </div>
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card heat-glow rounded-xl p-8"
        >
          <div className="mb-6 text-center">
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={260}
              height={90}
              className="mx-auto mb-3 h-20 w-auto object-contain drop-shadow-lg"
              priority
            />
            <h1 className="font-display text-2xl font-bold text-on-surface">{BRAND.name}</h1>
            <p className="font-urdu mt-1 text-sm text-on-surface-variant">{BRAND.taglineUr}</p>
          </div>
          <form onSubmit={handleSubmit} className="easy-page space-y-4">
            <div>
              <p className="mb-1 text-sm font-semibold">Email / ای میل</p>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold">Password / پاس ورڈ</p>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-12 text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-base text-error">{error}</p>}
            <p className="text-center text-xs text-on-surface-variant">
              Admin: admin@bhatha.pk / admin123
              <br />
              First time? Run: npm run db:setup
            </p>
            <Button type="submit" size="lg" className="easy-btn-lg h-12 w-full text-lg" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Login / لاگ ان"}
            </Button>
          </form>
          <Link href="/" className="mt-4 block text-center text-sm text-primary hover:underline">
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
