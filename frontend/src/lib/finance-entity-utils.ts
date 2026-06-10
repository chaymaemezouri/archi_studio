export function getFinanceClientLabel(entity: {
  client?: { name: string } | null;
  clientName?: string | null;
}): string {
  return entity.client?.name ?? entity.clientName?.trim() ?? "—";
}

export function getFinanceProjectLabel(entity: {
  project?: { name: string } | null;
  projectName?: string | null;
}): string {
  return entity.project?.name ?? entity.projectName?.trim() ?? "—";
}

export const FINANCE_MANUAL_VALUE = "__manual__";
