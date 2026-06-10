import { ProjectVisibility, Role } from '@prisma/client';

export type ProjectAccessContext = {
  studioId: string;
  userId: string;
  role?: Role;
};

function sharedOrOwnedFilter(ctx: ProjectAccessContext) {
  return {
    OR: [
      { visibility: ProjectVisibility.STUDIO },
      {
        visibility: ProjectVisibility.PERSONAL,
        ownerId: ctx.userId,
      },
    ],
  };
}

function inStudioFilter(ctx: ProjectAccessContext) {
  if (ctx.role === Role.OWNER) {
    return { studioId: ctx.studioId };
  }

  return {
    AND: [{ studioId: ctx.studioId }, sharedOrOwnedFilter(ctx)],
  };
}

/** Projets partagés explicitement avec l'utilisateur (autre cabinet). */
function collaboratorFilter(ctx: ProjectAccessContext) {
  return {
    collaborators: { some: { userId: ctx.userId } },
  };
}

/** Filtre Prisma : projets visibles pour l'utilisateur. */
export function projectListWhere(ctx: ProjectAccessContext) {
  return {
    OR: [inStudioFilter(ctx), collaboratorFilter(ctx)],
  };
}

export function projectByIdWhere(ctx: ProjectAccessContext, projectId: string) {
  return {
    AND: [{ id: projectId }, projectListWhere(ctx)],
  };
}

/** Filtre pour relations project (tasks, deadlines, etc.). */
export function projectRelationWhere(ctx: ProjectAccessContext) {
  return projectListWhere(ctx);
}

export function toProjectAccessContext(user: {
  studioId: string;
  id: string;
  role?: string;
}): ProjectAccessContext {
  return {
    studioId: user.studioId,
    userId: user.id,
    role: user.role as Role | undefined,
  };
}

/** L'utilisateur appartient au cabinet propriétaire du projet (peut inviter des collaborateurs). */
export function isProjectStudioMember(
  ctx: ProjectAccessContext,
  projectStudioId: string,
): boolean {
  return ctx.studioId === projectStudioId;
}
