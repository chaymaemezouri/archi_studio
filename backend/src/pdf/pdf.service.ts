import { Injectable, NotFoundException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { amountToFrenchWords } from '../common/utils/amount-words.util';
import { ClientsService } from '../clients/clients.service';
import { DevisService } from '../devis/devis.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentsService } from '../payments/payments.service';
import { SettingsService } from '../settings/settings.service';
import { UploadsService } from '../uploads/uploads.service';
import { buildArchitectContractHtml } from './pdf-architect-contract.template';
import { settingsToPdfBranding } from './pdf-branding';
import { buildProfessionalDocumentHtml } from './pdf-document.template';

@Injectable()
export class PdfService {
  constructor(
    private clientsService: ClientsService,
    private devisService: DevisService,
    private invoicesService: InvoicesService,
    private paymentsService: PaymentsService,
    private settingsService: SettingsService,
    private uploadsService: UploadsService,
  ) {}

  private async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load', timeout: 30_000 });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '18mm', right: '18mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private formatMad(value: number): string {
    return (
      new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + ' MAD'
    );
  }

  private async settingsForDocument(
    client?: { studioId: string } | null,
    project?: { studioId: string } | null,
    studioId?: string | null,
  ) {
    const resolvedStudioId = client?.studioId ?? project?.studioId ?? studioId;
    if (!resolvedStudioId) {
      throw new NotFoundException('Studio not found for document');
    }
    const settings = await this.settingsService.get(resolvedStudioId);
    return settingsToPdfBranding(settings, this.uploadsService);
  }

  private paymentMethodLabel(method?: string | null): string | null {
    if (!method) return null;
    const labels: Record<string, string> = {
      VIREMENT: 'Virement bancaire',
      CHEQUE: 'Chèque',
      ESPECES: 'Espèces',
      CARTE: 'Carte bancaire',
      AUTRE: 'Autre',
    };
    return labels[method] ?? method;
  }

  async generateDevisPdf(id: string): Promise<Buffer> {
    const devis = await this.devisService.findOne(id);
    const branding = await this.settingsForDocument(devis.client, devis.project, devis.studioId);
    const html = buildProfessionalDocumentHtml({
      kind: 'devis',
      branding,
      documentTitle: 'Devis',
      numberLabel: 'Devis n°',
      number: devis.number,
      date: devis.createdAt,
      clientName: devis.clientName ?? devis.client?.name ?? undefined,
      object: devis.object ?? devis.projectName ?? devis.project?.name ?? null,
      items: devis.items,
      totalHT: devis.totalHT,
      totalTTC: devis.totalTTC,
      tva: devis.tva,
      paymentTerms: devis.paymentTerms,
      notes: devis.notes,
      amountInWords: amountToFrenchWords(devis.totalTTC),
    });
    return this.renderPdf(html);
  }

  async generateInvoicePdf(id: string): Promise<Buffer> {
    const invoice = await this.invoicesService.findOne(id);
    const branding = await this.settingsForDocument(
      invoice.client,
      invoice.project,
      invoice.studioId,
    );
    const html = buildProfessionalDocumentHtml({
      kind: 'invoice',
      branding,
      documentTitle: "NOTE D'HONORAIRES",
      numberLabel: 'Facture n°',
      number: invoice.number,
      date: invoice.issueDate,
      clientName: invoice.clientName ?? invoice.client?.name ?? undefined,
      object: invoice.object ?? invoice.projectName ?? invoice.project?.name ?? null,
      paymentMethod: this.paymentMethodLabel(invoice.paymentMethod),
      bankTransferBy: invoice.bankTransferBy,
      items: invoice.items,
      totalHT: invoice.totalHT,
      totalTTC: invoice.totalTTC,
      tva: invoice.tva,
      notes: invoice.notes,
      amountInWords: amountToFrenchWords(invoice.totalTTC),
    });
    return this.renderPdf(html);
  }

  async generatePaymentReceiptPdf(id: string): Promise<Buffer> {
    const payment = await this.paymentsService.findOne(id);
    const studioId =
      payment.client?.studioId ??
      payment.project?.studioId ??
      payment.invoice?.client?.studioId ??
      payment.invoice?.project?.studioId;
    if (!studioId) {
      throw new NotFoundException('Studio not found for payment receipt');
    }
    const settings = await this.settingsService.get(studioId);
    const branding = settingsToPdfBranding(settings, this.uploadsService);

    const receiptNumber = `REC-${payment.date.toISOString().slice(0, 10).replace(/-/g, '')}-${payment.id.slice(-6).toUpperCase()}`;

    const html = buildProfessionalDocumentHtml({
      kind: 'receipt',
      branding,
      documentTitle: 'RECU DE PAIEMENT',
      numberLabel: 'Reçu n°',
      number: receiptNumber,
      date: payment.date,
      clientName:
        payment.client?.name ?? payment.invoice?.client?.name ?? undefined,
      paymentMethod: this.paymentMethodLabel(payment.method),
      linkedInvoiceNumber: payment.invoice?.number ?? null,
      receiptReference: payment.reference,
      receiptAmount: payment.amount,
      items: [],
      totalHT: payment.amount,
      totalTTC: payment.amount,
      tva: 0,
      notes: payment.notes,
      amountInWords: amountToFrenchWords(payment.amount),
    });
    return this.renderPdf(html);
  }

  async generateArchitectContractPdf(
    clientId: string,
    studioId: string,
    projectId?: string,
  ): Promise<Buffer> {
    const client = await this.clientsService.findOne(clientId, studioId);
    const branding = await this.settingsForDocument(client);
    let projectName: string | null = null;
    if (projectId) {
      const project = client.projects?.find((p) => p.id === projectId);
      projectName = project?.name ?? null;
    }
    const html = buildArchitectContractHtml({
      branding,
      contractDate: new Date(),
      clientName: client.name,
      firstName: client.firstName,
      lastName: client.lastName,
      cinNumber: client.cinNumber,
      cinValidUntil: client.cinValidUntil,
      address: client.address,
      city: client.city,
      country: client.country,
      phone: client.phone,
      email: client.email,
      projectName,
    });
    return this.renderPdf(html);
  }

  async generateWeeklySummaryPdf(
    cabinetName: string,
    overview: {
      stats: Record<string, unknown>;
      projectsInProgress: { name: string; phase: unknown; progress: number }[];
      upcomingDeadlines: { title: string; date: Date | string; project?: { name: string } | null }[];
      todayTasks: { title: string; status: string }[];
      recentPayments: { amount: number; date: Date | string }[];
    },
    branding?: ReturnType<typeof settingsToPdfBranding>,
  ): Promise<Buffer> {
    const b = branding;
    const logoHtml = b?.logoDataUri
      ? `<img src="${b.logoDataUri}" alt="" style="max-height:48px;max-width:120px;object-fit:contain;margin-bottom:8px" />`
      : '';
    const s = overview.stats;
    const projects = overview.projectsInProgress
      .map(
        (p) =>
          `<li><strong>${p.name}</strong> — ${p.phase} (${p.progress}%)</li>`,
      )
      .join('');
    const deadlines = overview.upcomingDeadlines
      .slice(0, 10)
      .map(
        (d) =>
          `<li>${d.title}${d.project?.name ? ` (${d.project.name})` : ''} — ${new Date(d.date).toLocaleDateString('fr-FR')}</li>`,
      )
      .join('');
    const tasks = overview.todayTasks
      .slice(0, 10)
      .map((t) => `<li>${t.title} [${t.status}]</li>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e2836; font-size: 11pt; line-height: 1.5; margin: 0; }
    .header { padding: 16px 20px; background: linear-gradient(135deg, #1a2332, #2a3548); color: #fff; border-radius: 8px; margin-bottom: 20px; }
    h1 { font-size: 18pt; margin: 8px 0 0; color: #fff; }
    h2 { font-size: 12pt; margin-top: 20px; border-bottom: 2px solid #8ba4c7; padding-bottom: 4px; color: #1a2332; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0; }
    .stat { background: #f1f5f9; padding: 12px; border-radius: 6px; border-left: 3px solid #8ba4c7; }
    .stat strong { font-size: 16pt; display: block; color: #1a2332; }
    ul { padding-left: 18px; }
  </style>
</head>
<body>
  <div class="header">
    ${logoHtml}
    <h1>Résumé hebdomadaire — ${cabinetName}</h1>
    <p style="margin:6px 0 0;font-size:10pt;opacity:0.85">Généré le ${new Date().toLocaleDateString('fr-FR', { dateStyle: 'full' })}</p>
  </div>
  <div class="stats">
    <div class="stat"><span>Projets actifs</span><strong>${s.activeProjects ?? 0}</strong></div>
    <div class="stat"><span>Deadlines (7j)</span><strong>${s.upcomingDeadlines ?? 0}</strong></div>
    <div class="stat"><span>Devis en cours</span><strong>${s.pendingDevis ?? 0}</strong></div>
    <div class="stat"><span>Factures impayées</span><strong>${s.pendingInvoices ?? 0}</strong></div>
    <div class="stat"><span>Montant impayé</span><strong>${this.formatMad(Number(s.unpaidInvoicesAmount ?? 0))}</strong></div>
    <div class="stat"><span>Paiements</span><strong>${s.paymentsCount ?? 0}</strong></div>
  </div>
  <h2>Projets en cours</h2>
  <ul>${projects || '<li>Aucun</li>'}</ul>
  <h2>Deadlines à venir</h2>
  <ul>${deadlines || '<li>Aucune</li>'}</ul>
  <h2>Tâches du jour</h2>
  <ul>${tasks || '<li>Aucune</li>'}</ul>
</body>
</html>`;
    return this.renderPdf(html);
  }
}
