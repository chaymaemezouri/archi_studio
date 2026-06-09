"use client";

import { useEffect } from "react";
import api from "@/lib/api";
import { normalizeUser } from "@/lib/assets";
import type { User } from "@/types";
import { useAuthStore } from "@/store/authStore";

interface StudioSettings {
  cabinetName?: string;
  cabinetLogo?: string | null;
}

/** Rafraîchit profil + logo cabinet depuis l'API (corrige le cache navigateur). */
export default function AuthHydrator() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const { data: profile } = await api.get<User>("/auth/me");
        if (!profile) return;

        let user = profile;
        try {
          const { data: settings } = await api.get<StudioSettings>("/settings");
          if (profile.studio) {
            user = {
              ...profile,
              studio: {
                ...profile.studio,
                name: settings.cabinetName ?? profile.studio.name,
                logoUrl: settings.cabinetLogo ?? profile.studio.logoUrl,
              },
            };
          }
        } catch {
          /* settings optionnel au premier chargement */
        }

        setUser(normalizeUser(user));
      } catch {
        /* session expirée gérée par l'intercepteur axios */
      }
    })();
  }, [token, setUser]);

  return null;
}
