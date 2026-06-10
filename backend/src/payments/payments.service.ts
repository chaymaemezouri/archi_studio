import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private invoicesService: InvoicesService,
    private activityLogs: ActivityLogsService,
  ) {}

  findAll(
    studioId: string,
    filters?: {
      invoiceId?: string;
      clientId?: string;
      projectId?: string;
      method?: string;
      from?: string;
      to?: string;
    },
  ) {
    const where: Record<string, unknown> = {
      OR: [
        { invoice: { client: { studioId } } },
        { invoice: { project: { studioId } } },
        { client: { studioId } },
        { project: { studioId } },
      ],
    };

    if (filters?.invoiceId) where.invoiceId = filters.invoiceId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.projectId) {
      where.AND = [
        {
          OR: [
            { projectId: filters.projectId },
            { invoice: { projectId: filters.projectId } },
          ],
        },
      ];
    }
    if (filters?.method) where.method = filters.method;
    if (filters?.from || filters?.to) {
      where.date = {
        ...(filters.from ? { gte: new Date(filters.from) } : {}),
        ...(filters.to
          ? { lte: new Date(`${filters.to}T23:59:59.999Z`) }
          : {}),
      };
    }

    return this.prisma.payment.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            clientId: true,
            projectId: true,
            status: true,
            totalTTC: true,
            paidAmount: true,
            client: { select: { id: true, name: true } },
            project: {
              select: {
                id: true,
                name: true,
                clientId: true,
                client: { select: { id: true, name: true } },
              },
            },
          },
        },
        client: { select: { id: true, name: true } },
        project: {
          select: {
            id: true,
            name: true,
            clientId: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            client: true,
            project: true,
          },
        },
        client: true,
        project: true,
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  private async resolvePaymentLinks(dto: {
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
  }) {
    let clientId = dto.clientId;
    let projectId = dto.projectId;

    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
        select: {
          clientId: true,
          projectId: true,
          project: { select: { clientId: true } },
        },
      });
      if (!projectId) projectId = invoice?.projectId ?? undefined;
      if (!clientId) {
        clientId = invoice?.clientId ?? invoice?.project?.clientId ?? undefined;
      }
    }

    if (!clientId && projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: { clientId: true },
      });
      clientId = project?.clientId ?? undefined;
    }

    return { clientId, projectId };
  }

  async create(dto: CreatePaymentDto, userId?: string) {
    let linkedInvoice:
      | {
          id: string;
          number: string;
          clientId: string | null;
          projectId: string | null;
          totalTTC: number;
          paidAmount: number;
        }
      | null = null;
    if (dto.invoiceId) {
      linkedInvoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
        select: {
          id: true,
          number: true,
          clientId: true,
          projectId: true,
          totalTTC: true,
          paidAmount: true,
        },
      });
      if (!linkedInvoice) throw new NotFoundException('Invoice not found');
      const remaining = linkedInvoice.totalTTC - (linkedInvoice.paidAmount ?? 0);
      if (dto.amount > remaining + 0.001) {
        throw new Error('Le montant dépasse le reste à payer de la facture.');
      }
    }

    const resolved = await this.resolvePaymentLinks(dto);

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        clientId: resolved.clientId,
        projectId: resolved.projectId,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        method: dto.method,
        reference: dto.reference,
        notes: dto.notes,
        proofUrl: dto.proofUrl,
      },
      include: { invoice: true, client: true, project: true },
    });
    if (dto.invoiceId) {
      await this.invoicesService.syncInvoicePaymentState(dto.invoiceId);
    }

    const inv = payment.invoice;
    if (inv?.clientId || inv?.projectId || payment.clientId || payment.projectId) {
      await this.activityLogs.log({
        userId,
        clientId: inv?.clientId ?? payment.clientId ?? undefined,
        projectId: inv?.projectId ?? payment.projectId ?? undefined,
        action: 'payment_added',
        entity: 'Payment',
        entityId: payment.id,
        details: {
          amount: dto.amount,
          invoiceNumber: inv?.number,
        },
      });
    }

    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto, userId?: string) {
    const existing = await this.findOne(id);
    const previousInvoiceId = existing.invoiceId;
    let targetInvoiceId = dto.invoiceId ?? previousInvoiceId ?? undefined;

    if (targetInvoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: targetInvoiceId },
        select: { id: true, totalTTC: true, paidAmount: true },
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      const currentAmount = dto.amount ?? existing.amount;
      const previousOnTarget = previousInvoiceId === targetInvoiceId ? existing.amount : 0;
      const remaining =
        invoice.totalTTC - (invoice.paidAmount ?? 0) + previousOnTarget;
      if (currentAmount > remaining + 0.001) {
        throw new Error('Le montant dépasse le reste à payer de la facture.');
      }
    }

    const resolved = await this.resolvePaymentLinks({
      clientId: dto.clientId ?? existing.clientId ?? undefined,
      projectId: dto.projectId ?? existing.projectId ?? undefined,
      invoiceId: targetInvoiceId,
    });

    const payment = await this.prisma.payment.update({
      where: { id },
      data: {
        invoiceId: dto.invoiceId,
        clientId: resolved.clientId ?? existing.clientId ?? undefined,
        projectId: resolved.projectId ?? existing.projectId ?? undefined,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : undefined,
        method: dto.method,
        reference: dto.reference,
        notes: dto.notes,
        proofUrl: dto.proofUrl,
      },
      include: { invoice: true, client: true, project: true },
    });

    if (previousInvoiceId) {
      await this.invoicesService.syncInvoicePaymentState(previousInvoiceId);
    }
    if (targetInvoiceId && targetInvoiceId !== previousInvoiceId) {
      await this.invoicesService.syncInvoicePaymentState(targetInvoiceId);
    }

    if (payment.clientId || payment.projectId || payment.invoiceId) {
      await this.activityLogs.log({
        userId,
        clientId: payment.clientId ?? payment.invoice?.clientId ?? undefined,
        projectId: payment.projectId ?? payment.invoice?.projectId ?? undefined,
        action: 'payment_updated',
        entity: 'Payment',
        entityId: payment.id,
        details: {
          amount: payment.amount,
          invoiceNumber: payment.invoice?.number,
        },
      });
    }

    return payment;
  }

  async remove(id: string, userId?: string) {
    const existing = await this.findOne(id);
    await this.prisma.payment.delete({ where: { id } });

    if (existing.invoiceId) {
      await this.invoicesService.syncInvoicePaymentState(existing.invoiceId);
    }

    if (existing.clientId || existing.projectId || existing.invoice?.clientId) {
      await this.activityLogs.log({
        userId,
        clientId: existing.clientId ?? existing.invoice?.clientId ?? undefined,
        projectId: existing.projectId ?? existing.invoice?.projectId ?? undefined,
        action: 'payment_deleted',
        entity: 'Payment',
        entityId: existing.id,
        details: {
          amount: existing.amount,
          invoiceNumber: existing.invoice?.number,
        },
      });
    }

    return { deleted: true };
  }
}
