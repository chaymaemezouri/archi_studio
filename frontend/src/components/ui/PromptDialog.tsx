"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { accentBar, glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
import { modalOverlay } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export interface PromptDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function PromptDialog({
  open,
  title = "Saisie",
  message,
  label,
  defaultValue = "",
  placeholder,
  confirmLabel = "Valider",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  if (!open) return null;

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-dialog-title"
    >
      <div className={cn("absolute inset-0", modalOverlay)} onClick={onCancel} />

      <form
        className={cn(
          "relative w-full max-w-md rounded-t-xl border border-glass bg-[color:var(--glass-bg)]",
          "shadow-[var(--glass-shadow-lg)] backdrop-blur-xl sm:rounded-xl"
        )}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="border-b border-app px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color:var(--glass-bg-hover)] text-studio-light">
              <Pencil className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <span className={accentBar} aria-hidden />
              <h2 id="prompt-dialog-title" className="truncate text-base font-semibold text-app-primary">
                {title}
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          {message && <p className="text-sm text-glass-secondary">{message}</p>}
          <div>
            {label && (
              <label className="mb-1.5 block text-[11px] font-medium text-glass-secondary">{label}</label>
            )}
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className={cn(
                "w-full rounded-lg border border-[color:var(--glass-input-border)] bg-[color:var(--glass-input-bg)]",
                "px-3 py-2.5 text-sm text-glass placeholder:text-[color:var(--glass-placeholder)]",
                "focus:border-studio-border focus:outline-none focus:ring-2 focus:ring-studio-border/30"
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-app px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5">
          <button type="button" onClick={onCancel} className={cn(glassBtnSecondary, "w-full sm:w-auto")}>
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={!value.trim()}
            className={cn(glassBtnPrimary, "w-full sm:w-auto")}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
