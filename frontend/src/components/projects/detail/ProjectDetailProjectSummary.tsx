"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { clientDisplayCompany } from "@/components/clients/ClientQuickContactActions";
import {
  detailSummaryCard,
  detailSummaryCardGridStack,
  detailSummaryCardTitle,
  detailSummaryFieldGrid,
  detailSummaryFieldLabel,
  detailSummaryFieldLink,
  detailSummaryFieldRow,
  detailSummaryFieldValue,
  detailSummaryFieldValueMuted,
  detailSummaryFieldValueWrap,
  detailSummaryGalleryInfo,
  detailSummaryMapsIcon,
} from "./project-detail-ui";
import {
  PROJECT_CATEGORY_SHORT_LABELS,
  PROJECT_SCALE_LABELS,
} from "@/lib/project-phases";
import { getProjectMapsUrl } from "@/lib/project-location";
import type { Client, Project } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

function displayValue(value: React.ReactNode, empty = "Non défini") {
  if (value === null || value === undefined || value === "") {
    return <span className={detailSummaryFieldValueMuted}>{empty}</span>;
  }
  return value;
}

function FieldRow({
  label,
  value,
  empty,
  trailing,
}: {
  label: string;
  value: React.ReactNode;
  empty?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className={detailSummaryFieldRow}>
      <span className={detailSummaryFieldLabel}>{label}</span>
      <div className={detailSummaryFieldValueWrap}>
        <span className={detailSummaryFieldValue}>{displayValue(value, empty)}</span>
        {trailing}
      </div>
    </div>
  );
}

function formatProjectUrlDisplay(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + parsed.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

function formatCoord(value: number | null | undefined): string | null {
  if (value == null) return null;
  if (Number.isInteger(value)) return String(value);
  return value.toLocaleString("fr-FR", { maximumFractionDigits: 3 });
}

function clientDisplayName(client: Client): string {
  const company = clientDisplayCompany(client);
  if (company) return company;
  const full = [client.firstName, client.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  return client.name;
}

function clientContactLabel(project: Project): string | null {
  const client = project.client;
  if (!client) return null;
  if (client.phone) return client.phone;
  if (client.email) return client.email;
  return null;
}

/** Bloc sous la galerie : client + identité projet */
export function ProjectDetailGalleryInfo({ project }: { project: Project }) {
  const clientLabel = project.client ? clientDisplayName(project.client) : null;
  const contactLabel = clientContactLabel(project);

  return (
    <div className={detailSummaryGalleryInfo}>
      <h3 className={detailSummaryCardTitle}>Client & projet</h3>
      <div className={detailSummaryFieldGrid}>
        <FieldRow
          label="Client"
          value={
            project.clientId && clientLabel ? (
              <Link
                href={`/clients/${project.clientId}`}
                className={detailSummaryFieldLink}
              >
                {clientLabel}
              </Link>
            ) : (
              clientLabel
            )
          }
        />
        <FieldRow
          label="Contact"
          value={
            project.clientId ? (
              <Link
                href={`/clients/${project.clientId}`}
                className={detailSummaryFieldLink}
              >
                {contactLabel || "Voir la fiche client"}
              </Link>
            ) : null
          }
        />
        <FieldRow label="Nature" value={project.projectNature} />
        <FieldRow
          label="Catégorie"
          value={
            project.projectCategory
              ? PROJECT_CATEGORY_SHORT_LABELS[project.projectCategory]
              : "Privé"
          }
        />
        <FieldRow
          label="Taille"
          value={
            project.projectScale ? PROJECT_SCALE_LABELS[project.projectScale] : null
          }
        />
        <FieldRow label="Type" value={project.type} />
      </div>
    </div>
  );
}

/** Colonne droite : localisation + données techniques */
export default function ProjectDetailProjectSummary({ project }: { project: Project }) {
  const mapsUrl = getProjectMapsUrl(project);
  const mapsIcon =
    mapsUrl ? (
      <Tooltip label="Voir sur Google Maps">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={detailSummaryMapsIcon}
          aria-label="Voir sur Google Maps"
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden />
        </a>
      </Tooltip>
    ) : null;

  const coordXY =
    project.coordinateX != null && project.coordinateY != null
      ? `${formatCoord(project.coordinateX)} / ${formatCoord(project.coordinateY)}`
      : null;

  const coordLatLng =
    project.latitude != null && project.longitude != null
      ? `${formatCoord(project.latitude)} / ${formatCoord(project.longitude)}`
      : null;

  return (
    <div className={detailSummaryCardGridStack}>
      <div className={detailSummaryCard}>
        <h3 className={detailSummaryCardTitle}>Localisation</h3>
        <div className={detailSummaryFieldGrid}>
          <FieldRow label="Adresse" value={project.address} trailing={mapsIcon} />
          {mapsUrl ? (
            <FieldRow
              label="Carte"
              value={
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailSummaryFieldLink}
                >
                  Voir sur Google Maps
                </a>
              }
            />
          ) : null}
          <FieldRow label="Ville" value={project.city} />
          <FieldRow label="Pays" value={project.country} />
          {project.province ? <FieldRow label="Province" value={project.province} /> : null}
          {project.prefecture ? (
            <FieldRow label="Préfecture" value={project.prefecture} />
          ) : null}
          {project.commune ? <FieldRow label="Commune" value={project.commune} /> : null}
          {project.arrondissement ? (
            <FieldRow label="Arrondissement" value={project.arrondissement} />
          ) : null}
          {coordXY ? <FieldRow label="Coord. topo X/Y" value={coordXY} /> : null}
          {coordLatLng ? <FieldRow label="Lat/Long" value={coordLatLng} /> : null}
          <FieldRow
            label="URL"
            value={
              project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailSummaryFieldLink}
                >
                  {formatProjectUrlDisplay(project.url)}
                </a>
              ) : null
            }
          />
          {project.driveUrl ? (
            <FieldRow
              label="Drive"
              value={
                <a
                  href={project.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={detailSummaryFieldLink}
                >
                  Ouvrir Drive
                </a>
              }
            />
          ) : null}
        </div>
      </div>

      <div className={detailSummaryCard}>
        <h3 className={detailSummaryCardTitle}>Données techniques</h3>
        <div className={detailSummaryFieldGrid}>
          <FieldRow
            label="Surface"
            value={project.surface != null ? `${project.surface} m²` : null}
          />
          <FieldRow
            label="Surface titre"
            value={
              project.titleSurface != null ? `${project.titleSurface} m²` : null
            }
          />
          <FieldRow
            label="Budget estimé"
            value={project.budget != null ? formatCurrency(project.budget) : null}
          />
          <FieldRow
            label="Échéance"
            value={
              project.deadline ? formatDate(project.deadline, "d MMM yyyy") : null
            }
          />
          <FieldRow
            label="Prise du projet"
            value={
              project.intakeDate ? formatDate(project.intakeDate, "d MMM yyyy") : null
            }
          />
          <FieldRow
            label="Création"
            value={formatDate(project.createdAt, "d MMM yyyy")}
          />
          <FieldRow
            label="Mise à jour"
            value={formatDate(project.updatedAt, "d MMM yyyy")}
          />
        </div>
      </div>
    </div>
  );
}
