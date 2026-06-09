import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "accent"
  | "studio"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

/** Style liste simple — fond léger, texte coloré, sans bordure */
const badgeBase =
  "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-medium";

export const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: cn(badgeBase, "bg-white/10 text-[#9aa3b0]/80"),
  studio: cn(badgeBase, "bg-[#8ba4c7]/12 text-[#a8bdd4]/90"),
  accent: cn(badgeBase, "bg-accent-muted text-accent/90"),
  success: cn(badgeBase, "bg-emerald-500/15 text-emerald-400/85"),
  warning: cn(badgeBase, "bg-amber-500/15 text-amber-400/80"),
  danger: cn(badgeBase, "bg-red-500/15 text-red-400/80"),
};

export default function Badge({
  children,
  className,
  variant = "default",
}: BadgeProps) {
  return (
    <span className={cn(badgeVariantStyles[variant], className)}>{children}</span>
  );
}
