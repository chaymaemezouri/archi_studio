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
  default: cn(
    badgeBase,
    "bg-[color:var(--badge-default-bg)] text-[color:var(--badge-default-text)]"
  ),
  studio: cn(
    badgeBase,
    "bg-[color:var(--badge-studio-bg)] text-[color:var(--badge-studio-text)] ring-1 ring-inset ring-[color:var(--studio-border)]"
  ),
  accent: cn(
    badgeBase,
    "bg-[color:var(--badge-accent-bg)] text-[color:var(--badge-accent-text)] ring-1 ring-inset ring-[color:var(--badge-accent-ring)]"
  ),
  success: cn(
    badgeBase,
    "bg-[color:var(--badge-success-bg)] text-[color:var(--badge-success-text)] ring-1 ring-inset ring-[color:var(--badge-success-ring)]"
  ),
  warning: cn(
    badgeBase,
    "bg-[color:var(--badge-warning-bg)] text-[color:var(--badge-warning-text)] ring-1 ring-inset ring-[color:var(--badge-warning-ring)]"
  ),
  danger: cn(
    badgeBase,
    "bg-[color:var(--badge-danger-bg)] text-[color:var(--badge-danger-text)] ring-1 ring-inset ring-[color:var(--badge-danger-ring)]"
  ),
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
