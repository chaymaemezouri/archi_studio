"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useAuthStore } from "@/store/authStore";

function isDemoAccountExpired(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const data = error.response?.data as
    | { error?: string; message?: string | string[] }
    | undefined;
  if (data?.error === "DEMO_ACCOUNT_EXPIRED") return true;
  const message = Array.isArray(data?.message)
    ? data.message.join(" ")
    : data?.message;
  return (
    typeof message === "string" &&
    (message.includes("DEMO_ACCOUNT_EXPIRED") ||
      message.toLowerCase().includes("compte démo a expiré") ||
      message.toLowerCase().includes("compte demo a expire"))
  );
}

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, login, register, logout, setUser } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success("Connexion réussie");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (isDemoAccountExpired(error)) {
        toast.error("Ce compte démo a expiré");
        return;
      }
      toast.error(
        getApiErrorMessage(error, "Email ou mot de passe incorrect"),
      );
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      inviteCode: string;
      name: string;
      email: string;
      password: string;
    }) => register(data),
    onSuccess: () => {
      toast.success("Compte créé avec succès");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        toast.error("Cet email est déjà utilisé — connectez-vous");
        return;
      }
      if (isDemoAccountExpired(error)) {
        toast.error("Ce compte démo a expiré");
        return;
      }
      toast.error("Erreur lors de l'inscription");
    },
  });

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("Déconnexion réussie");
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    setUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
