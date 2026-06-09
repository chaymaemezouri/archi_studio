"use client";

import { useState } from "react";
import { resolveMediaUrl, resolvePublicAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const imageSrc = resolveMediaUrl(src) ?? resolvePublicAssetUrl(src);

  if (imageSrc && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageSrc}
        alt={name}
        onError={() => setFailed(true)}
        className={cn(
          "rounded-full border border-dark-border bg-dark-elevated object-contain p-0.5",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-accent-muted font-medium text-accent",
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
