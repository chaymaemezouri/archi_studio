import type { PdfBranding } from './pdf-branding';

export interface ArchitectContractParams {
  branding: PdfBranding;
  contractDate: Date;
  clientName: string;
  firstName?: string | null;
  lastName?: string | null;
  cinNumber?: string | null;
  cinValidUntil?: Date | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  projectName?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { dateStyle: 'long' });
}

function line(label: string, value?: string | null): string {
  if (!value?.trim()) {
    return `<tr><td class="lbl">${escapeHtml(label)}</td><td class="val">—</td></tr>`;
  }
  return `<tr><td class="lbl">${escapeHtml(label)}</td><td class="val">${escapeHtml(value.trim())}</td></tr>`;
}

export function buildArchitectContractHtml(params: ArchitectContractParams): string {
  const b = params.branding;
  const logoHtml = b.logoDataUri
    ? `<img src="${b.logoDataUri}" alt="" class="logo" />`
    : '';
  const fullAddress = [params.address, params.city, params.country]
    .filter(Boolean)
    .join(', ');
  const cabinetAddress = [b.cabinetAddress, b.cabinetCity, b.cabinetCountry]
    .filter(Boolean)
    .join(', ');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e2836; font-size: 11pt; line-height: 1.55; margin: 0; }
    .header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #8ba4c7; }
    .logo { max-height: 56px; max-width: 140px; object-fit: contain; margin-bottom: 8px; }
    .cabinet-name { font-size: 14pt; font-weight: 700; color: #1a2332; margin: 0 0 4px; }
    .muted { color: #64748b; font-size: 10pt; margin: 0; }
    h1 { font-size: 18pt; margin: 0 0 8px; color: #1a2332; }
    h2 { font-size: 12pt; margin: 24px 0 10px; color: #1a2332; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    p { margin: 0 0 10px; text-align: justify; }
    table.info { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
    table.info td { padding: 6px 8px; vertical-align: top; border-bottom: 1px solid #eef2f7; }
    table.info td.lbl { width: 34%; color: #64748b; font-size: 10pt; }
    table.info td.val { font-weight: 500; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; }
    .sign-box { border-top: 1px solid #cbd5e1; padding-top: 8px; min-height: 80px; }
    .sign-title { font-size: 10pt; color: #64748b; margin-bottom: 48px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${logoHtml}
      <p class="cabinet-name">${escapeHtml(b.cabinetName)}</p>
      ${cabinetAddress ? `<p class="muted">${escapeHtml(cabinetAddress)}</p>` : ''}
      ${b.cabinetPhone ? `<p class="muted">Tél. ${escapeHtml(b.cabinetPhone)}</p>` : ''}
      ${b.cabinetEmail ? `<p class="muted">${escapeHtml(b.cabinetEmail)}</p>` : ''}
    </div>
    <div style="text-align:right">
      <h1>Contrat d'architecte</h1>
      <p class="muted">Fait à ${escapeHtml(b.cabinetCity ?? '—')}, le ${formatDate(params.contractDate)}</p>
    </div>
  </div>

  <h2>Entre les soussignés</h2>
  <p><strong>Le cabinet d'architecture</strong> ${escapeHtml(b.cabinetName)}, ci-après dénommé « le Maître d'œuvre »,</p>
  <p><strong>Et</strong></p>
  <p><strong>${escapeHtml(params.clientName)}</strong>, ci-après dénommé « le Maître de l'ouvrage », domicilié(e) à ${escapeHtml(fullAddress || '—')}.</p>

  <h2>Identité du Maître de l'ouvrage</h2>
  <table class="info">
    ${line('Nom complet', params.clientName)}
    ${line('Prénom', params.firstName)}
    ${line('Nom', params.lastName)}
    ${line('N° CIN', params.cinNumber)}
    ${line('Validité CIN', params.cinValidUntil ? formatDate(params.cinValidUntil) : null)}
    ${line('Adresse', fullAddress || null)}
    ${line('Téléphone', params.phone)}
    ${line('Email', params.email)}
  </table>

  ${params.projectName ? `<h2>Objet du contrat</h2><p>Le présent contrat a pour objet la mission d'architecture relative au projet : <strong>${escapeHtml(params.projectName)}</strong>.</p>` : `<h2>Objet du contrat</h2><p>Le présent contrat a pour objet une mission d'architecture confiée par le Maître de l'ouvrage au Maître d'œuvre, conformément aux dispositions légales et réglementaires en vigueur au Maroc.</p>`}

  <h2>Dispositions générales</h2>
  <p>Le Maître d'œuvre s'engage à exercer sa mission avec compétence, diligence et conformément aux règles de l'art et à la réglementation applicable.</p>
  <p>Le Maître de l'ouvrage s'engage à fournir les informations nécessaires, à valider les études dans les délais convenus et à régler les honoraires selon les modalités arrêtées entre les parties.</p>
  <p>Les parties reconnaissent avoir pris connaissance des conditions générales du cabinet et acceptent les termes du présent contrat.</p>

  ${b.cgv ? `<h2>Conditions particulières</h2><p>${escapeHtml(b.cgv).replace(/\n/g, '<br/>')}</p>` : ''}

  <div class="signatures">
    <div>
      <p class="sign-title">Le Maître d'œuvre<br/>${escapeHtml(b.cabinetName)}</p>
      <div class="sign-box"></div>
    </div>
    <div>
      <p class="sign-title">Le Maître de l'ouvrage<br/>${escapeHtml(params.clientName)}</p>
      <div class="sign-box"></div>
    </div>
  </div>
</body>
</html>`;
}
