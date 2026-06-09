"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import {
  detailSummaryCard,
  detailSummaryCardGrid,
  detailSummaryCardTitle,
  detailSummaryFieldGrid,
  detailSummaryFieldLabel,
  detailSummaryFieldLink,
  detailSummaryFieldRow,
  detailSummaryFieldValue,
  detailSummaryFieldValueMuted,
  detailSummaryFieldValueWrap,
  detailSummaryMapsIcon,
} from "./project-detail-ui";
import {
  PROJECT_CATEGORY_SHORT_LABELS,
  PROJECT_SCALE_LABELS,
} from "@/lib/project-phases";
import { getProjectMapsUrl } from "@/lib/project-location";
import type { Project } from "@/types";
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

function clientContactLabel(project: Project): string | null {
  const client = project.client;
  if (!client) return null;
  if (client.email) return client.email;
  if (client.phone) return client.phone;
  return null;
}

interface ProjectDetailProjectSummaryProps {
  project: Project;
}

export default function ProjectDetailProjectSummary({ project }: ProjectDetailProjectSummaryProps) {
  const clientLabel =
    project.client?.company || project.client?.name || null;
  const contactLabel = clientContactLabel(project);
  const mapsUrl = project.address?.trim() ? getProjectMapsUrl(project) : null;

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

  return (
    <div className={detailSummaryCardGrid}>
      <div className={detailSummaryCard}>
        <h3 className={detailSummaryCardTitle}>Identité</h3>
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
              project.clientId && contactLabel ? (
                <Link
                  href={`/clients/${project.clientId}`}
                  className={detailSummaryFieldLink}
                >
                  {contactLabel}
                </Link>
              ) : project.clientId ? (
                <Link
                  href={`/clients/${project.clientId}`}
                  className={detailSummaryFieldLink}
                >
                  Voir la fiche client
                </Link>
              ) : null
            }
          />
          <FieldRow
            label="Adresse"
            value={project.address}
            trailing={mapsIcon}
          />
          <FieldRow label="Ville" value={project.city} />
          <FieldRow label="Pays" value={project.country} />
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
              project.projectScale
                ? PROJECT_SCALE_LABELS[project.projectScale]
                : null
            }
          />
        </div>
      </div>

      <div className={detailSummaryCard}>
        <h3 className={detailSummaryCardTitle}>Données techniques</h3>
        <div className={detailSummaryFieldGrid}>
          <FieldRow label="Type" value={project.type} />
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
            value={
              project.budget != null ? formatCurrency(project.budget) : null
            }
          />
          <FieldRow
            label="Prise du projet"
            value={
              project.intakeDate
                ? formatDate(project.intakeDate, "d MMM yyyy")
                : null
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
