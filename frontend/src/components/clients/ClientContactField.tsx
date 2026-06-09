"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import type { LucideIcon } from "lucide-react";
import { Copy, Mail, MapPin, Phone } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import {
  detailClientContactActions,
  detailClientContactLabel,
  detailClientContactRow,
  detailClientContactValue,
} from "./client-detail-ui";

type ContactKind = "phone" | "email" | "address" | "text";

interface ClientContactFieldProps {
  label: string;
  value?: string | null;
  kind?: ContactKind;
  /** Pour kind=address : ville + pays en complément */
  mapsQuery?: string | null;
  icon?: LucideIcon;
}

function buildHref(kind: ContactKind, value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (kind === "phone") return `tel:${v.replace(/\s/g, "")}`;
  if (kind === "email") return `mailto:${v}`;
  return null;
}

function buildMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function ClientContactField({
  label,
  value,
  kind = "text",
  mapsQuery,
  icon: Icon,
}: ClientContactFieldProps) {
  const display = value?.trim();
  if (!display) return null;

  const href = buildHref(kind, display);
  const maps =
    kind === "address" && mapsQuery?.trim()
      ? buildMapsUrl(mapsQuery.trim())
      : null;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(display);
      toast.success("Copié");
    } catch {
      toast.error("Impossible de copier");
    }
  }, [display]);

  return (
    <div className={detailClientContactRow}>
      <span className={detailClientContactLabel}>{label}</span>
      <div className="min-w-0 flex-1">
        {href ? (
          <a href={href} className={detailClientContactValue}>
            {Icon && <Icon className="mr-1.5 inline h-3.5 w-3.5 text-[#8ba4c7]/50" strokeWidth={1.75} />}
            {display}
          </a>
        ) : (
          <span className={detailClientContactValue}>
            {Icon && <Icon className="mr-1.5 inline h-3.5 w-3.5 text-[#8ba4c7]/50" strokeWidth={1.75} />}
            {display}
          </span>
        )}
        <div className={detailClientContactActions}>
          {kind === "phone" && href && (
            <IconActionButton label="Appeler" icon={Phone} tone="view" href={href} />
          )}
          {kind === "email" && href && (
            <IconActionButton label="Envoyer un email" icon={Mail} tone="notes" href={href} />
          )}
          {maps && (
            <IconActionButton
              label="Ouvrir dans Maps"
              icon={MapPin}
              tone="view"
              href={maps}
              target="_blank"
              rel="noreferrer"
            />
          )}
          <IconActionButton label="Copier" icon={Copy} tone="notes" onClick={copy} />
        </div>
      </div>
    </div>
  );
}
