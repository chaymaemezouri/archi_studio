import {
  DevisStatus,
  InvoiceStatus,
  Prisma,
  ProjectStatus,
} from '@prisma/client';

const PENDING_DEVIS: DevisStatus[] = [DevisStatus.DRAFT, DevisStatus.SENT];
const UNPAID_INVOICE: InvoiceStatus[] = [
  InvoiceStatus.SENT,
  InvoiceStatus.UNPAID,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.OVERDUE,
];

type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    projects: { select: { id: true; name: true; status: true; updatedAt: true } };
    devis: { select: { id: true; status: true; totalTTC: true; updatedAt: true } };
    invoices: {
      select: {
        id: true;
        status: true;
        totalTTC: true;
        paidAmount: true;
        updatedAt: true;
      };
    };
    _count: { select: { projects: true; devis: true; invoices: true } };
  };
}>;

export function enrichClientSummary(client: ClientWithRelations) {
  const projects = client.projects ?? [];
  const devis = client.devis ?? [];
  const invoices = client.invoices ?? [];

  const activeProjectsCount = projects.filter(
    (p) => p.status === ProjectStatus.ACTIVE,
  ).length;
  const pendingQuotesCount = devis.filter((d) =>
    PENDING_DEVIS.includes(d.status),
  ).length;
  const unpaidInvoicesCount = invoices.filter((i) =>
    UNPAID_INVOICE.includes(i.status),
  ).length;

  const totalInvoiced = invoices.reduce((s, i) => s + i.totalTTC, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalQuotes = devis.reduce((s, d) => s + d.totalTTC, 0);

  const dates = [
    client.updatedAt,
    ...projects.map((p) => p.updatedAt),
    ...devis.map((d) => d.updatedAt),
    ...invoices.map((i) => i.updatedAt),
  ];
  const lastActivityAt = dates.reduce(
    (max, d) => (d > max ? d : max),
    client.updatedAt,
  );

  const { projects: _p, devis: _d, invoices: _i, ...base } = client;

  return {
    ...base,
    projectsCount: client._count.projects,
    activeProjectsCount,
    quotesCount: client._count.devis,
    pendingQuotesCount,
    invoicesCount: client._count.invoices,
    unpaidInvoicesCount,
    totalQuotes,
    totalInvoiced,
    totalPaid,
    remainingAmount: Math.max(0, totalInvoiced - totalPaid),
    lastActivityAt,
    projectNames: projects.map((p) => p.name),
  };
}

export function enrichClientDetail(
  client: Prisma.ClientGetPayload<{
    include: {
      projects: {
        include: {
          phaseProgress: true;
          deadlines: { where: { done: false }; take: 1; orderBy: { date: 'asc' } };
        };
      };
      devis: { include: { project: { select: { id: true; name: true } } } };
      invoices: {
        include: {
          project: { select: { id: true; name: true } };
          payments: true;
        };
      };
      clientNotes: true;
      documents: true;
      clientDocuments: true;
      activityLogs: {
        include: { user: { select: { id: true; name: true } } };
        orderBy: { createdAt: 'desc' };
        take: 100;
      };
    };
  }>,
) {
  const projects = client.projects ?? [];
  const devis = client.devis ?? [];
  const invoices = client.invoices ?? [];

  const activeProjectsCount = projects.filter(
    (p) => p.status === ProjectStatus.ACTIVE,
  ).length;
  const pendingQuotesCount = devis.filter((d) =>
    PENDING_DEVIS.includes(d.status),
  ).length;
  const unpaidInvoicesCount = invoices.filter((i) =>
    UNPAID_INVOICE.includes(i.status),
  ).length;

  const totalQuotes = devis.reduce((s, d) => s + d.totalTTC, 0);
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalTTC, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);

  const payments = invoices.flatMap((inv) =>
    inv.payments.map((p) => ({
      ...p,
      invoice: {
        id: inv.id,
        number: inv.number,
      },
    })),
  );

  payments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const dates = [
    client.updatedAt,
    ...projects.map((p) => p.updatedAt),
    ...devis.map((d) => d.updatedAt),
    ...invoices.map((i) => i.updatedAt),
    ...client.clientNotes.map((n) => n.updatedAt),
  ];
  const lastActivityAt = dates.reduce(
    (max, d) => (d > max ? d : max),
    client.updatedAt,
  );

  return {
    ...client,
    clientDocuments: (client.documents?.length
      ? client.documents.map((d) => ({
          id: d.id,
          clientId: d.clientId ?? client.id,
          name: d.name,
          url: d.url,
          mimeType: d.mimeType,
          size: d.size,
          docType: d.category,
          createdAt: d.createdAt,
        }))
      : client.clientDocuments) ?? [],
    projectsCount: projects.length,
    activeProjectsCount,
    quotesCount: devis.length,
    pendingQuotesCount,
    invoicesCount: invoices.length,
    unpaidInvoicesCount,
    totalQuotes,
    totalInvoiced,
    totalPaid,
    remainingAmount: Math.max(0, totalInvoiced - totalPaid),
    lastActivityAt,
    payments,
    financialSummary: {
      totalQuotes,
      totalInvoiced,
      totalPaid,
      remainingAmount: Math.max(0, totalInvoiced - totalPaid),
      unpaidInvoicesCount,
    },
  };
}
