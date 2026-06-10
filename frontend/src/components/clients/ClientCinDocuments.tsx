"use client";

import { ExternalLink } from "lucide-react";
import { resolveMediaUrl } from "@/lib/assets";
import type { Client } from "@/types";
import { cn } from "@/lib/utils";

type ClientCinFields = Pick<
  Client,
  "cinDocumentUrl" | "cinDocumentName" | "cinDocumentBackUrl" | "cinDocumentBackName"
>;

interface ClientCinDocumentsProps {
  client: ClientCinFields;
  className?: string;
  imageClassName?: string;
}

function CinImageCard({
  label,
  url,
  name,
  imageClassName,
}: {
  label: string;
  url?: string | null;
  name?: string | null;
  imageClassName?: string;
}) {
  const src = url ? resolveMediaUrl(url) : undefined;
  if (!src) return null;

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium text-glass-muted">{label}</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-glass-muted transition hover:text-[#b8cfe8]/95"
        >
          Ouvrir
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-lg border border-app/80 bg-[color:var(--glass-bg)] transition hover:border-[color:var(--pd-accent)]/35"
        title={name ?? label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name ?? label}
          className={cn(
            "mx-auto max-h-40 w-full object-contain p-2 transition group-hover:opacity-95",
            imageClassName
          )}
        />
      </a>
      {name ? (
        <p className="mt-1 truncate text-[10px] text-glass-muted" title={name}>
          {name}
        </p>
      ) : null}
    </div>
  );
}

export function hasClientCinDocuments(client: ClientCinFields): boolean {
  return Boolean(client.cinDocumentUrl?.trim() || client.cinDocumentBackUrl?.trim());
}

export default function ClientCinDocuments({
  client,
  className,
  imageClassName,
}: ClientCinDocumentsProps) {
  if (!hasClientCinDocuments(client)) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <CinImageCard
        label="CIN recto"
        url={client.cinDocumentUrl}
        name={client.cinDocumentName}
        imageClassName={imageClassName}
      />
      <CinImageCard
        label="CIN verso"
        url={client.cinDocumentBackUrl}
        name={client.cinDocumentBackName}
        imageClassName={imageClassName}
      />
    </div>
  );
}
