export const STUDIO_INVITE_CODES: Record<string, string> = {
  AMINI2026: 'amini',
  MAOUNI2026: 'maouni',
};

import { PrismaService } from '../../prisma/prisma.service';

export async function resolveStudioIdByInvite(
  prisma: PrismaService,
  inviteCode: string,
): Promise<string | null> {
  const slug = STUDIO_INVITE_CODES[inviteCode.trim().toUpperCase()];
  if (!slug) return null;
  const studio = await prisma.studio.findUnique({ where: { slug } });
  return studio?.id ?? null;
}
