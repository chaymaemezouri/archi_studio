import type { QueryClient } from "@tanstack/react-query";

/** Invalide toutes les listes liées aux devis, factures et tableaux financiers. */
export function invalidateFinanceQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["devis"] });
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  queryClient.invalidateQueries({ queryKey: ["clients"] });
  queryClient.invalidateQueries({ queryKey: ["projects"] });
  queryClient.invalidateQueries({ queryKey: ["payments"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
}
