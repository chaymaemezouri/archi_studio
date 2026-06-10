import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { glassInput, glassSelect } from "@/lib/glass-styles";
import { formSection, formSectionTitle, textLabel } from "@/lib/theme-classes";
import { FINANCE_MANUAL_VALUE } from "@/lib/finance-entity-utils";

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

type FinanceEntityOption = { id: string; name: string };

export function FinanceEntityPicker({
  label,
  required,
  placeholder = "Sélectionner…",
  manualLabel = "Autre — saisir le nom",
  manualPlaceholder = "Nom",
  options,
  entityId,
  entityName,
  onEntityIdChange,
  onEntityNameChange,
  allowManualEntry = true,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  manualLabel?: string;
  manualPlaceholder?: string;
  options: FinanceEntityOption[];
  entityId: string;
  entityName: string;
  onEntityIdChange: (id: string) => void;
  onEntityNameChange: (name: string) => void;
  allowManualEntry?: boolean;
}) {
  const [manualMode, setManualMode] = useState(() => allowManualEntry && !entityId && !!entityName);
  const selectValue = entityId || (manualMode ? FINANCE_MANUAL_VALUE : "");

  useEffect(() => {
    if (entityId) setManualMode(false);
  }, [entityId]);

  return (
    <div>
      <FinanceFieldLabel required={required}>{label}</FinanceFieldLabel>
      <select
        className={cn(financeSelectClass, !selectValue && "text-glass-muted")}
        value={selectValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value === FINANCE_MANUAL_VALUE) {
            setManualMode(true);
            onEntityIdChange("");
            return;
          }
          if (value === "") {
            setManualMode(false);
            onEntityIdChange("");
            onEntityNameChange("");
            return;
          }
          setManualMode(false);
          onEntityIdChange(value);
          onEntityNameChange("");
        }}
      >
        <option value="">{placeholder}</option>
        {allowManualEntry && <option value={FINANCE_MANUAL_VALUE}>{manualLabel}</option>}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {allowManualEntry && manualMode && (
        <input
          className={cn(financeFieldClass, "mt-2")}
          placeholder={manualPlaceholder}
          value={entityName}
          onChange={(e) => {
            onEntityIdChange("");
            onEntityNameChange(e.target.value);
          }}
        />
      )}
    </div>
  );
}
