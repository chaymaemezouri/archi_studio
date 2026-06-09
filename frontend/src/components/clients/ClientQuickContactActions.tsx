"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";
import { Copy, Mail, MapPin, Phone } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { detailIconActionGroup } from "./client-detail-ui";
import type { Client } from "@/types";
import { cn } from "@/lib/utils";

export function clientMapsQuery(client: Client): string {
  return [client.address, client.city, client.country].filter(Boolean).join(", ");
}

interface ClientQuickContactActionsProps {
  client: Client;
  className?: string;
  /** Empêche la navigation quand la carte/ligne est cliquable */
  stopPropagation?: boolean;
}

export default function ClientQuickContactActions({
  client,
  className,
  stopPropagation = true,
}: ClientQuickContactActionsProps) {
  const mapsQuery = clientMapsQuery(client);
  const phone = client.phone?.trim();
  const email = client.email?.trim();

  const guard = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation();
    },
    [stopPropagation]
  );

  const copy = useCallback(
    async (text: string, e: React.MouseEvent) => {
      guard(e);
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copié");
      } catch {
        toast.error("Impossible de copier");
      }
    },
    [guard]
  );

  if (!phone && !email && !mapsQuery) return null;

  return (
    <div
      className={cn(detailIconActionGroup, className)}
      onClick={guard}
      onMouseDown={guard}
      role="group"
      aria-label="Actions contact"
    >
      {phone && (
        <>
          <IconActionButton
            label={`Appeler ${phone}`}
            icon={Phone}
            tone="view"
            href={`tel:${phone.replace(/\s/g, "")}`}
          />
          <IconActionButton
            label="Copier le téléphone"
            icon={Copy}
            tone="notes"
            onClick={(e) => copy(phone, e)}
          />
        </>
      )}
      {email && (
        <>
          <IconActionButton
            label={`Email ${email}`}
            icon={Mail}
            tone="notes"
            href={`mailto:${email}`}
          />
          <IconActionButton
            label="Copier l'email"
            icon={Copy}
            tone="notes"
            onClick={(e) => copy(email, e)}
          />
        </>
      )}
      {mapsQuery && (
        <IconActionButton
          label={`Carte : ${mapsQuery}`}
          icon={MapPin}
          tone="view"
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noreferrer"
        />
      )}
    </div>
  );
}

/** Entreprise affichée une seule fois (pas si identique au nom) */
export function clientDisplayCompany(client: Client): string | null {
  const company = client.company?.trim();
  if (!company) return null;
  if (client.type !== "COMPANY" && client.name.trim() === company) return null;
  if (company === client.name.trim()) return null;
  return company;
}
