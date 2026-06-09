"use client";

import { useMemo, useState } from "react";
import { Building2, Expand, ImagePlus, Layers, X } from "lucide-react";
import { getProjectVisualPreviewItems } from "@/lib/project-detail";
import { resolveMediaUrl } from "@/lib/assets";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import {
  detailBtnGhost,
  detailLink,
  detailThumb,
  detailVisualShell,
} from "./project-detail-ui";
import type { ProjectTabId } from "./ProjectDetailTabs";
import type { ProjectUploadKind } from "./project-detail-types";

interface ProjectDetailVisualGalleryProps {
  project: Project;
  onTabChange: (tab: ProjectTabId) => void;
  onUpload: (kind: ProjectUploadKind) => void;
}

export default function ProjectDetailVisualGallery({
  project,
  onTabChange,
  onUpload,
}: ProjectDetailVisualGalleryProps) {
  const items = useMemo(() => getProjectVisualPreviewItems(project, 8), [project]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const safeIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : 0;
  const mainItem = items[safeIndex];
  const mainSrc = mainItem ? resolveMediaUrl(mainItem.url) : undefined;
  const showThumbRow = items.length > 1;

  const openLightbox = () => {
    if (!mainItem) return;
    const resolved = resolveMediaUrl(mainItem.url);
    if (resolved) setLightboxUrl(resolved);
  };

  return (
    <>
      <div className={cn(detailVisualShell, "flex w-full flex-col")}>
        <div className="flex items-center justify-between gap-2 border-b border-app px-2.5 py-2">
          <span className="text-[10px] font-medium text-glass-muted">
            {items.length > 0
              ? `${items.length} image${items.length > 1 ? "s" : ""}`
              : "Galerie"}
          </span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => onTabChange("renders")}
              className={detailLink}
            >
              Voir galerie
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-4 py-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-glass bg-[color:var(--glass-bg)]">
              <Building2 className="h-6 w-6 text-white/22" strokeWidth={1.25} />
            </div>
            <p className="text-center text-[11px] text-glass-muted">Aucun visuel pour ce projet</p>
            <button
              type="button"
              onClick={() => onUpload("image")}
              className={cn(detailLink, "inline-flex items-center gap-1")}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Ajouter une photo
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={openLightbox}
              className="group/preview relative block w-full overflow-hidden"
              aria-label="Agrandir l'image"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainSrc}
                alt=""
                className={cn(
                  "w-full object-cover transition duration-300 group-hover/preview:opacity-92",
                  showThumbRow
                    ? "h-[200px] max-h-[280px] sm:h-[220px] lg:h-[260px] xl:max-h-[300px]"
                    : "h-[200px] max-h-[240px] sm:max-h-[280px]"
                )}
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md border border-glass bg-black/50 px-1.5 py-0.5 text-[10px] text-glass-secondary opacity-0 backdrop-blur-sm transition group-hover/preview:opacity-100">
                <Expand className="h-3 w-3" />
                Agrandir
              </span>
            </button>

            {showThumbRow && (
              <div className="grid grid-cols-4 gap-1.5 p-2">
                {items.slice(0, 8).map((item, i) => {
                  const src = resolveMediaUrl(item.url);
                  if (!src) return null;
                  const isActive = i === safeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={cn(
                        detailThumb,
                        "h-[72px] w-full overflow-hidden rounded-lg transition sm:h-[80px]",
                        isActive
                          ? "ring-2 ring-studio-light/50 ring-offset-1 ring-offset-[#07070b]"
                          : "opacity-80 hover:opacity-100"
                      )}
                      aria-label={`Aperçu image ${i + 1}`}
                      aria-current={isActive}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-app px-2.5 py-2">
          <button
            type="button"
            onClick={() => onUpload("render")}
            className={cn(detailBtnGhost, "flex-1 justify-center gap-1 border border-app py-1.5")}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Ajouter un rendu
          </button>
          <button
            type="button"
            onClick={() => onTabChange("renders")}
            className={cn(detailBtnGhost, "gap-1 border border-app px-2.5 py-1.5")}
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Galerie</span>
          </button>
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-4 top-4 rounded-lg p-2 text-glass-secondary transition hover:bg-[color:var(--glass-bg-hover)] hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt=""
            className="max-h-[90vh]  rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
