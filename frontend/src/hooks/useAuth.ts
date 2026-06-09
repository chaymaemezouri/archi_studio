"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, login, register, logout, setUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      toast.success("Connexion réussie");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Email ou mot de passe incorrect");
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
