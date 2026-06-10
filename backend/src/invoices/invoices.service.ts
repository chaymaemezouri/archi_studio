import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { computeInvoiceStatus } from '../common/utils/invoice-status.util';
import { nextDocumentNumber } from '../common/utils/document-number.util';
import { computeTotals, lineTotal } from '../common/utils/totals.util';
import { emptyToUndefined } from '../common/utils/dto.util';
import {
  projectByIdWhere,
  toProjectAccessContext,
} from '../common/utils/project-access.util';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceItemDto } from './dto/invoice-item.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

const listInclude = {
  client: { select: { id: true, name: true } },
  project: {
    select: {
      id: true,
      name: true,
      clientId: true,
      client: { select: { id: true, name: true } },
    },
  },
} as const;

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private activityLogs: ActivityLogsService,
  ) {}

  findAll(studioId: string) {
    return this.prisma.invoice.findMany({
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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: { orderBy: { order: 'asc' } },
        payments: { orderBy: { date: 'desc' } },
        attachments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  private buildItems(items: InvoiceItemDto[]) {
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
    const last = await this.prisma.invoice.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return nextDocumentNumber('FAC', last?.number, 'invoice-ma');
  }

  private async log(
    invoice: {
      id: string;
      number: string;
      clientId?: string | null;
      projectId?: string | null;
    },
    action: string,
    userId?: string,
    details?: Prisma.InputJsonValue,
  ) {
    if (!invoice.clientId && !invoice.projectId) return;
    await this.activityLogs.log({
      userId,
      clientId: invoice.clientId ?? undefined,
      projectId: invoice.projectId ?? undefined,
      action,
      entity: 'Invoice',
      entityId: invoice.id,
      details: details ?? { number: invoice.number },
    });
  }

  async syncInvoicePaymentState(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) return;

    const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const status = computeInvoiceStatus({
      status: invoice.status,
      totalTTC: invoice.totalTTC,
      paidAmount,
      dueDate: invoice.dueDate,
    });

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount, status },
      include: { items: true, client: true, project: true, payments: true },
    });
  }

  async create(
    dto: CreateInvoiceDto,
    studioId: string,
    userId?: string,
    userRole?: string,
  ) {
    const clientId = emptyToUndefined(dto.clientId);
    const clientName = emptyToUndefined(dto.clientName);
    const projectId = emptyToUndefined(dto.projectId);
    const projectName = emptyToUndefined(dto.projectName);

    if (!clientId && !clientName?.trim()) {
      throw new BadRequestException(
        'Le client est requis (sélection dans la liste ou nom saisi).',
      );
    }

    if (!dto.object?.trim()) {
      throw new BadRequestException('Objet de la facture requis.');
    }

    if (!dto.issueDate) {
      throw new BadRequestException('Date de facture requise.');
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
    const status = dto.status ?? InvoiceStatus.DRAFT;

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        status,
        studioId,
        clientId: clientId ?? null,
        clientName: clientId ? null : clientName ?? null,
        projectId: projectId ?? null,
        projectName: projectId ? null : projectName ?? null,
        devisId: emptyToUndefined(dto.devisId),
        object: dto.object,
        phase: dto.phase,
        tva,
        totalHT,
        totalTTC,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paymentMethod: dto.paymentMethod,
        bankTransferBy: dto.bankTransferBy,
        notes: dto.notes,
        items: { create: itemRows },
      },
      include: { items: true, client: true, project: true },
    });

    await this.log(invoice, 'invoice_created', userId);
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto, userId?: string) {
    const existing = await this.findOne(id);
    const tva = dto.tva ?? existing.tva;
    const itemRows = dto.items ? this.buildItems(dto.items) : null;
    const totals = itemRows
      ? computeTotals(itemRows, tva)
      : { totalHT: existing.totalHT, totalTTC: existing.totalTTC };

    const data: Prisma.InvoiceUpdateInput = {
      status: dto.status,
      phase: dto.phase,
      tva,
      totalHT: totals.totalHT,
      totalTTC: totals.totalTTC,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      paymentMethod: dto.paymentMethod,
      bankTransferBy: dto.bankTransferBy,
      object: dto.object,
      notes: dto.notes,
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
      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      data.items = { create: itemRows };
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true, payments: true, client: true, project: true },
    });

    await this.log(updated, 'invoice_updated', userId);
    return this.syncInvoicePaymentState(updated.id);
  }

  async remove(id: string, userId?: string) {
    const invoice = await this.findOne(id);
    await this.prisma.invoice.delete({ where: { id } });
    await this.log(invoice, 'invoice_deleted', userId);
    return { deleted: true };
  }
}
