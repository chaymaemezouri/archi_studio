"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StudioBrand from "@/components/layout/StudioBrand";
import { settingsUploadZone } from "./settings-ui";
import { cn } from "@/lib/utils";

interface SettingsImageUploadProps {
  kind: "avatar" | "logo";
  previewName: string;
  previewSrc?: string | null;
  studioName?: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export default function SettingsImageUpload({
  kind,
  previewName,
  previewSrc,
  studioName,
  uploading = false,
  onUpload,
}: SettingsImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = () => inputRef.current?.click();

  const handleFile = (file: File | undefined) => {
    if (!file || uploading) return;
    onUpload(file);
  };

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="flex shrink-0 justify-center sm:justify-start">
        {kind === "avatar" ? (
          <Avatar name={previewName} src={previewSrc} size="lg" />
        ) : (
          <StudioBrand
            studio={
              studioName
                ? { id: "", slug: "", name: studioName, logoUrl: previewSrc ?? null }
                : null
            }
            showName={false}
            size={64}
          />
        )}
      </div>

      <button
        type="button"
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        disabled={uploading}
        className={cn(
          settingsUploadZone,
          "min-h-[88px] flex-1 cursor-pointer",
          dragOver && "border-studio-border/40 bg-[color:var(--glass-bg-hover)]",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-glass-muted" />
        ) : (
          <ImagePlus className="h-5 w-5 text-glass-muted" strokeWidth={1.5} />
        )}
        <span className="text-[12px] text-glass-muted">
          {uploading ? "Envoi…" : "Choisir une image"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
