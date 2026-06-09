import { cn } from "@/lib/utils";
import { dashboardCard, dashboardCardBase } from "./dashboard-ui";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  interactive?: boolean;
  /** @deprecated Utiliser le style par défaut ; conservé pour compatibilité */
  variant?: "default" | "glass" | "subtle";
}

export default function DashboardCard({
  children,
  className,
  padding = true,
  interactive = true,
  variant: _variant = "default",
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        interactive ? dashboardCard : dashboardCardBase,
        padding && "p-3.5 sm:p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
