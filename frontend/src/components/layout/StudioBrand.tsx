"use client";

import { Building2 } from "lucide-react";
import type { Studio } from "@/types";
import { resolveMediaUrl, resolvePublicAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface StudioBrandProps {
  studio?: Studio | null;
  showName?: boolean;
  size?: number;
  /** Sans cadre (sidebar, etc.) */
  borderless?: boolean;
  className?: string;
}

export default function StudioBrand({
  studio,
  showName = true,
  size = 36,
  borderless = false,
  className,
}: StudioBrandProps) {
  const name = studio?.name ?? "Architecture Studio";
  const logoUrl =
    resolveMediaUrl(studio?.logoUrl) ?? resolvePublicAssetUrl(studio?.logoUrl);

  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
          borderless
            ? "border-0 bg-transparent"
            : "border border-dark-border bg-dark-elevated"
        )}
        style={{ width: size, height: size }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`Logo ${name}`}
            width={size}
            height={size}
            className="h-full w-full object-contain"
          />
        ) : (
          <Building2
            className={cn("h-5 w-5", borderless ? "text-glass-muted" : "text-accent")}
          />
        )}
      </div>
      {showName && (
        <span className="min-w-0 truncate text-sm font-semibold text-text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {name}
        </span>
      )}
    </div>
  );
}
