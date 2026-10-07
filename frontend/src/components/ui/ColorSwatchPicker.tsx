"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

/** Palette rapide pour tâches / événements calendrier */
export const TASK_COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
] as const;

interface ColorSwatchPickerProps {
  value?: string | null;
  onChange: (color: string | null) => void;
  className?: string;
  /** @deprecated libellé plus affiché — conservé pour compat */
  label?: string;
  /** Bouton plus petit (lignes de liste) */
  compact?: boolean;
}

type PanelPos = { top: number; left: number };

export default function ColorSwatchPicker({
  value,
  onChange,
  className,
  compact,
}: ColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PanelPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const panelW = 120;
    const panelH = 112;
    const gap = 6;
    let left = r.right - panelW;
    let top = r.bottom + gap;
    if (left < 8) left = 8;
    if (left + panelW > window.innerWidth - 8) {
      left = window.innerWidth - panelW - 8;
    }
    // Si pas assez de place en bas → ouvrir vers le haut
    if (top + panelH > window.innerHeight - 8) {
      top = r.top - panelH - gap;
    }
    if (top < 8) top = 8;
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (color: string | null) => {
    onChange(color);
    setOpen(false);
  };

  const panel =
    open && mounted && pos
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Couleurs"
            className={cn(
              "fixed z-[300] w-[7.5rem] rounded-xl border border-glass",
              "bg-[color:var(--glass-bg)] p-2 shadow-[var(--glass-shadow)] backdrop-blur-xl"
            )}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="grid grid-cols-3 place-items-center gap-1.5">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => pick(null)}
                title="Sans couleur"
                aria-label="Sans couleur"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition",
                  !value
                    ? "border-studio-light/50 bg-studio-muted text-studio-light ring-2 ring-studio-light/30"
                    : "border-glass text-glass-muted hover:border-studio-border/50"
                )}
              >
                —
              </button>
              {TASK_COLOR_PRESETS.map((hex) => {
                const selected = value?.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => pick(hex)}
                    title={hex}
                    aria-label={`Couleur ${hex}`}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition",
                      selected
                        ? "scale-105 border-white shadow ring-2 ring-studio-light/40"
                        : "border-transparent hover:scale-105 hover:border-white/40"
                    )}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={value ? `Couleur ${value}` : "Choisir une couleur"}
        aria-label="Couleur de la tâche"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex items-center justify-center rounded-lg border transition",
          compact ? "h-8 w-8" : "h-9 w-9",
          open
            ? "border-studio-border/50 bg-studio-muted text-studio-light"
            : "border-glass bg-[color:var(--glass-bg)] text-glass-muted hover:border-studio-border/40 hover:text-studio-light"
        )}
      >
        {value ? (
          <span
            className={cn(
              "rounded-full ring-2 ring-white/80 dark:ring-black/30",
              compact ? "h-3.5 w-3.5" : "h-4 w-4"
            )}
            style={{ backgroundColor: value }}
          />
        ) : (
          <Palette className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.75} />
        )}
      </button>
      {panel}
    </div>
  );
}
