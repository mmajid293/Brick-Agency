"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Bell, Globe, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useApp } from "@/context/app-context";
import { cn } from "@/lib/utils";

interface NavbarProps {
  userName?: string;
  onMenuClick?: () => void;
}

type SearchResults = {
  workers: { id: string; name: string; workerCode: string | null; phone: string }[];
  customers: { id: string; name: string; phone: string }[];
  orders: { id: string; orderNumber: string; customerId: string; customer: { name: string } }[];
};

export function Navbar({ userName = "Admin", onMenuClick }: NavbarProps) {
  const { locale, setLocale, translate } = useApp();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [notifications, setNotifications] = useState<{ title: string; message: string }[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setNotifications(res.data.notifications?.slice(0, 5) ?? res.data?.slice?.(0, 5) ?? []);
      })
      .catch(() => {});
  }, []);

  const runSearch = useCallback((q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setResults(res.data);
          setShowResults(true);
        }
      })
      .catch(() => setResults(null));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(search), 300);
    return () => clearTimeout(t);
  }, [search, runSearch]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navigateTo = (path: string) => {
    setShowResults(false);
    setSearch("");
    router.push(path);
  };

  const hasResults =
    results &&
    (results.workers.length > 0 || results.customers.length > 0 || results.orders.length > 0);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-xl md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="text-on-surface-variant hover:text-on-surface lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          placeholder={locale === "ur" ? "نام یا فون تلاش کریں..." : "Search name or phone..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search.length >= 2 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="h-12 rounded-full border-outline-variant bg-surface-container pl-11 text-base"
        />
        {showResults && hasResults && (
          <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-xl glass-card p-2 shadow-lg">
            {results.workers.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Workers</p>
                {results.workers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-brick/10"
                    onMouseDown={() => navigateTo(`/dashboard/workers?highlight=${w.id}`)}
                  >
                    {w.name} {w.workerCode && <span className="text-xs opacity-70">({w.workerCode})</span>}
                  </button>
                ))}
              </div>
            )}
            {results.customers.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Customers</p>
                {results.customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-brick/10"
                    onMouseDown={() => navigateTo(`/dashboard/customers?highlight=${c.id}`)}
                  >
                    {c.name} — {c.phone}
                  </button>
                ))}
              </div>
            )}
            {results.orders.length > 0 && (
              <div>
                <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">Orders</p>
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-brick/10"
                    onMouseDown={() => navigateTo(`/dashboard/customers?highlight=${o.customerId}&ledger=1`)}
                  >
                    {o.orderNumber} — {o.customer.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocale(locale === "en" ? "ur" : "en")}
          className={cn(
            "text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary",
            locale === "ur" && "font-urdu"
          )}
        >
          <Globe className="mr-1 h-4 w-4" />
          {locale === "en" ? "اردو" : "EN"}
        </Button>
        <ThemeToggle />
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
            )}
          </Button>
          {showNotif && notifications.length > 0 && (
            <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl glass-card p-2 shadow-lg">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="border-b border-outline-variant/30 p-2 text-xs last:border-0"
                >
                  <p className="font-medium text-on-surface">{n.title}</p>
                  <p className="text-on-surface-variant">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <span className="hidden text-sm font-medium text-on-surface sm:inline">{userName}</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
          onClick={logout}
          title={translate("logout")}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
