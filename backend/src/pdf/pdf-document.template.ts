import type { PdfBranding } from './pdf-branding';

export type PdfDocumentKind = 'devis' | 'invoice' | 'receipt';

export interface PdfLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PdfDocumentParams {
  kind: PdfDocumentKind;
  branding: PdfBranding;
  documentTitle: string;
  numberLabel: string;
  number: string;
  date: Date;
  clientName?: string;
  object?: string | null;
  paymentMethod?: string | null;
  bankTransferBy?: string | null;
  items: PdfLineItem[];
  totalHT: number;
  totalTTC: number;
  tva: number;
  paymentTerms?: string | null;
  notes?: string | null;
  amountInWords?: string;
  receiptAmount?: number;
  receiptReference?: string | null;
  linkedInvoiceNumber?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Montant affiché dans les tableaux (comme les modèles Maouni). */
function formatAmount(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function labelLine(label: string, value?: string | null): string {
  if (!value?.trim()) {
    return `<p class="meta-line"><span class="lbl">${escapeHtml(label)}</span></p>`;
  }
  return `<p class="meta-line"><span class="lbl">${escapeHtml(label)}</span> <span class="val">${escapeHtml(value.trim())}</span></p>`;
}

const STYLES = `
  @page { size: A4; margin: 18mm 20mm 20mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    color: #000;
    background: #fff;
    margin: 0;
    line-height: 1.35;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .cabinet-block { flex: 1; min-width: 0; }
  .cabinet-name {
    font-weight: 700;
    font-size: 11pt;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .cabinet-line { margin: 0; font-size: 10pt; }
  .logo-box {
    width: 110px;
    height: 95px;
    border: 1px solid #000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 6px;
  }
  .logo-box img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .rule {
    border: none;
    border-top: 2px solid #000;
    margin: 14px 0 12px;
  }
  .date-line {
    text-align: right;
    font-size: 11pt;
    margin: 0 0 14px;
  }
  .doc-title {
    font-weight: 700;
    text-decoration: underline;
    text-transform: uppercase;
    font-size: 12pt;
    margin: 0 0 8px;
  }
  .doc-title.center { text-align: center; }
  .doc-number {
    font-weight: 700;
    margin: 0 0 14px;
    font-size: 11pt;
  }
  .meta-line { margin: 0 0 6px; font-size: 11pt; }
  .meta-line .lbl { font-weight: 700; text-decoration: underline; }
  .meta-line .val { font-weight: 400; text-decoration: underline; }
  table.main {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  table.main th,
  table.main td {
    border: 1px solid #000;
    padding: 8px 10px;
    vertical-align: top;
    font-size: 10.5pt;
  }
  table.main th {
    font-weight: 700;
    text-align: left;
  }
  table.main th.amount,
  table.main td.amount {
    width: 28%;
    text-align: right;
    white-space: nowrap;
  }
  table.main td.desc { white-space: pre-line; }
  .totals-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 0;
  }
  table.totals {
    border-collapse: collapse;
    margin-top: -1px;
    min-width: 240px;
  }
  table.totals td {
    border: 1px solid #000;
    padding: 6px 10px;
    font-size: 10.5pt;
  }
  table.totals td:first-child { font-weight: 700; }
  table.totals td:last-child {
    text-align: right;
    font-weight: 700;
    white-space: nowrap;
  }
  .words {
    margin-top: 18px;
    font-size: 11pt;
  }
  .words .arrow { margin-right: 4px; }
  .terms {
    margin-top: 14px;
    font-size: 11pt;
    white-space: pre-wrap;
  }
  .terms .lbl { font-weight: 700; text-decoration: underline; }
  .legal {
    margin-top: 24px;
    font-size: 8.5pt;
    color: #333;
    text-align: center;
  }
`;

function buildHeader(branding: PdfBranding): string {
  const b = branding;
  const logo = b.logoDataUri
    ? `<div class="logo-box"><img src="${b.logoDataUri}" alt="" /></div>`
    : `<div class="logo-box"></div>`;

  const contact = [
    b.cabinetPhone ? `GSM : ${escapeHtml(b.cabinetPhone)}` : '',
    b.cabinetEmail ? `Email : ${escapeHtml(b.cabinetEmail)}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
  <div class="header">
    <div class="cabinet-block">
      <p class="cabinet-name">${escapeHtml(b.cabinetName)}</p>
      ${b.cabinetAddress ? `<p class="cabinet-line">${escapeHtml(b.cabinetAddress)}</p>` : ''}
      ${contact ? `<p class="cabinet-line">${contact}</p>` : ''}
    </div>
    ${logo}
  </div>
  <hr class="rule" />`;
}

function buildItemsTable(items: PdfLineItem[]): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td class="desc">${escapeHtml(item.description)}</td>
      <td class="amount">${formatAmount(item.total)}</td>
    </tr>`,
    )
    .join('');

  return `
  <table class="main">
    <thead>
      <tr>
        <th>Désignations</th>
        <th class="amount">Montant H.T</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function buildTotalsTable(totalHT: number, tva: number, totalTTC: number): string {
  const tvaAmount = Math.round((totalTTC - totalHT) * 100) / 100;
  return `
  <div class="totals-wrap">
    <table class="totals">
      <tr><td>TOTAL H. T</td><td>${formatAmount(totalHT)}</td></tr>
      <tr><td>T.V.A à ${tva} %</td><td>${formatAmount(tvaAmount)}</td></tr>
      <tr><td>TOTAL T.T.C</td><td>${formatAmount(totalTTC)}</td></tr>
    </table>
  </div>`;
}

function wordsPhrase(kind: PdfDocumentKind): string {
  if (kind === 'devis') return 'Arrêter le présent devis à la somme de :';
  if (kind === 'receipt') return 'Arrêter le présent reçu à la somme de :';
  return 'Arrêter la présente facture à la somme de :';
}

export function buildProfessionalDocumentHtml(params: PdfDocumentParams): string {
  const b = params.branding;
  const city = b.cabinetCity ?? 'Marrakech';
  const dateLine = `${escapeHtml(city)} le ${formatDateShort(params.date)}`;

  const isDevis = params.kind === 'devis';
  const isReceipt = params.kind === 'receipt';
  const isInvoice = params.kind === 'invoice';

  const titleClass = isDevis ? 'doc-title center' : 'doc-title';
  const displayTitle = isInvoice
    ? "NOTE D'HONORAIRES"
    : isReceipt
      ? 'RECU DE PAIEMENT'
      : 'Devis';

  let metaBlock = '';
  if (isDevis) {
    metaBlock = `
      ${labelLine('Architecte :', b.cabinetName)}
      ${labelLine('Objet :', params.object)}
      ${labelLine('Client :', params.clientName)}
    `;
  } else if (isReceipt) {
    metaBlock = `
      ${labelLine('Client :', params.clientName)}
      ${params.linkedInvoiceNumber ? labelLine('Facture n° :', params.linkedInvoiceNumber) : ''}
      ${labelLine('Mode de paiement :', params.paymentMethod)}
      ${params.receiptReference ? labelLine('Référence :', params.receiptReference) : ''}
    `;
  } else {
    metaBlock = `
      ${labelLine('Objet :', params.object)}
      ${labelLine('Client :', params.clientName)}
      ${labelLine('Mode de paiement :', params.paymentMethod)}
      ${labelLine('Virement émis par :', params.bankTransferBy)}
    `;
  }

  const numberLine =
    params.number && !isDevis
      ? `<p class="doc-number">${escapeHtml(params.numberLabel)} ${escapeHtml(params.number)}</p>`
      : isDevis && params.number
        ? `<p class="doc-number">${escapeHtml(params.numberLabel)} ${escapeHtml(params.number)}</p>`
        : '';

  let bodyContent = '';
  if (isReceipt) {
    const amount = params.receiptAmount ?? params.totalTTC;
    bodyContent = `
      ${metaBlock}
      <table class="main">
        <thead>
          <tr>
            <th>Désignations</th>
            <th class="amount">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="desc">Paiement reçu${params.linkedInvoiceNumber ? ` — Facture ${escapeHtml(params.linkedInvoiceNumber)}` : ''}</td>
            <td class="amount">${formatAmount(amount)}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals-wrap">
        <table class="totals">
          <tr><td>MONTANT REÇU</td><td>${formatAmount(amount)}</td></tr>
        </table>
      </div>
    `;
  } else {
    bodyContent = `
      ${metaBlock}
      ${buildItemsTable(params.items)}
      ${buildTotalsTable(params.totalHT, params.tva, params.totalTTC)}
    `;
  }

  const wordsBlock = params.amountInWords
    ? `<p class="words"><span class="arrow">➤</span> ${wordsPhrase(params.kind)} <strong>${escapeHtml(params.amountInWords)}</strong></p>`
    : '';

  const termsBlock =
    isDevis && params.paymentTerms?.trim()
      ? `<div class="terms"><span class="lbl">Modalité de paiement :</span>\n${escapeHtml(params.paymentTerms.trim())}</div>`
      : !isReceipt && !isDevis && params.paymentTerms?.trim()
        ? `<div class="terms"><span class="lbl">Modalité de paiement :</span>\n${escapeHtml(params.paymentTerms.trim())}</div>`
        : '';

  const notesBlock =
    params.notes?.trim() && !params.paymentTerms?.trim()
      ? `<p class="terms">${escapeHtml(params.notes.trim())}</p>`
      : '';

  const legalParts = [
    b.cabinetIce ? `ICE : ${escapeHtml(b.cabinetIce)}` : '',
    b.cabinetRc ? `RC : ${escapeHtml(b.cabinetRc)}` : '',
    b.bankName && b.bankRib
      ? `${escapeHtml(b.bankName)} — RIB ${escapeHtml(b.bankRib)}`
      : b.bankRib
        ? `RIB ${escapeHtml(b.bankRib)}`
        : '',
    b.invoiceFooter?.trim() ? escapeHtml(b.invoiceFooter.trim()) : '',
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>${STYLES}</style>
</head>
<body>
  ${buildHeader(b)}
  <p class="date-line">${dateLine}</p>
  <h1 class="${titleClass}">${displayTitle}</h1>
  ${numberLine}
  ${bodyContent}
  ${wordsBlock}
  ${termsBlock}
  ${notesBlock}
  ${legalParts.length ? `<p class="legal">${legalParts.join(' · ')}</p>` : ''}
</body>
</html>`;
}
