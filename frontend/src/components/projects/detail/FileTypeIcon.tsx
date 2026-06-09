"use client";

import { File, FileImage, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileIconProps {
  mimeType?: string;
  name?: string;
  className?: string;
}

export function FileIcon({ mimeType, name, className }: FileIconProps) {
  const ext = name?.split(".").pop()?.toLowerCase();
  const Icon =
    mimeType?.includes("pdf") || ext === "pdf"
      ? FileText
      : mimeType?.includes("image") || ["png", "jpg", "jpeg", "webp"].includes(ext ?? "")
        ? FileImage
        : ext === "dwg" || mimeType?.includes("dwg")
          ? FileSpreadsheet
          : File;

  const color =
    ext === "pdf"
      ? "text-red-400/65 bg-red-500/8"
      : ext === "dwg"
        ? "text-[#8ba4c7]/70 bg-[#8ba4c7]/10"
        : ext === "docx" || ext === "doc"
          ? "text-[#8ba4c7]/70 bg-[#8ba4c7]/10"
          : "text-[#8ba4c7]/55 bg-[#8ba4c7]/8";

  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
        color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
