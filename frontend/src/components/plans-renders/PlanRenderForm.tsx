"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  financeFieldClass,
  financeSelectClass,
  FinanceFieldLabel,
  FinanceFormSection,
} from "@/components/finances/finance-form-ui";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { PLAN_ACCEPT, RENDER_ACCEPT } from "@/lib/plans-renders-list";
import { glassBtnPrimary } from "@/lib/glass-styles";
import type { PlanRender, PlanRenderKind } from "@/types";
import { PLAN_CATEGORY_LABELS, RENDER_CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export type PlanRenderFormValues = {
  file: File | null;
  name: string;
  category: string;
  projectId: string;
  clientId: string;
  version: string;
  tags: string;
  description: string;
  isMainImage: boolean;
};

function emptyForm(kind: PlanRenderKind): PlanRenderFormValues {
  return {
    file: null,
    name: "",
    category: "AUTRE",
    projectId: "",
    clientId: "",
    version: "",
    tags: "",
    description: "",
    isMainImage: false,
  };
}

function toForm(asset: PlanRender): PlanRenderFormValues {
  return {
    file: null,
    name: asset.name,
    category: asset.category,
    projectId: asset.projectId ?? "",
    clientId: asset.clientId ?? "",
    version: asset.version ?? "",
    tags: (asset.tags ?? []).join(", "),
    description: asset.description ?? "",
    isMainImage: asset.isMainImage ?? false,
  };
}

interface PlanRenderFormProps {
  kind: PlanRenderKind;
  initial?: PlanRender | null;
  defaultProjectId?: string;
  onSubmit: (values: PlanRenderFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function PlanRenderForm({
  kind,
  initial,
  defaultProjectId,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: PlanRenderFormProps) {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<PlanRenderFormValues>(() => {
    if (initial) return toForm(initial);
    const form = emptyForm(kind);
    if (defaultProjectId) form.projectId = defaultProjectId;
    return form;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) setValues(toForm(initial));
    else {
      const form = emptyForm(kind);
      if (defaultProjectId) form.projectId = defaultProjectId;
      setValues(form);
    }
  }, [initial, kind, defaultProjectId]);

  const categories =
    kind === "PLAN"
      ? Object.entries(PLAN_CATEGORY_LABELS)
      : Object.entries(RENDER_CATEGORY_LABELS);

  const set = <K extends keyof PlanRenderFormValues>(key: K, val: PlanRenderFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "projectId" && val) {
        const project = projects.find((p) => p.id === val);
        if (project?.clientId) next.clientId = project.clientId;
      }
      if (key === "file" && val instanceof File && !prev.name) {
        next.name = val.name.replace(/\.[^.]+$/, "");
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initial && !values.file) {
      setError("Le fichier est obligatoire.");
      return;
    }
    if (!values.name.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }
    if (!values.category) {
      setError("Le type est obligatoire.");
      return;
    }
    setError(null);
    onSubmit(values);
  };

  const nameLabel = kind === "PLAN" ? "Nom du plan" : "Nom du rendu";
  const typeLabel = kind === "PLAN" ? "Type de plan" : "Type de rendu";

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/90">
          {error}
        </p>
      )}

      {!initial && (
        <FinanceFormSection title="Fichier">
          <div>
            <FinanceFieldLabel required>Fichier</FinanceFieldLabel>
            <input
              ref={fileRef}
              type="file"
              accept={kind === "PLAN" ? PLAN_ACCEPT : RENDER_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) set("file", f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed",
                "border-white/[0.12] bg-[color:var(--glass-bg)] px-4 py-6 text-center transition",
                "hover:border-studio-border/50 hover:bg-[color:var(--glass-bg-hover)]",
                values.file && "border-studio-border/40 bg-[color:var(--glass-bg-hover)]"
              )}
            >
              <Upload className="h-5 w-5 text-glass-muted" strokeWidth={1.5} />
              <span className="text-[13px] text-glass-muted">
                {values.file ? values.file.name : "Choisir un fichier…"}
              </span>
            </button>
          </div>
        </FinanceFormSection>
      )}

      <FinanceFormSection title="Informations">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FinanceFieldLabel required>{nameLabel}</FinanceFieldLabel>
            <input
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              className={financeFieldClass}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <FinanceFieldLabel required>{typeLabel}</FinanceFieldLabel>
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className={financeSelectClass}
              required
            >
              {categories.map(([value, label]) => (
                <option key={value} value={value} className="bg-[#101014]">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Lien">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Projet lié</FinanceFieldLabel>
            <select
              value={values.projectId}
              onChange={(e) => set("projectId", e.target.value)}
              className={cn(financeSelectClass, !values.projectId && "text-glass-muted")}
            >
              <option value="" className="bg-[#101014]">
                Aucun
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#101014]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FinanceFieldLabel>Client lié</FinanceFieldLabel>
            <select
              value={values.clientId}
              onChange={(e) => set("clientId", e.target.value)}
              className={cn(financeSelectClass, !values.clientId && "text-glass-muted")}
            >
              <option value="" className="bg-[#101014]">
                Aucun
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#101014]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Détails">
        {kind === "PLAN" && (
          <div>
            <FinanceFieldLabel>Version</FinanceFieldLabel>
            <input
              value={values.version}
              onChange={(e) => set("version", e.target.value)}
              placeholder="V1, APS V2…"
              className={financeFieldClass}
            />
          </div>
        )}

        <div>
          <FinanceFieldLabel>Tags</FinanceFieldLabel>
          <input
            value={values.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="rdc, façade…"
            className={financeFieldClass}
          />
        </div>

        <div>
          <FinanceFieldLabel>Description</FinanceFieldLabel>
          <textarea
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          />
        </div>

        {kind === "RENDER" && (
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-app bg-[color:var(--glass-bg)] px-3 py-2.5">
            <input
              type="checkbox"
              checked={values.isMainImage}
              onChange={(e) => set("isMainImage", e.target.checked)}
              disabled={!values.projectId}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-[color:var(--glass-bg-hover)] accent-studio-light disabled:opacity-40"
            />
            <span className="text-[12px] leading-snug text-glass-muted">
              Définir comme image principale du projet
              {!values.projectId && (
                <span className="mt-0.5 block text-[11px] text-glass-muted">
                  Sélectionnez un projet pour activer cette option.
                </span>
              )}
            </span>
          </label>
        )}
      </FinanceFormSection>

      <div className="flex justify-end border-t border-app pt-4">
        <button
          type="submit"
          disabled={loading}
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
