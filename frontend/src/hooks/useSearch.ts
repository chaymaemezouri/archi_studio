"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { SearchResults } from "@/types";

export function useGlobalSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ["search", q],
    queryFn: async () => {
      const { data } = await api.get<SearchResults>("/search", { params: { q } });
      return {
        projects: data.projects ?? [],
        clients: data.clients ?? [],
        documents: data.documents ?? [],
        tasks: data.tasks ?? [],
        finances: data.finances ?? [],
      };
    },
    enabled: q.length >= 2,
    staleTime: 30_000,
  });
}
