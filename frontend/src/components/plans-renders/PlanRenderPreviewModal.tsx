"use client";

import { Download } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { canPreviewPlanRender } from "@/lib/plans-renders-list";
import { resolveMediaUrl } from "@/lib/assets";
import type { PlanRender } from "@/types";
import Link from "next/link";

interface PlanRenderPreviewModalProps {
  asset: PlanRender | null;
  onClose: () => void;
}

export default function PlanRenderPreviewModal({
  asset,
  onClose,
}: PlanRenderPreviewModalProps) {
  if (!asset) return null;

  const href = resolveMediaUrl(asset.url) ?? asset.url;
  const previewable = canPreviewPlanRender(asset);
  const isPdf = asset.mimeType.includes("pdf");
  const isImage = asset.mimeType.startsWith("image/");

  return (
    <Modal isOpen={!!asset} onClose={onClose} title={asset.name} size="xl">
      <div className="space-y-4">
        {previewable ? (
          <div className="max-h-[70vh] overflow-auto rounded-xl border border-dark-border bg-dark-elevated">
            {isImage && href && (
              <img src={href} alt={asset.name} className="mx-auto max-h-[65vh] object-contain" />
            )}
            {isPdf && href && (
              <iframe src={href} title={asset.name} className="h-[65vh] w-full" />
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dark-border bg-dark-elevated px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">
              Aperçu non disponible pour ce type de fichier.
            </p>
            <a
              href={href}
              download
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </a>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href={href}
            download
            className="inline-flex items-center gap-2 rounded-xl border border-dark-border px-4 py-2 text-sm text-text-secondary hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Télécharger
          </a>
          {asset.projectId && (
            <Link
              href={`/projects/${asset.projectId}?tab=${asset.kind === "PLAN" ? "plans" : "renders"}`}
              className="inline-flex items-center rounded-xl border border-dark-border px-4 py-2 text-sm text-accent hover:bg-white/5"
            >
              Ouvrir projet
            </Link>
          )}
        </div>
      </div>
    </Modal>
  );
}
