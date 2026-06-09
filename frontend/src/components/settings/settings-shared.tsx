"use client";

import { cn } from "@/lib/utils";
import { glassBtnPrimary, glassSelect } from "@/lib/glass-styles";
import type { StudioSettings } from "@/lib/settings-api";
import { settingsField, settingsLabel } from "./settings-ui";

export function SettingsField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(settingsField, className)}>
      <label className={settingsLabel}>{label}</label>
      {children}
    </div>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-glass bg-[color:var(--glass-bg)] p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-glass-muted">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function SettingsSaveBar({
  saving,
  label = "Enregistrer",
}: {
  saving?: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end border-t border-app pt-4">
      <button
        type="submit"
        disabled={saving}
        className={cn(glassBtnPrimary, "w-full sm:w-auto")}
      >
        {saving ? "Enregistrement…" : label}
      </button>
    </div>
  );
}

export function SettingsSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(glassSelect, "h-9 w-full py-0 text-[12px]", className)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-dark-elevated text-text-primary">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsDocPreview({ settings }: { settings: StudioSettings }) {
  const year = new Date().getFullYear();
  return (
    <div className="rounded-lg border border-glass bg-[color:var(--glass-bg)] p-3 text-[11px] leading-relaxed text-glass-muted">
      <p className="text-[13px] font-medium text-glass">
        {settings.cabinetName || "Cabinet"}
      </p>
      {settings.cabinetAddress && <p>{settings.cabinetAddress}</p>}
      {(settings.cabinetCity || settings.cabinetPhone) && (
        <p>{[settings.cabinetCity, settings.cabinetPhone].filter(Boolean).join(" · ")}</p>
      )}
      {settings.cabinetEmail && <p>{settings.cabinetEmail}</p>}
      {settings.cabinetIce && <p>ICE {settings.cabinetIce}</p>}
      <p className="mt-2 border-t border-app pt-2 text-glass-muted">
        {settings.devisPrefix ?? "DEV"}-{year}-001 · {settings.invoicePrefix ?? "FAC"}-
        {year}-001 · TVA {settings.tvaDefault ?? 20}% · {settings.paymentTermsDays ?? 30}j
      </p>
      {settings.bankName && (
        <p className="mt-1">
          {settings.bankName}
          {settings.bankRib ? ` · ${settings.bankRib}` : ""}
        </p>
      )}
    </div>
  );
}
