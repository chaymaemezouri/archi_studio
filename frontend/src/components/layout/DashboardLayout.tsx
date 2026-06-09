"use client";

import { useState } from "react";
import AuthHydrator from "./AuthHydrator";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { dashboardShellContainer, dashboardShellPadding } from "./dashboard-shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-app-shell">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[480px] w-[480px] rounded-full bg-app-glow-primary blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-app-glow-secondary blur-[100px]" />
      </div>
      <AuthHydrator />
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="relative z-10 transition-all duration-300 lg:pl-[76px]">
        <Header title={title} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className={cn(dashboardShellPadding, "pt-2 sm:pb-6")}>
          <div className={dashboardShellContainer}>{children}</div>
        </main>
      </div>
    </div>
  );
}
