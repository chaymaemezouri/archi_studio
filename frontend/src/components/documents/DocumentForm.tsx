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
import { ACCEPTED_DOCUMENT_EXTENSIONS } from "@/lib/documents-list";
import { glassBtnPrimary } from "@/lib/glass-styles";
import type { Document, DocumentCategory } from "@/types";
import { DOCUMENT_CATEGORY_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export type DocumentFormValues = {
  file: File | null;
  name: string;
  category: DocumentCategory | string;
  projectId: string;
  clientId: string;
  tags: string;
  description: string;
};

function emptyForm(): DocumentFormValues {
  return {
    file: null,
    name: "",
    category: "OTHER",
    projectId: "",
    clientId: "",
    tags: "",
    description: "",
  };
}

function docToForm(doc: Document): DocumentFormValues {
  return {
    file: null,
    name: doc.name,
    category: doc.category,
    projectId: doc.projectId ?? "",
    clientId: doc.clientId ?? "",
    tags: (doc.tags ?? []).join(", "),
    description: doc.description ?? "",
  };
}

interface DocumentFormProps {
  initial?: Document | null;
  defaultProjectId?: string;
  defaultClientId?: string;
  onSubmit: (values: DocumentFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function DocumentForm({
  initial,
  defaultProjectId,
  defaultClientId,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: DocumentFormProps) {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<DocumentFormValues>(() => {
    if (initial) return docToForm(initial);
    const form = emptyForm();
    if (defaultProjectId) form.projectId = defaultProjectId;
    if (defaultClientId) form.clientId = defaultClientId;
    return form;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setValues(docToForm(initial));
    } else {
      const form = emptyForm();
      if (defaultProjectId) form.projectId = defaultProjectId;
      if (defaultClientId) form.clientId = defaultClientId;
      setValues(form);
    }
  }, [initial, defaultProjectId, defaultClientId]);

  const set = <K extends keyof DocumentFormValues>(key: K, val: DocumentFormValues[K]) => {
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
      setError("Le nom du document est obligatoire.");
      return;
    }
    setError(null);
    onSubmit(values);
  };

  const categoryOptions = Object.entries(DOCUMENT_CATEGORY_LABELS);

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
              accept={ACCEPTED_DOCUMENT_EXTENSIONS}
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
        <div>
          <FinanceFieldLabel required>Nom du document</FinanceFieldLabel>
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className={financeFieldClass}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Catégorie</FinanceFieldLabel>
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className={financeSelectClass}
            >
              {categoryOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FinanceFieldLabel>Tags</FinanceFieldLabel>
            <input
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="contrat, villa…"
              className={financeFieldClass}
            />
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
              <option value="">
                Aucun
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
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
              <option value="">
                Aucun
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Détails">
        <div>
          <FinanceFieldLabel>Description</FinanceFieldLabel>
          <textarea
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          />
        </div>
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
