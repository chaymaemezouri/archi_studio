import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  Layers,
  ReceiptText,
  CreditCard,
  History,
  Settings,
} from "lucide-react";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Additional paths that should highlight this item */
  matchPaths?: string[];
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

export const SIDEBAR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/projects", label: "Projets", icon: FolderKanban },
      { href: "/clients", label: "Clients", icon: Users },
      {
        href: "/calendar",
        label: "Calendrier",
        icon: Calendar,
        matchPaths: ["/calendar", "/deadlines"],
      },
      { href: "/tasks", label: "Tâches", icon: CheckSquare },
    ],
  },
  {
    label: "Production",
    items: [
      { href: "/documents", label: "Documents", icon: FileText },
      {
        href: "/plans-renders",
        label: "Plans & Rendus",
        icon: Layers,
        matchPaths: ["/plans-renders", "/renders"],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        href: "/finances/quotes-invoices",
        label: "Devis & Factures",
        icon: ReceiptText,
        matchPaths: ["/finances/quotes-invoices", "/devis", "/invoices"],
      },
      {
        href: "/finances/payments",
        label: "Paiements",
        icon: CreditCard,
        matchPaths: ["/finances/payments", "/payments"],
      },
    ],
  },
  {
    label: "Système",
    items: [
      { href: "/activity", label: "Activité", icon: History },
      { href: "/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function isSidebarItemActive(pathname: string, item: SidebarNavItem): boolean {
  const paths = item.matchPaths ?? [item.href];
  return paths.some(
    (path) => pathname === path || (path !== "/dashboard" && pathname.startsWith(`${path}/`))
  );
}

const PAGE_TITLE_OVERRIDES: Record<string, string> = {
  "/finances/quotes-invoices": "Devis & Factures",
  "/finances/payments": "Paiements",
  "/plans-renders": "Plans & Rendus",
};

export function getPageTitle(pathname: string): string | null {
  if (PAGE_TITLE_OVERRIDES[pathname]) return PAGE_TITLE_OVERRIDES[pathname];

  for (const group of SIDEBAR_NAV_GROUPS) {
    for (const item of group.items) {
      if (isSidebarItemActive(pathname, item)) return item.label;
    }
  }

  if (pathname.startsWith("/projects/") && pathname !== "/projects") return "Projet";
  if (pathname.startsWith("/clients/") && pathname !== "/clients") return "Client";

  return null;
}
