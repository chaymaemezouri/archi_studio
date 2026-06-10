export interface CinOcrResult {
  firstName?: string;
  lastName?: string;
  cinNumber?: string;
  cinValidUntil?: string;
  address?: string;
  rawText: string;
}

function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/[|]/g, 'I')
    .replace(/[°º]/g, '°')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDateToken(token: string): string | undefined {
  const m = token.match(/(\d{1,2})[./\-](\d{1,2})[./\-](\d{2,4})/);
  if (!m) return undefined;
  let [, d, mo, y] = m;
  let year = Number(y);
  if (year < 100) year += year >= 50 ? 1900 : 2000;
  const month = Number(mo);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractCinNumber(text: string): string | undefined {
  const patterns = [
    /\b(?:C\.?I\.?N\.?|N°?\s*CIN|CARTE\s+NATIONALE)\s*[:\-]?\s*([A-Z]{1,2}\s*\d{5,8})\b/i,
    /\b([A-Z]{1,2}\s*\d{5,8})\b/,
    /\b(\d{8,10})\b/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, '').toUpperCase();
    }
  }
  return undefined;
}

function extractValidityDate(text: string): string | undefined {
  const validityPatterns = [
    /valable\s+jusqu['']?au\s*[:\-]?\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
    /valid(?:e|ity)\s+(?:until|jusqu['']?au)\s*[:\-]?\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
    /date\s+d['']?expiration\s*[:\-]?\s*(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})/i,
  ];
  for (const pattern of validityPatterns) {
    const match = text.match(pattern);
    const parsed = match?.[1] ? parseDateToken(match[1]) : undefined;
    if (parsed) return parsed;
  }
  const dates = [...text.matchAll(/\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4}/g)]
    .map((m) => parseDateToken(m[0]))
    .filter(Boolean) as string[];
  return dates.at(-1);
}

function valueAfterLabel(
  lines: string[],
  labels: RegExp[],
): string | undefined {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    for (const label of labels) {
      const inline = line.match(label);
      if (inline?.[1]?.trim()) {
        return inline[1].trim();
      }
      if (label.test(line) && lines[i + 1]?.trim()) {
        return lines[i + 1].trim();
      }
    }
  }
  return undefined;
}

function cleanName(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value
    .replace(/[^A-Za-zÀ-ÿ'\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length < 2) return undefined;
  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function parseCinOcrText(rawText: string): CinOcrResult {
  const text = normalizeOcrText(rawText);
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const firstName = cleanName(
    valueAfterLabel(lines, [
      /pr[ée]nom\s*[:\-]?\s*(.+)$/i,
      /given\s+name\s*[:\-]?\s*(.+)$/i,
    ]),
  );
  const lastName = cleanName(
    valueAfterLabel(lines, [
      /nom\s*[:\-]?\s*(.+)$/i,
      /family\s+name\s*[:\-]?\s*(.+)$/i,
      /surname\s*[:\-]?\s*(.+)$/i,
    ]),
  );
  const address =
    valueAfterLabel(lines, [
      /adresse\s*[:\-]?\s*(.+)$/i,
      /address\s*[:\-]?\s*(.+)$/i,
    ]) ?? undefined;

  return {
    firstName,
    lastName,
    cinNumber: extractCinNumber(text),
    cinValidUntil: extractValidityDate(text),
    address,
    rawText: text,
  };
}
