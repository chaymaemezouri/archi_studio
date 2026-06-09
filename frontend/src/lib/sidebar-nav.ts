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
  /** Couleur icône en light mode — dark inchangé via classes dark: */
  iconLight?: string;
  iconLightActive?: string;
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
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        iconLight: "text-blue-600",
        iconLightActive: "text-blue-700",
      },
      {
        href: "/projects",
        label: "Projets",
        icon: FolderKanban,
        iconLight: "text-violet-600",
        iconLightActive: "text-violet-700",
      },
      {
        href: "/clients",
        label: "Clients",
        icon: Users,
        iconLight: "text-emerald-600",
        iconLightActive: "text-emerald-700",
      },
      {
        href: "/calendar",
        label: "Calendrier",
        icon: Calendar,
        matchPaths: ["/calendar", "/deadlines"],
        iconLight: "text-rose-600",
        iconLightActive: "text-rose-700",
      },
      {
        href: "/tasks",
        label: "Tâches",
        icon: CheckSquare,
        iconLight: "text-amber-600",
        iconLightActive: "text-amber-700",
      },
    ],
  },
  {
    label: "Production",
    items: [
      {
        href: "/documents",
        label: "Documents",
        icon: FileText,
        iconLight: "text-sky-600",
        iconLightActive: "text-sky-700",
      },
      {
        href: "/plans-renders",
        label: "Plans & Rendus",
        icon: Layers,
        matchPaths: ["/plans-renders", "/renders"],
        iconLight: "text-indigo-600",
        iconLightActive: "text-indigo-700",
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
        iconLight: "text-teal-600",
        iconLightActive: "text-teal-700",
      },
      {
        href: "/finances/payments",
        label: "Paiements",
        icon: CreditCard,
        matchPaths: ["/finances/payments", "/payments"],
        iconLight: "text-green-600",
        iconLightActive: "text-green-700",
      },
    ],
  },
  {
    label: "Système",
    items: [
      {
        href: "/activity",
        label: "Activité",
        icon: History,
        iconLight: "text-orange-600",
        iconLightActive: "text-orange-700",
      },
      {
        href: "/settings",
        label: "Paramètres",
        icon: Settings,
        iconLight: "text-slate-600",
        iconLightActive: "text-slate-800",
      },
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
