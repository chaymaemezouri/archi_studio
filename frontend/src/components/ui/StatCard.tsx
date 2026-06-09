import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Card from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  className?: string;
}

export default function StatCard({ label, value, icon: Icon, change, className }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
          {change !== undefined && (
            <div className={cn("mt-2 flex items-center gap-1 text-sm", isPositive ? "text-emerald-400" : "text-red-400")}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-accent-muted p-3">
          <Icon className="h-6 w-6 text-accent" />
        </div>
      </div>
    </Card>
  );
}
