import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DevisStatus, InvoiceStatus, Prisma } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { nextDocumentNumber } from '../common/utils/document-number.util';
import { emptyToNull, emptyToUndefined } from '../common/utils/dto.util';
import {
  projectByIdWhere,
  toProjectAccessContext,
} from '../common/utils/project-access.util';
import { computeTotals, lineTotal } from '../common/utils/totals.util';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { DevisItemDto } from './dto/devis-item.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';

const listInclude = {
  client: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
} as const;

@Injectable()
export class DevisService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private activityLogs: ActivityLogsService,
  ) {}

  findAll(studioId: string) {
    return this.prisma.devis.findMany({
      where: {
        OR: [
          { studioId },
          { client: { studioId } },
          { project: { studioId } },
        ],
      },
      include: listInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: { orderBy: { order: 'asc' } },
      },
    });
    if (!devis) throw new NotFoundException('Devis not found');
    return devis;
  }

  private buildItems(items: DevisItemDto[]) {
    const rows = items
      .map((item, index) => ({
        description: item.description?.trim() || 'Prestation',
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? 0,
        total: lineTotal(item),
        order: item.order ?? index,
      }))
      .filter((item) => item.description || item.unitPrice > 0);
    if (rows.length === 0) {
      throw new BadRequestException('Ajoutez au moins une ligne de prestation.');
    }
    return rows;
  }

  private async generateNumber(studioId: string): Promise<string> {
    const settings = await this.settingsService.get(studioId);
    const year = new Date().getFullYear();
    const last = await this.prisma.devis.findFirst({
      where: {
        number: { contains: `-${year}` },
      },
      orderBy: { number: 'desc' },
    });
    return nextDocumentNumber(settings.devisPrefix, last?.number, 'year');
  }

  private async log(
    devis: { id: string; number: string; clientId?: string | null; projectId?: string | null },
    action: string,
    userId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    if (!devis.clientId && !devis.projectId) return;
    await this.activityLogs.log({
      userId,
      clientId: devis.clientId ?? undefined,
      projectId: devis.projectId ?? undefined,
      action,
      entity: 'Devis',
      entityId: devis.id,
      details: details ?? { number: devis.number },
    });
  }

  async create(
    dto: CreateDevisDto,
    studioId: string,
    userId?: string,
    userRole?: string,
  ) {
    const clientId = emptyToUndefined(dto.clientId);
    const clientName = emptyToUndefined(dto.clientName);
    const projectId = emptyToUndefined(dto.projectId);
    const projectName = emptyToUndefined(dto.projectName);

    if (!dto.object?.trim()) {
      throw new BadRequestException('Objet du devis requis.');
    }

    if (projectId && userId) {
      const project = await this.prisma.project.findFirst({
        where: projectByIdWhere(
          toProjectAccessContext({ studioId, id: userId, role: userRole }),
          projectId,
        ),
        select: { id: true },
      });
      if (!project) {
        throw new BadRequestException('Projet introuvable ou inaccessible.');
      }
    }

    const settings = await this.settingsService.get(studioId);
    const tva = dto.tva ?? settings.tvaDefault;
    const itemRows = this.buildItems(dto.items ?? []);
    const { totalHT, totalTTC } = computeTotals(itemRows, tva);
    const number = await this.generateNumber(studioId);

    const devis = await this.prisma.devis.create({
      data: {
        number,
        status: dto.status ?? DevisStatus.DRAFT,
        studioId,
        clientId: clientId ?? null,
        clientName: clientId ? null : clientName ?? null,
        projectId: projectId ?? null,
        projectName: projectId ? null : projectName ?? null,
        tva,
        totalHT,
        totalTTC,
        object: dto.object,
        paymentTerms:
          dto.paymentTerms ??
          '40% à l\'avance\n60% après obtention de l\'autorisation',
        notes: dto.notes,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        items: { create: itemRows },
      },
      include: { items: true, client: true, project: true },
    });

    await this.log(devis, 'quote_created', userId);
    return devis;
  }

  async update(id: string, dto: UpdateDevisDto, userId?: string) {
    const existing = await this.findOne(id);
    const tva = dto.tva ?? existing.tva;
    const itemRows = dto.items ? this.buildItems(dto.items) : null;
    const totals = itemRows
      ? computeTotals(itemRows, tva)
      : { totalHT: existing.totalHT, totalTTC: existing.totalTTC };

    const data: Prisma.DevisUpdateInput = {
      status: dto.status,
      tva,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      object: dto.object,
      paymentTerms: dto.paymentTerms,
      notes: dto.notes,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
    };

    if (dto.clientId !== undefined) {
      data.client = dto.clientId
        ? { connect: { id: dto.clientId } }
        : { disconnect: true };
      if (dto.clientId) data.clientName = null;
    }
    if (dto.clientName !== undefined && !dto.clientId) {
      data.clientName = dto.clientName.trim() || null;
    }
    if (dto.projectId !== undefined) {
      data.project = dto.projectId
        ? { connect: { id: dto.projectId } }
        : { disconnect: true };
      if (dto.projectId) data.projectName = null;
    }
    if (dto.projectName !== undefined && !dto.projectId) {
      data.projectName = dto.projectName.trim() || null;
    }

    if (itemRows) {
      await this.prisma.devisItem.deleteMany({ where: { devisId: id } });
      data.items = { create: itemRows };
    }

    const devis = await this.prisma.devis.update({
      where: { id },
      data,
      include: { items: true, client: true, project: true },
    });

    await this.log(devis, 'quote_updated', userId);
    return devis;
  }

  async remove(id: string, userId?: string) {
    const devis = await this.findOne(id);
    await this.prisma.devis.delete({ where: { id } });
    await this.log(devis, 'quote_deleted', userId);
    return { deleted: true };
  }

  async convertToInvoice(id: string, studioId: string, userId?: string) {
    const devis = await this.findOne(id);
    if (devis.status !== DevisStatus.ACCEPTED) {
      throw new BadRequestException(
        'Seuls les devis acceptés peuvent être convertis en facture.',
      );
    }

    const last = await this.prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const number = nextDocumentNumber('FAC', last?.number, 'invoice-ma');

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        status: InvoiceStatus.DRAFT,
        clientId: devis.clientId,
        clientName: devis.clientName,
        projectId: devis.projectId,
        projectName: devis.projectName,
        studioId: devis.studioId ?? studioId,
        devisId: devis.id,
        object: devis.object,
        tva: devis.tva,
        totalHT: devis.totalHT,
        totalTTC: devis.totalTTC,
        notes: devis.paymentTerms,
        items: {
          create: devis.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            order: item.order ?? index,
          })),
        },
      },
      include: { items: true, client: true, project: true },
    });

    await this.activityLogs.log({
      userId,
      clientId: devis.clientId ?? undefined,
      projectId: devis.projectId ?? undefined,
      action: 'quote_converted',
      entity: 'Invoice',
      entityId: invoice.id,
      details: { devisNumber: devis.number, invoiceNumber: invoice.number },
    });

    return invoice;
  }
}
