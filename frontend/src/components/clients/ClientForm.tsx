"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  financeFieldClass,
  financeSelectClass,
  FinanceFieldLabel,
  FinanceFormSection,
} from "@/components/finances/finance-form-ui";
import type { ClientCinUploads } from "@/lib/client-cin";
import { resolveMediaUrl } from "@/lib/assets";
import { glassBtnPrimary, glassBtnSecondary } from "@/lib/glass-styles";
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
  firstName: string;
  lastName: string;
  cinNumber: string;
  cinValidUntil: string;
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
  firstName: "",
  lastName: "",
  cinNumber: "",
  cinValidUntil: "",
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
  const cinValidUntil = client.cinValidUntil
    ? client.cinValidUntil.slice(0, 10)
    : "";
  return {
    type: (client.type as ClientType) || "INDIVIDUAL",
    name: client.name ?? "",
    firstName: client.firstName ?? "",
    lastName: client.lastName ?? "",
    cinNumber: client.cinNumber ?? "",
    cinValidUntil,
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
  const composedName = [values.firstName.trim(), values.lastName.trim()]
    .filter(Boolean)
    .join(" ");
  if (!values.name.trim() && !composedName) {
    return "Le nom ou prénom/nom est obligatoire.";
  }
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
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const composedName = [firstName, lastName].filter(Boolean).join(" ");
  const name = values.name.trim() || composedName;
  return {
    type: values.type,
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    cinNumber: values.cinNumber.trim() || undefined,
    cinValidUntil: values.cinValidUntil.trim() || undefined,
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
  onSubmit: (payload: Partial<Client>, cinUploads?: ClientCinUploads) => void | Promise<void>;
  loading?: boolean;
  submitLabel?: string;
}

type CinFace = "front" | "back";

const EMPTY_CIN_UPLOADS: ClientCinUploads = { front: null, back: null };

export default function ClientForm({
  initial,
  onSubmit,
  loading,
  submitLabel = "Enregistrer",
}: ClientFormProps) {
  const [values, setValues] = useState<ClientFormValues>(() => clientToFormValues(initial));
  const [error, setError] = useState<string | null>(null);
  const [cinUploads, setCinUploads] = useState<ClientCinUploads>(EMPTY_CIN_UPLOADS);
  const [cinPreviews, setCinPreviews] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(clientToFormValues(initial));
    setCinUploads(EMPTY_CIN_UPLOADS);
    setCinPreviews({ front: null, back: null });
  }, [initial]);

  const set = <K extends keyof ClientFormValues>(key: K, val: ClientFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "firstName" || key === "lastName") {
        const composed = [next.firstName.trim(), next.lastName.trim()]
          .filter(Boolean)
          .join(" ");
        if (composed) next.name = composed;
      }
      return next;
    });
  };

  const handleCinFile = (face: CinFace, file: File | null) => {
    setCinUploads((prev) => ({ ...prev, [face]: file }));
    setCinPreviews((prev) => ({
      ...prev,
      [face]: file ? URL.createObjectURL(file) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateClientForm(values);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const hasUploads = cinUploads.front || cinUploads.back;
    await onSubmit(formValuesToPayload(values), hasUploads ? cinUploads : undefined);
  };

  const cinFaces: {
    face: CinFace;
    label: string;
    inputRef: React.RefObject<HTMLInputElement>;
    existingUrl?: string | null;
    existingName?: string | null;
  }[] = [
    {
      face: "front",
      label: "Recto",
      inputRef: frontInputRef,
      existingUrl: initial?.cinDocumentUrl,
      existingName: initial?.cinDocumentName,
    },
    {
      face: "back",
      label: "Verso",
      inputRef: backInputRef,
      existingUrl: initial?.cinDocumentBackUrl,
      existingName: initial?.cinDocumentBackName,
    },
  ];

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
              <option key={value} value={value}>
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

      {values.type === "INDIVIDUAL" && (
        <FinanceFormSection title="Carte d'identité (CIN)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FinanceFieldLabel>Prénom</FinanceFieldLabel>
              <input
                className={financeFieldClass}
                value={values.firstName}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </div>
            <div>
              <FinanceFieldLabel>Nom</FinanceFieldLabel>
              <input
                className={financeFieldClass}
                value={values.lastName}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
            <div>
              <FinanceFieldLabel>N° CIN</FinanceFieldLabel>
              <input
                className={financeFieldClass}
                value={values.cinNumber}
                onChange={(e) => set("cinNumber", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <FinanceFieldLabel>Validité CIN</FinanceFieldLabel>
              <input
                type="date"
                className={financeFieldClass}
                value={values.cinValidUntil}
                onChange={(e) => set("cinValidUntil", e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-app bg-[color:var(--glass-bg)] p-3">
            <FinanceFieldLabel>CIN recto / verso</FinanceFieldLabel>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cinFaces.map(({ face, label, inputRef, existingUrl, existingName }) => {
                const preview = cinPreviews[face];
                const savedPreview = existingUrl ? resolveMediaUrl(existingUrl) : null;
                const file = cinUploads[face];
                return (
                  <div
                    key={face}
                    className="rounded-lg border border-app/80 bg-[color:var(--glass-bg)] p-3"
                  >
                    <p className="text-[12px] font-medium text-glass-secondary">{label}</p>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const picked = e.target.files?.[0] ?? null;
                        handleCinFile(face, picked);
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      className={cn(
                        glassBtnSecondary,
                        "mt-2 inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 text-[12px]"
                      )}
                      onClick={() => inputRef.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {file || existingName ? "Changer l'image" : "Importer"}
                    </button>
                    {(file?.name || existingName) && (
                      <p className="mt-2 truncate text-[11px] text-glass-muted">
                        {file?.name ?? existingName}
                      </p>
                    )}
                    {(preview || savedPreview) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview ?? savedPreview ?? ""}
                        alt={`CIN ${label.toLowerCase()}`}
                        className="mt-2 max-h-28 w-full rounded-md border border-app object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FinanceFormSection>
      )}

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
              <option value="">
                —
              </option>
              {Object.entries(CLIENT_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
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
                <option key={value} value={value}>
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
          disabled={
            loading ||
            (!values.name.trim() &&
              !values.firstName.trim() &&
              !values.lastName.trim()) ||
            !values.phone.trim()
          }
          className={cn(glassBtnPrimary, "w-full sm:w-auto")}
        >
          {loading ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
