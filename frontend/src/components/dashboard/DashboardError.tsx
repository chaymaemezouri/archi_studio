"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  onRetry: () => void;
  message?: string;
}

export default function DashboardError({
  onRetry,
  message = "Impossible de charger le dashboard. Vérifiez que le serveur backend est démarré.",
}: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-white px-8 py-16 text-center shadow-sm">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="text-lg font-semibold text-stone-900">Connexion impossible</h2>
      <p className="mt-2 max-w-md text-sm text-stone-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 rounded-xl bg-[#E07820] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#C96A10]"
      >
        <RefreshCw className="h-4 w-4" />
        Réessayer
      </button>
    </div>
  );
}
