"use client";

import { createPortal } from "react-dom";
import { FolderKanban, MoreHorizontal, User } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { FinanceMenuLink } from "@/components/finances/FinanceRowActions";
import { activityIconActionGroup } from "./activity-list-ui";
import type { ActivityLink } from "@/lib/activity-list";
import { portalMenuStyle, usePortalRowMenu } from "@/hooks/usePortalRowMenu";
import { glassBtnIcon, glassMenu } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 200;

interface ActivityRowActionsProps {
  id: string;
  projectHref?: string;
  clientHref?: string;
  menuLinks: ActivityLink[];
}

export default function ActivityRowActions({
  id,
  projectHref,
  clientHref,
  menuLinks,
}: ActivityRowActionsProps) {
  const { ref, menuRef, menuOpen, menuPos, closeMenu, toggleMenu } = usePortalRowMenu(
    MENU_WIDTH,
    160
  );

  const extraLinks = menuLinks.filter(
    (l) =>
      l.href !== projectHref &&
      l.href !== clientHref
  );

  const menuPanel =
    menuOpen && menuPos && extraLinks.length > 0 ? (
      <div
        ref={menuRef}
        role="menu"
        className={cn(glassMenu, "fixed z-[200] min-w-[200px] py-1")}
        style={portalMenuStyle(menuPos)}
      >
        {extraLinks.map((link) => (
          <FinanceMenuLink key={link.href + link.label} href={link.href} onClick={closeMenu}>
            {link.label}
          </FinanceMenuLink>
        ))}
      </div>
    ) : null;

  if (!projectHref && !clientHref && extraLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      {(projectHref || clientHref) && (
        <div className={activityIconActionGroup}>
          {projectHref && (
            <IconActionButton
              label="Ouvrir le projet"
              icon={FolderKanban}
              tone="view"
              href={projectHref}
            />
          )}
          {clientHref && (
            <IconActionButton
              label="Ouvrir le client"
              icon={User}
              tone="notes"
              href={clientHref}
            />
          )}
        </div>
      )}
      {extraLinks.length > 0 && (
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={toggleMenu}
            className={cn(
              glassBtnIcon,
              "h-8 w-8 border-0",
              menuOpen && "bg-studio-soft text-studio-light"
            )}
            aria-label="Plus d'actions"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {typeof document !== "undefined" &&
            menuPanel &&
            createPortal(menuPanel, document.body)}
        </div>
      )}
    </div>
  );
}
