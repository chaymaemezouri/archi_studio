"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { resolveMediaUrl, resolvePublicAssetUrl } from "@/lib/assets";
import { useAuthStore } from "@/store/authStore";
import type { Studio } from "@/types";

interface StudioSettings {
  cabinetName?: string;
  cabinetLogo?: string | null;
}

/** Studio courant avec logo/nom issus des paramètres (source de vérité). */
export function useStudio(): Studio | null {
  const user = useAuthStore((s) => s.user);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await api.get<StudioSettings>("/settings");
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    if (!user?.studio) return null;

    const rawLogo = settings?.cabinetLogo ?? user.studio.logoUrl;
    const logoUrl =
      resolveMediaUrl(rawLogo) ?? resolvePublicAssetUrl(rawLogo);

    return {
      ...user.studio,
      name: settings?.cabinetName ?? user.studio.name,
      logoUrl: logoUrl ?? null,
    };
  }, [user?.studio, settings]);
}
