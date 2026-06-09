"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function UserAvatar({ name, avatar, size = "md", className }: UserAvatarProps) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        className={cn("rounded-full object-cover ring-2 ring-white", sizes[size], className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-stone-200 font-semibold text-stone-600 ring-2 ring-white",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </span>
  );
}
