import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { normalizeUser } from "@/lib/assets";
import { clearAuthToken, login as apiLogin, register as apiRegister } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    inviteCode: string;
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiLogin({ email, password });
        set({
          user: normalizeUser(response.user),
          token: response.access_token ?? response.accessToken ?? null,
          isAuthenticated: true,
        });
      },

      register: async (data) => {
        const response = await apiRegister(data);
        set({
          user: normalizeUser(response.user),
          token: response.access_token ?? response.accessToken ?? null,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearAuthToken();
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) =>
        set({ user: user ? normalizeUser(user) : null, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
