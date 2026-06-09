"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";
import GlobalSearch from "@/components/layout/GlobalSearch";
import Link from "next/link";
import { getPageTitle } from "@/lib/sidebar-nav";
import Avatar from "@/components/ui/Avatar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { useStudio } from "@/hooks/useStudio";
import { cn } from "@/lib/utils";
import { dashboardShellContainer, dashboardShellPadding } from "./dashboard-shell";
import {
  headerActions,
  headerBar,
  headerMenuItem,
  headerMenuItemDanger,
  headerProfileBtn,
  headerProfileMenu,
  headerProfileMenuHead,
} from "./header-ui";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const studio = useStudio();
  const pageTitle = title ?? getPageTitle(pathname);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  return (
    <header className={cn("sticky top-0 z-30 pb-2 pt-2.5", dashboardShellPadding)}>
      <div className={dashboardShellContainer}>
        <div className={headerBar}>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/65 transition hover:bg-white/[0.06] hover:text-studio-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-studio-border/40 lg:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            {pageTitle ? (
              <h1 className="min-w-0 max-w-[38vw] shrink truncate text-[12px] font-semibold text-white/88 sm:max-w-none sm:text-[13px] lg:max-w-[200px]">
                {pageTitle}
              </h1>
            ) : null}
            <GlobalSearch />
          </div>

          <div className={headerActions}>
            <NotificationBell />

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-label="Menu profil"
                className={cn(headerProfileBtn, dropdownOpen && "bg-white/[0.05]")}
              >
                <Avatar
                  name={user?.name || studio?.name || "U"}
                  src={user?.avatar || studio?.logoUrl}
                  size="sm"
                />
                <span className="hidden max-w-[140px] truncate text-[12px] font-medium md:block">
                  {user?.name}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 shrink-0 text-white/40 transition-transform",
                    dropdownOpen && "rotate-180 text-studio-light/70"
                  )}
                />
              </button>

              {dropdownOpen && (
                <div className={headerProfileMenu} role="menu">
                  <div className={headerProfileMenuHead}>
                    <p className="truncate text-[13px] font-medium text-white/90">{user?.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-white/40">{user?.email}</p>
                  </div>
                  <div className="border-t border-white/[0.06] py-1">
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className={headerMenuItem}
                      role="menuitem"
                    >
                      <User className="h-3.5 w-3.5 opacity-50" strokeWidth={1.75} />
                      Mon profil
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className={headerMenuItem}
                      role="menuitem"
                    >
                      <Settings className="h-3.5 w-3.5 opacity-50" strokeWidth={1.75} />
                      Paramètres
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className={headerMenuItemDanger}
                      role="menuitem"
                    >
                      <LogOut className="h-3.5 w-3.5 opacity-70" strokeWidth={1.75} />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
