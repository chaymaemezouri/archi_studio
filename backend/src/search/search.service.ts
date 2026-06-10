import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { projectListWhere } from '../common/utils/project-access.util';
import type { AuthUser } from '../common/types/auth-user';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(user: Pick<AuthUser, 'studioId' | 'id' | 'role'>, query: string) {
    const q = query.trim();
    if (!q) {
      return {
        projects: [],
        clients: [],
        documents: [],
        tasks: [],
        finances: [],
      };
    }

    const contains: Prisma.StringFilter = {
      contains: q,
      mode: 'insensitive',
    };

    const projectScope = projectListWhere({
      studioId: user.studioId,
      userId: user.id,
      role: user.role as Role,
    });

    const [projects, clients, documents, tasks, devisList, invoices] =
      await Promise.all([
        this.prisma.project.findMany({
          where: {
            ...projectScope,
            OR: [
              { name: contains },
              { city: contains },
              { country: contains },
              { address: contains },
            ],
          },
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
            phase: true,
            visibility: true,
          },
          take: 8,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.client.findMany({
          where: {
            studioId: user.studioId,
            OR: [{ name: contains }, { company: contains }, { email: contains }],
          },
          select: { id: true, name: true, company: true, email: true },
          take: 8,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.projectFile.findMany({
          where: {
            project: projectScope,
            name: contains,
          },
          select: {
            id: true,
            name: true,
            projectId: true,
            project: { select: { id: true, name: true } },
          },
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.task.findMany({
          where: {
            project: projectScope,
            title: contains,
          },
          select: {
            id: true,
            title: true,
            projectId: true,
            project: { select: { id: true, name: true } },
          },
          take: 8,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.devis.findMany({
          where: {
            OR: [
              { project: projectScope },
              { client: { studioId: user.studioId } },
            ],
            number: contains,
          },
          select: { id: true, number: true },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        }),
        this.prisma.invoice.findMany({
          where: {
            client: { studioId: user.studioId },
            number: contains,
          },
          select: { id: true, number: true },
          take: 5,
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

    const finances = [
      ...devisList.map((d) => ({
        id: d.id,
        kind: 'devis' as const,
        label: `Devis ${d.number}`,
        href: `/devis/${d.id}`,
      })),
      ...invoices.map((inv) => ({
        id: inv.id,
        kind: 'invoice' as const,
        label: `Facture ${inv.number}`,
        href: `/invoices/${inv.id}`,
      })),
    ];

    return { projects, clients, documents, tasks, finances };
  }
}
