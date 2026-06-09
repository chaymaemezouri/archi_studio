import { cn } from "@/lib/utils";
import { glassInput, glassSelect } from "@/lib/glass-styles";
import { formSection, formSectionTitle, textLabel } from "@/lib/theme-classes";

export const financeFieldClass = cn(glassInput, "px-3 py-2.5");
export const financeSelectClass = cn(glassSelect, "w-full px-3 py-2.5");

export const financeChipBtn = cn(
  "rounded-lg border border-glass bg-[color:var(--glass-bg)] px-2 py-1",
  "text-[11px] text-glass-muted transition hover:bg-[color:var(--glass-bg-hover)] hover:text-studio-light"
);

export function FinanceFieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className={cn(textLabel, "mb-1.5 block")}>
      {children}
      {required && <span className="text-glass-muted/70"> *</span>}
    </label>
  );
}

export function FinanceFormSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={formSection}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={formSectionTitle}>{title}</p>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
