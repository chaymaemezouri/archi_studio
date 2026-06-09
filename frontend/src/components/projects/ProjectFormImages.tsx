"use client";

import { useCallback, useId, useRef } from "react";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { resolveMediaUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

export const MAX_PROJECT_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type PendingProjectImage = {
  id: string;
  file: File;
  preview: string;
};

interface ProjectFormImagesProps {
  images: PendingProjectImage[];
  coverIndex: number;
  existingCoverUrl?: string | null;
  onImagesChange: (images: PendingProjectImage[]) => void;
  onCoverIndexChange: (index: number) => void;
  onClearExistingCover?: () => void;
  keepExistingCover?: boolean;
  disabled?: boolean;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-glass-secondary">{children}</label>
  );
}

export default function ProjectFormImages({
  images,
  coverIndex,
  existingCoverUrl,
  onImagesChange,
  onCoverIndexChange,
  onClearExistingCover,
  keepExistingCover = true,
  disabled,
}: ProjectFormImagesProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const existingPreview = keepExistingCover ? resolveMediaUrl(existingCoverUrl) : undefined;

  const addFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length || disabled) return;

      const next = [...images];
      let cover = coverIndex;

      for (const file of Array.from(fileList)) {
        if (next.length >= MAX_PROJECT_IMAGES) break;
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        if (file.size > MAX_IMAGE_BYTES) continue;

        next.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (next.length > images.length && images.length === 0 && !existingPreview) {
        cover = 0;
      }

      onImagesChange(next);
      onCoverIndexChange(Math.min(cover, next.length - 1));
    },
    [images, coverIndex, disabled, existingPreview, onCoverIndexChange, onImagesChange]
  );

  const removeImage = (id: string) => {
    const idx = images.findIndex((i) => i.id === id);
    if (idx < 0) return;

    const removed = images[idx];
    URL.revokeObjectURL(removed.preview);

    const next = images.filter((i) => i.id !== id);
    let newCover = coverIndex;
    if (idx < coverIndex) newCover = Math.max(0, coverIndex - 1);
    else if (idx === coverIndex) newCover = 0;

    onImagesChange(next);
    onCoverIndexChange(next.length ? Math.min(newCover, next.length - 1) : 0);
  };

  const setCover = (index: number) => {
    onCoverIndexChange(index);
    onClearExistingCover?.();
  };

  const canAdd = images.length < MAX_PROJECT_IMAGES && !disabled;

  return (
    <div>
      <FieldLabel>Images du projet</FieldLabel>
      <p className="mb-3 text-xs text-glass-muted">
        JPG, PNG ou WebP — max {MAX_PROJECT_IMAGES} images, 10 Mo chacune. La image principale
        s&apos;affiche sur la carte et la fiche projet.
      </p>

      {existingPreview && (
        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-glass-muted">Image actuelle</p>
          <div className="relative inline-block">
            <img
              src={existingPreview}
              alt=""
              className="h-24 w-32 rounded-lg border border-white/[0.10] object-cover"
            />
            <span className="absolute left-2 top-2 rounded-full border border-studio-border/40 bg-studio-muted px-2 py-0.5 text-[10px] font-semibold text-studio-light">
              Principale
            </span>
            {onClearExistingCover && (
              <button
                type="button"
                disabled={disabled}
                onClick={onClearExistingCover}
                className="absolute -right-2 -top-2 rounded-full border border-glass bg-[#101014]/90 p-1 backdrop-blur-sm transition hover:bg-red-500/15"
                aria-label="Retirer l'image actuelle"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-300" />
              </button>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="sr-only"
        disabled={!canAdd}
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={!canAdd}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-[color:var(--glass-bg)] px-4 py-8 transition",
          canAdd
            ? "hover:border-studio-border/50 hover:bg-studio-soft"
            : "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-glass bg-[color:var(--glass-bg-hover)]">
          <Upload className="h-5 w-5 text-studio-light/70" />
        </div>
        <span className="text-sm font-medium text-glass-secondary">
          Glisser-déposer ou cliquer pour ajouter
        </span>
        <span className="text-xs text-glass-muted">
          {images.length}/{MAX_PROJECT_IMAGES} image{images.length !== 1 ? "s" : ""}
        </span>
      </button>

      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, index) => {
            const isPendingCover =
              (!existingPreview || !keepExistingCover) && index === coverIndex;

            return (
              <li
                key={img.id}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-lg border bg-[color:var(--glass-bg)]",
                  isPendingCover
                    ? "border-studio-border ring-1 ring-studio-border/40"
                    : "border-glass"
                )}
              >
                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                {isPendingCover && (
                  <span className="absolute left-1 top-1 rounded border border-studio-border/40 bg-studio-muted px-1.5 py-0.5 text-[9px] font-semibold text-studio-light">
                    Principale
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setCover(index)}
                    className="rounded border border-white/15 bg-black/40 p-1 text-glass backdrop-blur-sm hover:bg-black/55"
                    title="Définir comme image principale"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        index === coverIndex && "fill-amber-400 text-amber-400"
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeImage(img.id)}
                    className="rounded border border-white/15 bg-black/40 p-1 text-red-300 backdrop-blur-sm hover:bg-red-500/20"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
          {canAdd && (
            <li>
              <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/[0.12] bg-[color:var(--glass-bg)] text-glass-muted transition hover:border-studio-border/40 hover:text-studio-light"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-medium">Ajouter</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function revokePendingImages(images: PendingProjectImage[]) {
  for (const img of images) {
    URL.revokeObjectURL(img.preview);
  }
}
