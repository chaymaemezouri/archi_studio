"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { accentBar, glassPanel } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import Button from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "glass";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  variant = "default",
}: ModalProps) {

  useEffect(() => {

    const handleEscape = (e: KeyboardEvent) => {

      if (e.key === "Escape") onClose();

    };

    if (isOpen) {

      document.addEventListener("keydown", handleEscape);

      document.body.style.overflow = "hidden";

    }

    return () => {

      document.removeEventListener("keydown", handleEscape);

      document.body.style.overflow = "";

    };

  }, [isOpen, onClose]);



  if (!isOpen) return null;



  const sizes = {

    sm: "max-w-md",

    md: "max-w-lg",

    lg: "max-w-2xl",

    xl: "max-w-4xl",

  };



  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col sm:max-h-[90dvh]",
          variant === "glass"
            ? cn(
                glassPanel,
                "rounded-t-xl border-white/[0.08] sm:rounded-xl",
                "max-md:max-h-[100dvh] max-md:rounded-none max-md:border-x-0 max-md:border-t-0"
              )
            : "rounded-t-card border border-dark-border bg-dark-elevated shadow-2xl sm:rounded-card",
          sizes[size]
        )}
      >
        {title && (
          <div
            className={cn(
              "flex shrink-0 items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4",
              variant === "glass" ? "border-b border-white/[0.06]" : "border-b border-dark-border px-4 py-3 sm:px-6 sm:py-4"
            )}
          >
            {variant === "glass" ? (
              <div className="flex min-w-0 items-center gap-2">
                <span className={accentBar} aria-hidden />
                <h2 className="truncate text-base font-semibold text-white/90">{title}</h2>
              </div>
            ) : (
              <h2 className="text-base font-semibold text-text-primary sm:text-lg">{title}</h2>
            )}
            {variant === "glass" ? (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/45 transition hover:bg-white/[0.06] hover:text-white/80"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onClose} className="!h-10 !w-10 !p-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">

          {children}

        </div>

      </div>

    </div>

  );

}


