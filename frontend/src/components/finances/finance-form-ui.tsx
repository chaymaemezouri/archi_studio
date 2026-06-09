import { cn } from "@/lib/utils";
import { glassInput, glassSelect } from "@/lib/glass-styles";

export const financeFieldClass = cn(glassInput, "px-3 py-2.5 [color-scheme:dark]");
export const financeSelectClass = cn(glassSelect, "w-full px-3 py-2.5 [color-scheme:dark]");

export const financeChipBtn =
  "rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] text-white/55 transition hover:bg-white/[0.06] hover:text-studio-light";

export function FinanceFieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium text-white/40">
      {children}
      {required && <span className="text-white/28"> *</span>}
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
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/32">{title}</p>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
