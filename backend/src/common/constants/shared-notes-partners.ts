import { PrismaService } from '../../prisma/prisma.service';

/**
 * Cercles de cabinets qui partagent la même discussion (notes).
 * Les slugs doivent matcher Studio.slug — aucune donnée n’est migrée :
 * on élargit seulement la lecture / les notifs au cercle.
 */
export const SHARED_NOTES_STUDIO_CIRCLES: readonly (readonly string[])[] = [
  ['amini', 'maouni'],
];

/** Studio IDs visibles pour les notes partagées (soi + partenaires du cercle). */
export async function resolveSharedNotesStudioIds(
  prisma: PrismaService,
  studioId: string,
): Promise<string[]> {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { id: true, slug: true },
  });
  if (!studio) return [studioId];

  const circle = SHARED_NOTES_STUDIO_CIRCLES.find((group) =>
    group.includes(studio.slug),
  );
  if (!circle) return [studio.id];

  const partners = await prisma.studio.findMany({
    where: { slug: { in: [...circle] } },
    select: { id: true },
  });
  const ids = partners.map((p) => p.id);
  return ids.length > 0 ? ids : [studio.id];
}
