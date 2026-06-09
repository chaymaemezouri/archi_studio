"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import StudioBrand from "@/components/layout/StudioBrand";
import { useStudio } from "@/hooks/useStudio";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAV_GROUPS, isSidebarItemActive } from "@/lib/sidebar-nav";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const studio = useStudio();

  const navContent = (
    <>
      {onMobileClose && (
        <div className="flex h-[40px] items-center justify-end px-2 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex shrink-0 justify-center px-1.5 pb-2 pt-2.5">
        <Link
          href="/dashboard"
          onClick={onMobileClose}
          title={studio?.name ?? "Accueil"}
          aria-label={studio?.name ? `Accueil · ${studio.name}` : "Accueil"}
          className="rounded-lg p-0.5 transition hover:bg-white/[0.08]"
        >
          <StudioBrand studio={studio} showName={false} size={40} borderless />
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-y-auto overflow-x-hidden px-1.5 py-1"
        aria-label="Navigation principale"
      >
        {SIDEBAR_NAV_GROUPS.flatMap((group) => group.items).map((item) => {
          const isActive = isSidebarItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all lg:h-8 lg:w-8",
                isActive
                  ? "bg-white/16 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/16"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white/90" : "text-white/55")} aria-hidden />
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Fermer le menu"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-2 top-2 z-50 flex h-[calc(100vh-24px)] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] backdrop-blur-2xl transition-all duration-300",
          "w-[64px] -translate-x-[110%] lg:left-2 lg:translate-x-0",
          mobileOpen && "translate-x-0 w-[72px]"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
