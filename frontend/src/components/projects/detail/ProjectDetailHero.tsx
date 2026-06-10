"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Expand,
  Layers,
  Star,
  X,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import ProjectDetailMenu from "./ProjectDetailMenu";
import ProjectDetailPilotageStrip from "./ProjectDetailPilotageStrip";
import ProjectDetailProjectSummary, {
  ProjectDetailGalleryInfo,
} from "./ProjectDetailProjectSummary";
import ProjectDetailQuickAddMenu from "./ProjectDetailQuickAddMenu";
import {
  detailBackLink,
  detailHeroActions,
  detailHeroBody,
  detailHeroDescription,
  detailHeroGalleryCol,
  detailHeroGalleryCount,
  detailHeroGalleryFooter,
  detailHeroGalleryHead,
  detailHeroGalleryLink,
  detailHeroGalleryStack,
  detailHeroGalleryThumbRow,
  detailHeroHeader,
  detailHeroIntroTop,
  detailHeroMainCol,
  detailHeroMainImage,
  detailHeroMainImageImg,
  detailHeroShell,
  detailHeroThumbActive,
  detailHeroThumbBtn,
  detailHeroThumbStack,
  detailHeroThumbStackScroll,
  detailHeroTitle,
  detailIconBtn,
} from "./project-detail-ui";
import { getProjectVisualPreviewItems } from "@/lib/project-detail";
import { resolveMediaUrl } from "@/lib/assets";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import type { ProjectTabId } from "./ProjectDetailTabs";
import type { ProjectQuickAddMode, ProjectUploadKind } from "./project-detail-types";
import { useProjectDetailMutations } from "@/hooks/useProjectDetail";

interface ProjectDetailHeroProps {
  project: Project;
  onEdit: () => void;
  onQuickAdd: (mode: ProjectQuickAddMode) => void;
  onUpload: (kind: ProjectUploadKind) => void;
  onTabChange: (tab: ProjectTabId) => void;
}

export default function ProjectDetailHero({
  project,
  onEdit,
  onQuickAdd,
  onUpload,
  onTabChange,
}: ProjectDetailHeroProps) {
  const { updateProjectMeta } = useProjectDetailMutations(project.id);
  const items = useMemo(() => getProjectVisualPreviewItems(project, 12), [project]);
  const gallerySlides = useMemo(
    () =>
      items
        .map((item) => ({
          id: item.id,
          url: resolveMediaUrl(item.url),
        }))
        .filter((s): s is { id: string; url: string } => Boolean(s.url)),
    [items]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const safeIndex =
    gallerySlides.length > 0 ? Math.min(activeIndex, gallerySlides.length - 1) : 0;
  const mainSrc = gallerySlides[safeIndex]?.url;

  const description =
    project.description?.trim() ||
    (project.projectNature
      ? `${project.projectNature}${project.type ? ` · ${project.type}` : ""}`
      : null);

  const selectThumb = useCallback((index: number) => {
    if (gallerySlides.length === 0) return;
    setActiveIndex(Math.max(0, Math.min(index, gallerySlides.length - 1)));
  }, [gallerySlides.length]);

  const openLightbox = useCallback((index: number) => {
    if (gallerySlides.length === 0) return;
    const i = Math.max(0, Math.min(index, gallerySlides.length - 1));
    setActiveIndex(i);
    setLightboxIndex(i);
  }, [gallerySlides.length]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToSlide = useCallback(
    (delta: number) => {
      if (lightboxIndex === null || gallerySlides.length === 0) return;
      const next =
        (lightboxIndex + delta + gallerySlides.length) % gallerySlides.length;
      setLightboxIndex(next);
      setActiveIndex(next);
    },
    [lightboxIndex, gallerySlides.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goToSlide(1);
      if (e.key === "ArrowLeft") goToSlide(-1);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, goToSlide]);

  const lightboxSrc =
    lightboxIndex !== null ? gallerySlides[lightboxIndex]?.url : undefined;

  const imageCountLabel =
    gallerySlides.length === 1
      ? "1 image"
      : `${gallerySlides.length} images`;

  return (
    <>
      <header className={detailHeroHeader}>
        <div className={detailHeroIntroTop}>
          <Link href="/projects" className={cn(detailBackLink, "inline-flex text-[11px]")}>
            <ChevronLeft className="h-3 w-3" />
            Projets
          </Link>

          <div className={detailHeroActions}>
            <ProjectDetailQuickAddMenu
              onQuickAdd={onQuickAdd}
              onUpload={onUpload}
              iconOnly={false}
            />
            <ProjectDetailMenu project={project} onEdit={onEdit} />
            <Tooltip
              label={
                project.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
              }
            >
              <button
                type="button"
                onClick={() =>
                  updateProjectMeta.mutate({ isFavorite: !project.isFavorite })
                }
                className={detailIconBtn}
                aria-label="Favori"
              >
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    project.isFavorite
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/50"
                  )}
                />
              </button>
            </Tooltip>
          </div>
        </div>

        <ProjectDetailPilotageStrip project={project} onTabChange={onTabChange} />
      </header>

      <section className={detailHeroShell}>
        <div className={detailHeroBody}>
          <div className={detailHeroGalleryCol}>
            <div className={detailHeroGalleryHead}>
              <h1 className={detailHeroTitle}>{project.name}</h1>
              {description && (
                <p className={detailHeroDescription}>{description}</p>
              )}
            </div>

            <div className={detailHeroGalleryStack}>
              {mainSrc ? (
                <button
                  type="button"
                  onClick={() => openLightbox(safeIndex)}
                  className={detailHeroMainImage}
                  aria-label="Agrandir l'image"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={mainSrc}
                    src={mainSrc}
                    alt=""
                    className={detailHeroMainImageImg}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover/preview:opacity-100">
                    <Expand className="h-4 w-4 text-white/90" />
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onUpload("image")}
                  className={cn(
                    detailHeroMainImage,
                    "flex flex-col items-center justify-center gap-1 bg-white/[0.02]"
                  )}
                >
                  <Building2 className="h-7 w-7 text-white/22" />
                  <span className="text-[10px] text-white/32">Photo</span>
                </button>
              )}

              {gallerySlides.length > 1 && (
                <div className={detailHeroGalleryThumbRow}>
                  <div className={cn(detailHeroThumbStack, detailHeroThumbStackScroll)}>
                    {gallerySlides.map((slide, i) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => selectThumb(i)}
                        className={cn(
                          detailHeroThumbBtn,
                          i === safeIndex && detailHeroThumbActive
                        )}
                        aria-label={`Aperçu ${i + 1}`}
                        aria-current={i === safeIndex ? "true" : undefined}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={detailHeroGalleryCount}>{imageCountLabel}</span>
                    <button
                      type="button"
                      onClick={() => onTabChange("renders")}
                      className={detailHeroGalleryLink}
                      aria-label="Voir la galerie"
                    >
                      <Layers className="h-3 w-3" />
                      Galerie
                    </button>
                  </div>
                </div>
              )}
            </div>

            {gallerySlides.length > 0 && gallerySlides.length <= 1 && (
              <div className={detailHeroGalleryFooter}>
                <span className={detailHeroGalleryCount}>{imageCountLabel}</span>
                <button
                  type="button"
                  onClick={() => onTabChange("renders")}
                  className={detailHeroGalleryLink}
                  aria-label="Voir la galerie"
                >
                  <Layers className="h-3 w-3" />
                  Galerie
                </button>
              </div>
            )}

            <ProjectDetailGalleryInfo project={project} />
          </div>

          <div className={detailHeroMainCol}>
            <ProjectDetailProjectSummary project={project} />
          </div>
        </div>
      </section>

      {lightboxSrc && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-label="Galerie du projet"
          onClick={closeLightbox}
          onWheel={(e) => {
            e.preventDefault();
            goToSlide(e.deltaY > 0 ? 1 : -1);
          }}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-lg p-2 text-white/60 hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {gallerySlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(-1);
                }}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white/80 transition hover:bg-black/70 sm:left-5"
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(1);
                }}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2.5 text-white/80 transition hover:bg-black/70 sm:right-5"
                aria-label="Image suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] tabular-nums text-white/70">
                {lightboxIndex + 1} / {gallerySlides.length}
              </span>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90vh] max-w-[min(100%,1200px)] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
