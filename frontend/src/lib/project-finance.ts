import type { Payment, Project } from "@/types";

type ProjectFinanceFields = Pick<
  Project,
  "totalProjectAmount" | "contractArchitectFees" | "actualFeesToCollect" | "budget"
>;

/** Montant global du projet (fallback budget legacy). */
export function getProjectGlobalAmount(project: ProjectFinanceFields): number | null {
  const value = project.totalProjectAmount ?? project.budget;
  return value != null ? value : null;
}

/** Total encaissé lié au projet (paiements directs ou via facture). */
export function sumPaymentsForProject(
  projectId: string,
  payments: Array<{
    amount: number;
    projectId?: string | null;
    invoice?: { projectId?: string | null } | null;
  }>,
): number {
  return payments.reduce((sum, payment) => {
    const linkedProjectId =
      payment.projectId ?? payment.invoice?.projectId ?? null;
    if (linkedProjectId === projectId) {
      return sum + payment.amount;
    }
    return sum;
  }, 0);
}

/** Reste à encaisser = honoraires réels − total payé. */
export function getProjectRemainingToCollect(
  project: ProjectFinanceFields,
  totalPaid: number,
): number {
  const target = project.actualFeesToCollect;
  if (target == null || target <= 0) return 0;
  return Math.max(0, target - totalPaid);
}

export function sumRemainingToCollectAcrossProjects(
  projects: Project[],
  payments: Array<{
    amount: number;
    projectId?: string | null;
    invoice?: { projectId?: string | null } | null;
  }>,
): number {
  return projects.reduce((sum, project) => {
    const paid = sumPaymentsForProject(project.id, payments);
    return sum + getProjectRemainingToCollect(project, paid);
  }, 0);
}
