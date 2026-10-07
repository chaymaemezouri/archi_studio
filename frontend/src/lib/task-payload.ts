import type { Priority, Task, TaskStatus } from "@/types";

/** Corps API create/update tâche — sans champs null/undefined interdits. */
export type TaskApiPayload = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  /** string = couleur ; null = effacer */
  color?: string | null;
  sortOrder?: number;
  dueDate?: string;
  scheduledAt?: string;
  projectId?: string;
  clientId?: string;
  notes?: string;
};

export function toTaskApiPayload(
  input: Partial<Task> & { color?: string | null }
): TaskApiPayload {
  const out: TaskApiPayload = {};

  if (input.title !== undefined) out.title = input.title;
  if (input.description) out.description = input.description;
  if (input.status !== undefined) out.status = input.status;
  if (input.priority !== undefined) out.priority = input.priority;
  if ("color" in input) out.color = input.color ?? null;
  if (input.sortOrder !== undefined) out.sortOrder = input.sortOrder;
  if (input.dueDate) out.dueDate = input.dueDate.split("T")[0];
  if (input.scheduledAt) {
    // ISO complet ou date seule — le backend accepte les deux via IsDateString
    out.scheduledAt = input.scheduledAt.includes("T")
      ? new Date(input.scheduledAt).toISOString()
      : input.scheduledAt.split("T")[0];
  }
  if (input.projectId) out.projectId = input.projectId;
  if (input.clientId) out.clientId = input.clientId;
  if (input.notes) out.notes = input.notes;

  return out;
}
