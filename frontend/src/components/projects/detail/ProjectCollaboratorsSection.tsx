"use client";

import { useState } from "react";
import { Mail, UserMinus, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
  useAddProjectCollaborator,
  useRemoveProjectCollaborator,
} from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import {
  detailBtnSecondary,
  detailCaption,
  detailInfoGroup,
  detailInfoGroupTitle,
  detailInfoLabel,
  detailInfoValue,
} from "./project-detail-ui";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectCollaboratorsSectionProps {
  project: Project;
}

export default function ProjectCollaboratorsSection({
  project,
}: ProjectCollaboratorsSectionProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const addCollaborator = useAddProjectCollaborator(project.id);
  const removeCollaborator = useRemoveProjectCollaborator(project.id);

  const isOwnerStudio = user?.studioId === project.studioId;
  const collaborators = project.collaborators ?? [];

  const handleInvite = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    addCollaborator.mutate(trimmed, {
      onSuccess: () => {
        setEmail("");
        toast.success("Collaborateur invité");
      },
    });
  };

  return (
    <div className={detailInfoGroup}>
      <h2 className={detailInfoGroupTitle}>
        <Users className="mr-1.5 inline h-3.5 w-3.5" />
        Collaboration inter-cabinets
      </h2>
      <p className={detailCaption}>
        {isOwnerStudio
          ? "Invitez un collègue d'un autre cabinet (ex. admin@maouni.architecture) pour qu'il voie ce projet dans son espace."
          : "Ce projet vous est partagé par un cabinet partenaire."}
      </p>

      {project.studio && user?.studioId !== project.studioId && (
        <div className="mt-2 rounded-lg border border-app px-3 py-2 text-[12px] text-glass-secondary">
          Cabinet propriétaire :{" "}
          <span className="font-medium text-glass">{project.studio.name}</span>
        </div>
      )}

      {collaborators.length > 0 && (
        <ul className="mt-3 space-y-2">
          {collaborators.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-app px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-glass">
                  {entry.user.name}
                </p>
                <p className="truncate text-[11px] text-glass-muted">
                  {entry.user.email}
                  {entry.user.studio?.name ? ` · ${entry.user.studio.name}` : ""}
                </p>
              </div>
              {isOwnerStudio && (
                <button
                  type="button"
                  className={cn(
                    detailBtnSecondary,
                    "shrink-0 px-2 py-1 text-[11px]"
                  )}
                  disabled={removeCollaborator.isPending}
                  onClick={() => removeCollaborator.mutate(entry.userId)}
                  aria-label={`Retirer ${entry.user.name}`}
                >
                  <UserMinus className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOwnerStudio && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="collaborator-email">
            Email du collaborateur
          </label>
          <div className="relative min-w-0 flex-1">
            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-glass-muted" />
            <input
              id="collaborator-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@maouni.architecture"
              className="w-full rounded-lg border border-app bg-transparent py-2 pl-8 pr-3 text-[12px] text-glass outline-none transition focus:border-studio-border/40"
            />
          </div>
          <button
            type="button"
            className={detailBtnSecondary}
            disabled={!email.trim() || addCollaborator.isPending}
            onClick={handleInvite}
          >
            Inviter
          </button>
        </div>
      )}

      {!isOwnerStudio && collaborators.length === 0 && (
        <p className={cn(detailInfoLabel, "mt-2")}>
          Aucun autre collaborateur externe.
        </p>
      )}
    </div>
  );
}
