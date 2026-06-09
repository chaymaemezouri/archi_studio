import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ActivityLog } from "@/types";

export function useActivityLogs(params?: {
  projectId?: string;
  clientId?: string;
  entity?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["activity-logs", params],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.projectId) search.set("projectId", params.projectId);
      if (params?.clientId) search.set("clientId", params.clientId);
      if (params?.entity) search.set("entity", params.entity);
      if (params?.limit) search.set("limit", String(params.limit));
      const qs = search.toString();
      const { data } = await api.get<ActivityLog[]>(
        `/activity-logs${qs ? `?${qs}` : ""}`
      );
      return data;
    },
  });
}
