"use client";

import { AlertTriangle } from "lucide-react";
import { accentBar } from "@/lib/glass-styles";
import { modalOverlay } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = "Confirmation",
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={cn("absolute inset-0", modalOverlay)} onClick={loading ? undefined : onCancel} />

      <div
        className={cn(
          "relative w-full max-w-md rounded-t-xl border border-glass bg-[color:var(--glass-bg)]",
          "shadow-[var(--glass-shadow-lg)] backdrop-blur-xl sm:rounded-xl"
        )}
      >
        <div className="border-b border-app px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isDanger
                  ? "bg-red-500/10 text-red-400"
                  : "bg-[color:var(--glass-bg-hover)] text-studio-light"
              )}
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={accentBar} aria-hidden />
                <h2 id="confirm-dialog-title" className="truncate text-base font-semibold text-app-primary">
                  {title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <p className="px-4 py-4 text-sm leading-relaxed text-glass-secondary sm:px-5">{message}</p>

        <div className="flex flex-col-reverse gap-2 border-t border-app px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={cn(glassBtnSecondary, "w-full sm:w-auto")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 sm:w-auto",
              isDanger
                ? "border border-red-400/30 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : glassBtnPrimary
            )}
          >
            {loading ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
