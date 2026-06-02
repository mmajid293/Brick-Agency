"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/app-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="smart-bhatha-theme">
      <AppProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </AppProvider>
    </ThemeProvider>
  );
}
