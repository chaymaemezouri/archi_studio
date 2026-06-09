"use client";



import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

import type { Notification } from "@/types";



export interface UnreadSummary {

  count: number;

  urgentCount: number;

}



export function useNotifications() {

  return useQuery({

    queryKey: ["notifications"],

    queryFn: async () => {

      const { data } = await api.get<Notification[]>("/notifications");

      return data;

    },

    refetchInterval: 60_000,

  });

}



export function useUnreadCount() {

  return useQuery({

    queryKey: ["notifications", "unread-count"],

    queryFn: async () => {

      const { data } = await api.get<UnreadSummary>("/notifications/unread-count");

      return data;

    },

    refetchInterval: 60_000,

  });

}



export function useSyncNotifications() {

  const queryClient = useQueryClient();



  return useMutation({

    mutationFn: async () => {

      await api.post("/notifications/sync");

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

    },

  });

}



export function useMarkAsRead() {

  const queryClient = useQueryClient();



  return useMutation({

    mutationFn: async (id: string) => {

      await api.patch(`/notifications/${id}/read`);

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

    },

  });

}



export function useMarkAllAsRead() {

  const queryClient = useQueryClient();



  return useMutation({

    mutationFn: async () => {

      await api.patch("/notifications/read-all");

    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });

    },

  });

}


