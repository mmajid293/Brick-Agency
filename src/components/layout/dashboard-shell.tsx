"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { RoleProvider } from "@/context/role-context";
import type { Role } from "@prisma/client";

export function DashboardShell({
  children,
  userName = "User",
  userRole = "ADMIN",
}: {
  children: React.ReactNode;
  userName?: string;
  userRole?: Role;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleProvider role={userRole}>
      <div className="min-h-screen bg-background bg-smoke">
        <Sidebar />
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </>
        )}
        <div className="flex min-h-screen w-full min-w-0 flex-col lg:pl-72">
          <Navbar onMenuClick={() => setMobileOpen(true)} userName={userName} />
          <main className="w-full min-w-0 flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
