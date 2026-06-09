export function nextDocumentNumber(
  prefix: string,
  lastNumber: string | null | undefined,
  style: 'default' | 'year' | 'invoice-ma' = 'year',
): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  if (style === 'invoice-ma') {
    let next = 1;
    const pattern = new RegExp(`^(\\d+)-${month}/${year}$`);
    if (lastNumber) {
      const match = lastNumber.match(pattern);
      if (match) next = parseInt(match[1], 10) + 1;
    }
    return `${String(next).padStart(3, '0')}-${month}/${year}`;
  }

  if (style === 'year') {
    let next = 1;
    const pattern = new RegExp(`^${prefix}-(\\d+)-${year}$`);
    if (lastNumber) {
      const match = lastNumber.match(pattern);
      if (match) next = parseInt(match[1], 10) + 1;
    }
    return `${prefix}-${String(next).padStart(3, '0')}-${year}`;
  }

  let next = 1;
  if (lastNumber) {
    const match = lastNumber.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(next).padStart(4, '0')}`;
}
