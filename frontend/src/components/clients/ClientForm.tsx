"use client";

import { useEffect, useState } from "react";
import {
  financeFieldClass,
  financeSelectClass,
  FinanceFieldLabel,
  FinanceFormSection,
} from "@/components/finances/finance-form-ui";
import { glassBtnPrimary } from "@/lib/glass-styles";
import type { Client, ClientSource, ClientStatus, ClientType } from "@/types";
import {
  CLIENT_SOURCE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_TYPE_LABELS,
} from "@/types";
import { cn } from "@/lib/utils";

export type ClientFormValues = {
  type: ClientType;
  name: string;
  company: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  city: string;
  country: string;
  ice: string;
  taxId: string;
  rc: string;
  cnss: string;
  source: ClientSource | "";
  status: ClientStatus;
  notes: string;
};

export const emptyClientForm = (): ClientFormValues => ({
  type: "INDIVIDUAL",
  name: "",
  company: "",
  email: "",
  phone: "",
  secondaryPhone: "",
  address: "",
  city: "",
  country: "",
  ice: "",
  taxId: "",
  rc: "",
  cnss: "",
  source: "",
  status: "ACTIVE",
  notes: "",
});

export function clientToFormValues(client?: Client | null): ClientFormValues {
  if (!client) return emptyClientForm();
  return {
    type: (client.type as ClientType) || "INDIVIDUAL",
    name: client.name ?? "",
    company: client.company ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    secondaryPhone: client.secondaryPhone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    country: client.country ?? "",
    ice: client.ice ?? "",
    taxId: client.taxId ?? "",
    rc: client.rc ?? "",
    cnss: client.cnss ?? "",
    source: (client.source as ClientSource) ?? "",
    status: client.status ?? "ACTIVE",
    notes: client.notes ?? "",
  };
}

export function validateClientForm(values: ClientFormValues): string | null {
  if (!values.name.trim()) return "Le nom est obligatoire.";
  if (!values.phone.trim()) return "Le téléphone est obligatoire.";
  if (!values.type) return "Le type de client est obligatoire.";
  if (values.type === "COMPANY" && !values.company.trim()) {
    return "Le nom de l'entreprise est obligatoire pour une entreprise.";
  }
  if (values.email.trim()) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
    if (!ok) return "Email invalide.";
  }
  return null;
}

export function formValuesToPayload(values: ClientFormValues): Partial<Client> {
  return {
    type: values.type,
    name: values.name.trim(),
    company: values.company.trim() || undefined,
    email: values.email.trim() || undefined,
    phone: values.phone.trim(),
    secondaryPhone: values.secondaryPhone.trim() || undefined,
    address: values.address.trim() || undefined,
    city: values.city.trim() || undefined,
    country: values.country.trim() || undefined,
    ice: values.ice.trim() || undefined,
    taxId: values.taxId.trim() || undefined,
    rc: values.rc.trim() || undefined,
    cnss: values.cnss.trim() || undefined,
    source: values.source || undefined,
    status: values.status,
    notes: values.notes.trim() || undefined,
  };
}

interface ClientFormProps {
  initial?: Client | null;
  onSubmit: (payload: Partial<Client>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function ClientForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(() => clientToFormValues(initial));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(clientToFormValues(initial));
  }, [initial]);

  const set = <K extends keyof ClientFormValues>(key: K, val: ClientFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateClientForm(values);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit(formValuesToPayload(values));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/90">
          {error}
        </p>
      )}

      <FinanceFormSection title="Identité">
        <div>
          <FinanceFieldLabel required>Type de client</FinanceFieldLabel>
          <select
            className={financeSelectClass}
            value={values.type}
            onChange={(e) => set("type", e.target.value as ClientType)}
            required
          >
            {Object.entries(CLIENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-[#101014]">
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FinanceFieldLabel required>Nom complet</FinanceFieldLabel>
          <input
            className={financeFieldClass}
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>
        {values.type === "COMPANY" && (
          <div>
            <FinanceFieldLabel required>Entreprise</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={values.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </div>
        )}
      </FinanceFormSection>

      <FinanceFormSection title="Contact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Email</FinanceFieldLabel>
            <input
              type="email"
              className={financeFieldClass}
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <FinanceFieldLabel required>Téléphone</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <FinanceFieldLabel>Téléphone secondaire</FinanceFieldLabel>
          <input
            className={financeFieldClass}
            value={values.secondaryPhone}
            onChange={(e) => set("secondaryPhone", e.target.value)}
          />
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Adresse">
        <div>
          <FinanceFieldLabel>Adresse</FinanceFieldLabel>
          <input
            className={financeFieldClass}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Ville</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div>
            <FinanceFieldLabel>Pays</FinanceFieldLabel>
            <input
              className={financeFieldClass}
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </div>
        </div>
      </FinanceFormSection>

      <FinanceFormSection title="Administratif">
        <details className="group rounded-lg border border-app bg-[color:var(--glass-bg)]">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-[12px] text-glass-muted transition hover:text-glass-secondary [&::-webkit-details-marker]:hidden">
            <span className="group-open:text-glass-secondary">Informations administratives (optionnel)</span>
          </summary>
          <div className="grid grid-cols-1 gap-3 border-t border-app p-3 sm:grid-cols-2">
            <div>
              <FinanceFieldLabel>ICE</FinanceFieldLabel>
              <input className={financeFieldClass} value={values.ice} onChange={(e) => set("ice", e.target.value)} />
            </div>
            <div>
              <FinanceFieldLabel>IF / Identifiant fiscal</FinanceFieldLabel>
              <input className={financeFieldClass} value={values.taxId} onChange={(e) => set("taxId", e.target.value)} />
            </div>
            <div>
              <FinanceFieldLabel>RC</FinanceFieldLabel>
              <input className={financeFieldClass} value={values.rc} onChange={(e) => set("rc", e.target.value)} />
            </div>
            <div>
              <FinanceFieldLabel>CNSS</FinanceFieldLabel>
              <input className={financeFieldClass} value={values.cnss} onChange={(e) => set("cnss", e.target.value)} />
            </div>
          </div>
        </details>
      </FinanceFormSection>

      <FinanceFormSection title="Suivi">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <FinanceFieldLabel>Source</FinanceFieldLabel>
            <select
              className={cn(financeSelectClass, !values.source && "text-glass-muted")}
              value={values.source}
              onChange={(e) => set("source", e.target.value as ClientSource | "")}
            >
              <option value="" className="bg-[#101014]">
                —
              </option>
              {Object.entries(CLIENT_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#101014]">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FinanceFieldLabel>Statut</FinanceFieldLabel>
            <select
              className={financeSelectClass}
              value={values.status}
              onChange={(e) => set("status", e.target.value as ClientStatus)}
            >
              {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#101014]">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <FinanceFieldLabel>Notes internes</FinanceFieldLabel>
          <textarea
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={cn(financeFieldClass, "min-h-[72px] resize-y")}
          />
        </div>
      </FinanceFormSection>

      <div className="flex justify-end border-t border-app pt-4">
        <button
          type="submit"
          disabled={loading || !values.name.trim() || !values.phone.trim()}
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
