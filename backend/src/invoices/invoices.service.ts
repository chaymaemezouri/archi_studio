import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { computeInvoiceStatus } from '../common/utils/invoice-status.util';
import { nextDocumentNumber } from '../common/utils/document-number.util';
import { computeTotals, lineTotal } from '../common/utils/totals.util';
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
        OR: [{ client: { studioId } }, { project: { studioId } }],
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
    return items.map((item, index) => ({
      description: item.description,
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice,
      total: lineTotal(item),
      order: item.order ?? index,
    }));
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

  async create(dto: CreateInvoiceDto, studioId: string, userId?: string) {
    const settings = await this.settingsService.get(studioId);
    const tva = dto.tva ?? settings.tvaDefault;
    const itemRows = this.buildItems(dto.items);
    const { totalHT, totalTTC } = computeTotals(itemRows, tva);
    const number = await this.generateNumber(studioId);
    const status = dto.status ?? InvoiceStatus.DRAFT;

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        status,
        clientId: dto.clientId,
        projectId: dto.projectId,
        devisId: dto.devisId,
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
    }
    if (dto.projectId !== undefined) {
      data.project = dto.projectId
        ? { connect: { id: dto.projectId } }
        : { disconnect: true };
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
