"use client";

import { FileDown, Loader2, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onAdd: () => void;
  onExportPdf: () => void;
  exporting: boolean;
  disabled?: boolean;
}

export default function DashboardHeader({
  onAdd,
  onExportPdf,
  exporting,
  disabled,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-light tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vue rapide de vos projets, tâches et prochaines deadlines
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExportPdf}
          disabled={disabled || exporting}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Export PDF
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </header>
  );
}
