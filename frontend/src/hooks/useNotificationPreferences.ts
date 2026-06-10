"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { NotificationPreferences } from "@/lib/notification-preferences";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      const { data } = await api.get<NotificationPreferences>(
        "/notifications/preferences"
      );
      return data;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<NotificationPreferences>) => {
      const { data } = await api.patch<NotificationPreferences>(
        "/notifications/preferences",
        patch
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications", "preferences"], data);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
}
