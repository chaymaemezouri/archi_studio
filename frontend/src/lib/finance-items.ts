type FinanceLineInput = {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  order?: number;
};

export function normalizeFinanceLineItems(items: FinanceLineInput[]) {
  const rows = items
    .map((item, order) => ({
      description: item.description?.trim() ?? "",
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
      order: item.order ?? order,
    }))
    .filter((item) => item.description.length > 0 || item.unitPrice > 0);

  if (rows.length === 0) {
    throw new Error("Ajoutez au moins une ligne de prestation.");
  }

  return rows;
}
