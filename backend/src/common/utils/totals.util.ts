export interface LineItemInput {
  quantity?: number;
  unitPrice: number;
}

export function lineTotal(item: LineItemInput): number {
  const qty = item.quantity ?? 1;
  return Math.round(qty * item.unitPrice * 100) / 100;
}

export function computeTotals(
  items: LineItemInput[],
  tva: number,
): { totalHT: number; totalTTC: number } {
  const totalHT =
    Math.round(items.reduce((sum, item) => sum + lineTotal(item), 0) * 100) /
    100;
  const totalTTC = Math.round(totalHT * (1 + tva / 100) * 100) / 100;
  return { totalHT, totalTTC };
}
