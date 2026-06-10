"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { Calendar, ExternalLink, FileText, Link2, MapPin, Plus, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import QuickClientModal from "@/components/clients/QuickClientModal";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ProjectFormImages, {
  revokePendingImages,
  type PendingProjectImage,
} from "./ProjectFormImages";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { toLocalDateInput } from "@/lib/dates";
import {
  getPhaseOptionsForCategory,
  normalizePhaseForCategory,
  PROJECT_CATEGORY_LABELS,
  PROJECT_NATURE_OPTIONS,
  PROJECT_SCALE_LABELS,
} from "@/lib/project-phases";
import { registerProjectFile, syncProjectImages, uploadProjectFile } from "@/lib/project-upload";
import {
  buildGoogleMapsUrl,
  parseCoordinate,
  resolveProjectLocation,
} from "@/lib/project-location";
import api from "@/lib/api";
import {
  PROJECT_TYPE_OPTIONS,
  type Project,
  type ProjectCategory,
  type ProjectPhase,
  type ProjectScale,
  type ProjectVisibility,
} from "@/types";
import { PROJECT_VISIBILITY_LABELS } from "@/lib/project-visibility";
import {
  glassBtnPrimary,
  glassBtnSecondary,
  glassInput,
  glassPanel,
  glassSelect,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type ProjectPriority = "NORMAL" | "URGENT";

interface CreateProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onCreated?: (project: Project) => void;
  defaultClientId?: string;
}

function parsePositiveNumber(raw: string): number | undefined {
  const n = Number(raw.replace(/\s/g, "").replace(",", "."));
  if (!raw.trim() || Number.isNaN(n) || n < 0) return undefined;
  return n;
}

function validateProjectForm(form: typeof initialForm): string | null {
  if (!form.name.trim()) return "Le nom du projet est obligatoire.";
  if (!form.type) return "Le type de projet est obligatoire.";
  if (!form.projectCategory) return "La catégorie du projet est obligatoire.";
  if (!form.phase) return "La phase est obligatoire.";
  if (form.url.trim()) {
    try {
      const u = new URL(form.url.trim());
      if (!["http:", "https:"].includes(u.protocol)) {
        return "L'URL doit commencer par http:// ou https://";
      }
    } catch {
      return "URL du projet invalide.";
    }
  }
  for (const [value, label] of [
    [form.mapsUrl, "Le lien Maps"],
    [form.driveUrl, "Le lien Drive"],
  ] as const) {
    if (value.trim()) {
      try {
        const u = new URL(value.trim());
        if (!["http:", "https:"].includes(u.protocol)) {
          return `${label} doit commencer par http:// ou https://`;
        }
      } catch {
        return `${label} est invalide.`;
      }
    }
  }
  if (form.totalProjectAmount.trim()) {
    const v = parsePositiveNumber(form.totalProjectAmount);
    if (v === undefined) return "Le montant global doit être un nombre positif.";
  }
  if (form.contractArchitectFees.trim()) {
    const v = parsePositiveNumber(form.contractArchitectFees);
    if (v === undefined) return "Les honoraires contrat doivent être un nombre positif.";
  }
  if (form.actualFeesToCollect.trim()) {
    const v = parsePositiveNumber(form.actualFeesToCollect);
    if (v === undefined) return "Les honoraires réels doivent être un nombre positif.";
  }
  if (form.surface.trim()) {
    const s = parsePositiveNumber(form.surface);
    if (s === undefined) return "La surface doit être un nombre positif.";
  }
  if (form.titleSurface.trim()) {
    const s = parsePositiveNumber(form.titleSurface);
    if (s === undefined) return "La surface titre doit être un nombre positif.";
  }
  if (form.intakeDate) {
    const d = new Date(form.intakeDate);
    if (Number.isNaN(d.getTime())) return "Date de prise invalide.";
  }
  if (form.deadline) {
    const d = new Date(form.deadline);
    if (Number.isNaN(d.getTime())) return "Date limite invalide.";
  }
  return null;
}

const initialForm = {
  name: "",
  address: "",
  city: "",
  country: "Maroc",
  province: "",
  prefecture: "",
  commune: "",
  arrondissement: "",
  coordinateX: "",
  coordinateY: "",
  latitude: "",
  longitude: "",
  mapsUrl: "",
  driveUrl: "",
  url: "",
  type: "",
  projectNature: "",
  projectCategory: "PRIVATE" as ProjectCategory,
  projectScale: "" as ProjectScale | "",
  phase: "ESQUISSE" as ProjectPhase,
  intakeDate: "",
  deadline: "",
  clientId: "",
  totalProjectAmount: "",
  contractArchitectFees: "",
  actualFeesToCollect: "",
  surface: "",
  titleSurface: "",
  description: "",
};

function FieldLabel({
  children,
  required,
  icon: Icon,
}: {
  children: React.ReactNode;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-glass-muted">
      {Icon && <Icon className="h-3 w-3 text-studio-light/55" />}
      {children}
      {required && <span className="text-glass-muted">*</span>}
    </label>
  );
}

const fieldClass = cn(glassInput, "px-3 py-2.5 [color-scheme:dark]");
const selectClass = cn(glassSelect, "w-full px-3 py-2.5 [color-scheme:dark]");

function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-2.5 rounded-xl border border-app bg-[color:var(--glass-bg)] p-3",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-glass-muted">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function projectToForm(project: Project) {
  const category = project.projectCategory ?? "PRIVATE";
  return {
    name: project.name,
    address: project.address ?? "",
    city: project.city ?? "",
    country: project.country ?? "Maroc",
    province: project.province ?? "",
    prefecture: project.prefecture ?? "",
    commune: project.commune ?? "",
    arrondissement: project.arrondissement ?? "",
    coordinateX: project.coordinateX != null ? String(project.coordinateX) : "",
    coordinateY: project.coordinateY != null ? String(project.coordinateY) : "",
    latitude: project.latitude != null ? String(project.latitude) : "",
    longitude: project.longitude != null ? String(project.longitude) : "",
    mapsUrl: project.mapsUrl ?? "",
    driveUrl: project.driveUrl ?? "",
    url: project.url ?? "",
    type: project.type ?? "",
    projectNature: project.projectNature ?? "",
    projectCategory: category,
    projectScale: project.projectScale ?? ("" as ProjectScale | ""),
    phase: project.phase,
    intakeDate: project.intakeDate
      ? toLocalDateInput(new Date(project.intakeDate))
      : "",
    deadline: project.deadline
      ? toLocalDateInput(new Date(project.deadline))
      : "",
    clientId: project.clientId ?? "",
    totalProjectAmount:
      project.totalProjectAmount != null
        ? String(project.totalProjectAmount)
        : project.budget != null
          ? String(project.budget)
          : "",
    contractArchitectFees:
      project.contractArchitectFees != null
        ? String(project.contractArchitectFees)
        : "",
    actualFeesToCollect:
      project.actualFeesToCollect != null
        ? String(project.actualFeesToCollect)
        : "",
    surface: project.surface != null ? String(project.surface) : "",
    titleSurface: project.titleSurface != null ? String(project.titleSurface) : "",
    description: project.description ?? "",
  };
}

export default function CreateProjectDrawer({
  isOpen,
  onClose,
  project: editProject,
  onCreated,
  defaultClientId,
}: CreateProjectDrawerProps) {
  const isEdit = Boolean(editProject);
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: clients = [] } = useClients();
  const [form, setForm] = useState(initialForm);
  const [pendingImages, setPendingImages] = useState<PendingProjectImage[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [clearExistingCover, setClearExistingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [priority, setPriority] = useState<ProjectPriority>("NORMAL");
  const [visibility, setVisibility] = useState<ProjectVisibility>("STUDIO");
  const [collaboratorEmails, setCollaboratorEmails] = useState("");
  const [useTopoCoordinates, setUseTopoCoordinates] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [autoLocated, setAutoLocated] = useState(false);
  const [autoLocateFailed, setAutoLocateFailed] = useState(false);
  const [matchedLocationLabel, setMatchedLocationLabel] = useState<string | null>(null);
  const coordsManualEditRef = useRef(false);
  const skipAutoResolveRef = useRef(true);
  const [formError, setFormError] = useState<string | null>(null);
  const isPending = createProject.isPending || updateProject.isPending || uploadingImages;

  const phaseOptions = useMemo(
    () => getPhaseOptionsForCategory(form.projectCategory, form.phase),
    [form.projectCategory, form.phase]
  );

  const locationResolveKey = useMemo(
    () =>
      [
        form.province,
        form.prefecture,
        form.commune,
        form.arrondissement,
        form.address,
        form.city,
        form.country,
      ].join("|"),
    [
      form.province,
      form.prefecture,
      form.commune,
      form.arrondissement,
      form.address,
      form.city,
      form.country,
    ]
  );
  const debouncedLocationKey = useDebouncedValue(locationResolveKey, 900);

  const setCategory = (value: ProjectCategory) => {
    setForm((f) => {
      const allowed = getPhaseOptionsForCategory(value, f.phase).map((o) => o.value);
      const phase = allowed.includes(f.phase)
        ? f.phase
        : normalizePhaseForCategory(f.phase, value);
      return { ...f, projectCategory: value, phase };
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editProject) {
      setForm(projectToForm(editProject));
      setVisibility(editProject.visibility ?? "STUDIO");
      setUseTopoCoordinates(Boolean(editProject.useTopoCoordinates));
    } else {
      setForm({ ...initialForm, clientId: defaultClientId ?? "" });
      setVisibility("STUDIO");
      setUseTopoCoordinates(false);
    }
    setPendingImages((prev) => {
      revokePendingImages(prev);
      return [];
    });
    setCoverIndex(0);
    setClearExistingCover(false);
    setPriority("NORMAL");
    setFormError(null);
    setAutoLocated(false);
    setAutoLocateFailed(false);
    setMatchedLocationLabel(null);
    coordsManualEditRef.current = false;
    skipAutoResolveRef.current = true;
  }, [isOpen, editProject?.id, defaultClientId]);

  useEffect(() => {
    if (!isOpen || coordsManualEditRef.current) return;
    if (skipAutoResolveRef.current) {
      skipAutoResolveRef.current = false;
      return;
    }

    const [province, prefecture, commune, arrondissement, address, city, country] =
      debouncedLocationKey.split("|");

    const hasMinimum =
      (address?.trim().length ?? 0) >= 3 && (city?.trim().length ?? 0) >= 2;
    if (!hasMinimum) {
      setAutoLocated(false);
      setAutoLocateFailed(false);
      return;
    }

    let cancelled = false;
    setGeocoding(true);
    setAutoLocateFailed(false);

    void resolveProjectLocation({
      province,
      prefecture,
      commune,
      arrondissement,
      address,
      city,
      country,
    })
      .then((result) => {
        if (cancelled || coordsManualEditRef.current) return;
        if (!result) {
          setAutoLocated(false);
          setAutoLocateFailed(true);
          setMatchedLocationLabel(null);
          return;
        }
        setForm((f) => ({
          ...f,
          coordinateX: String(result.coordinateX),
          coordinateY: String(result.coordinateY),
          latitude: String(result.latitude),
          longitude: String(result.longitude),
          mapsUrl: result.mapsUrl,
        }));
        setUseTopoCoordinates(true);
        setAutoLocated(true);
        setAutoLocateFailed(false);
        setMatchedLocationLabel(result.matchedLabel ?? result.query);
      })
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedLocationKey, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const set = (key: keyof typeof initialForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setPendingImages((prev) => {
      revokePendingImages(prev);
      return [];
    });
    setCoverIndex(0);
    setClearExistingCover(false);
    setVisibility("STUDIO");
    setCollaboratorEmails("");
    setUseTopoCoordinates(false);
  };

  const locationInput = () => ({
    address: form.address,
    arrondissement: form.arrondissement,
    commune: form.commune,
    prefecture: form.prefecture,
    province: form.province,
    city: form.city,
    country: form.country,
    coordinateX: parseCoordinate(form.coordinateX),
    coordinateY: parseCoordinate(form.coordinateY),
    latitude: parseCoordinate(form.latitude),
    longitude: parseCoordinate(form.longitude),
    useTopoCoordinates,
    mapsUrl: form.mapsUrl,
  });

  const openGoogleMaps = () => {
    const url = buildGoogleMapsUrl(locationInput());
    if (!url) {
      toast.error("Renseignez l'adresse ou les coordonnées GPS.");
      return;
    }
    setForm((f) => ({ ...f, mapsUrl: url }));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAutoLocate = async () => {
    if (form.address.trim().length < 3 || form.city.trim().length < 2) {
      toast.error("Renseignez l'adresse et la ville (ex. Cap Spartel, Tanger).");
      return;
    }
    setGeocoding(true);
    try {
      const result = await resolveProjectLocation(locationInput());
      if (!result) {
        toast.error(
          "Localisation introuvable. Vérifiez l'adresse et la ville (ex. Route de Cap Spartel, Tanger)."
        );
        setAutoLocateFailed(true);
        return;
      }
      coordsManualEditRef.current = false;
      setForm((f) => ({
        ...f,
        coordinateX: String(result.coordinateX),
        coordinateY: String(result.coordinateY),
        latitude: String(result.latitude),
        longitude: String(result.longitude),
        mapsUrl: result.mapsUrl,
      }));
      setUseTopoCoordinates(true);
      setAutoLocated(true);
      setAutoLocateFailed(false);
      setMatchedLocationLabel(result.matchedLabel ?? result.query);
      toast.success("Localisation mise à jour.");
    } catch {
      toast.error("Géolocalisation indisponible pour le moment.");
    } finally {
      setGeocoding(false);
    }
  };

  const markCoordsManual = () => {
    coordsManualEditRef.current = true;
    setAutoLocated(false);
    setAutoLocateFailed(false);
  };

  const invalidateProjectQueries = (projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["projects"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    }
  };

  const applyImageChanges = async (projectId: string) => {
    const files = pendingImages.map((p) => p.file);
    const hasExistingCover = Boolean(editProject?.imageUrl && !clearExistingCover);

    if (files.length > 0) {
      if (!hasExistingCover) {
        await syncProjectImages(projectId, files, coverIndex);
      } else {
        for (const file of files) {
          const uploaded = await uploadProjectFile(projectId, file, "images");
          await registerProjectFile({
            projectId,
            name: uploaded.originalName || file.name,
            url: uploaded.url,
            mimeType: uploaded.mimeType,
            size: uploaded.size,
            fileType: "RENDER",
          });
        }
      }
    } else if (isEdit && clearExistingCover) {
      await api.patch(`/projects/${projectId}`, { imageUrl: null });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProjectForm(form);
    if (validationError) {
      setFormError(validationError);
      toast.error(validationError);
      return;
    }
    setFormError(null);

    let deadline = form.deadline || undefined;
    if (!isEdit && priority === "URGENT" && !deadline) {
      deadline = toLocalDateInput(addDays(new Date(), 3));
    }

    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      country: form.country.trim() || undefined,
      province: form.province.trim() || undefined,
      prefecture: form.prefecture.trim() || undefined,
      commune: form.commune.trim() || undefined,
      arrondissement: form.arrondissement.trim() || undefined,
      coordinateX: form.coordinateX.trim()
        ? parseCoordinate(form.coordinateX)
        : undefined,
      coordinateY: form.coordinateY.trim()
        ? parseCoordinate(form.coordinateY)
        : undefined,
      latitude: form.latitude.trim() ? parseCoordinate(form.latitude) : undefined,
      longitude: form.longitude.trim()
        ? parseCoordinate(form.longitude)
        : undefined,
      useTopoCoordinates,
      mapsUrl: form.mapsUrl.trim() || undefined,
      driveUrl: form.driveUrl.trim() || undefined,
      url: form.url.trim() || undefined,
      type: form.type,
      projectNature: form.projectNature.trim() || undefined,
      projectCategory: form.projectCategory,
      projectScale: form.projectScale || undefined,
      phase: form.phase,
      intakeDate: form.intakeDate || undefined,
      deadline,
      clientId: form.clientId || undefined,
      totalProjectAmount: form.totalProjectAmount.trim()
        ? parsePositiveNumber(form.totalProjectAmount)
        : undefined,
      contractArchitectFees: form.contractArchitectFees.trim()
        ? parsePositiveNumber(form.contractArchitectFees)
        : undefined,
      actualFeesToCollect: form.actualFeesToCollect.trim()
        ? parsePositiveNumber(form.actualFeesToCollect)
        : undefined,
      surface: form.surface.trim() ? parsePositiveNumber(form.surface) : undefined,
      titleSurface: form.titleSurface.trim()
        ? parsePositiveNumber(form.titleSurface)
        : undefined,
      description: form.description.trim() || undefined,
      visibility,
      ...(visibility === "STUDIO" && collaboratorEmails.trim()
        ? { collaboratorEmails: collaboratorEmails.split(/[,;]/).map((e) => e.trim()) }
        : {}),
    };

    try {
      setUploadingImages(true);

      if (isEdit && editProject) {
        await updateProject.mutateAsync({ id: editProject.id, ...payload });
        await applyImageChanges(editProject.id);
        invalidateProjectQueries(editProject.id);
        reset();
        onClose();
        return;
      }

      const created = await createProject.mutateAsync(payload);
      if (pendingImages.length > 0) {
        await applyImageChanges(created.id);
      }
      invalidateProjectQueries(created.id);
      reset();
      onClose();
      onCreated?.(created);
      toast.success(
        (t) => (
          <span className="flex flex-wrap items-center gap-2">
            Projet créé avec succès
            <button
              type="button"
              className="rounded-md border border-glass bg-[color:var(--glass-bg-hover)] px-2 py-0.5 text-xs font-medium text-studio-light transition hover:bg-white/[0.10]"
              onClick={() => {
                toast.dismiss(t.id);
                router.push(`/projects/${created.id}`);
              }}
            >
              Ouvrir
            </button>
          </span>
        ),
        { duration: 8000 }
      );
    } catch (err) {
      console.error(err);
      toast.error(
        pendingImages.length > 0
          ? "Projet enregistré mais l'envoi des images a échoué. Réessayez via Modifier le projet."
          : isEdit
            ? "Erreur lors de la mise à jour du projet"
            : "Erreur lors de la création du projet"
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const showExistingCover = Boolean(isEdit && editProject?.imageUrl && !clearExistingCover);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
        className={cn(
          glassPanel,
          "relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden",
          "rounded-t-xl border-glass sm:max-h-[90dvh] sm:rounded-xl",
          "max-md:max-h-[100dvh] max-md:rounded-none max-md:border-x-0 max-md:border-t-0",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-app px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-4 w-0.5 shrink-0 rounded-full bg-studio-light" aria-hidden />
            <h2
              id="create-project-title"
              className="truncate text-base font-semibold text-glass"
            >
              {isEdit ? "Modifier le projet" : "Nouveau projet"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-glass-muted transition hover:bg-[color:var(--glass-bg-hover)] hover:text-glass"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto w-full max-w-3xl space-y-3">
              <FormSection title="Identité & planning">
                <div>
                  <FieldLabel required>Nom du projet</FieldLabel>
                  <input
                    className={fieldClass}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ex: Villa Panorama"
                    required
                    autoFocus
                  />
                </div>

                <div className="rounded-lg border border-app bg-studio-muted/15 p-2.5">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-glass-muted">
                    Montants & honoraires
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div>
                      <FieldLabel>Montant global du projet (MAD)</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={fieldClass}
                        value={form.totalProjectAmount}
                        onChange={(e) => set("totalProjectAmount", e.target.value)}
                        placeholder="5 000 000"
                      />
                    </div>
                    <div>
                      <FieldLabel>Honoraires déclarés (contrat architecte)</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={fieldClass}
                        value={form.contractArchitectFees}
                        onChange={(e) => set("contractArchitectFees", e.target.value)}
                        placeholder="450 000"
                      />
                    </div>
                    <div>
                      <FieldLabel>Honoraires réels à encaisser</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={fieldClass}
                        value={form.actualFeesToCollect}
                        onChange={(e) => set("actualFeesToCollect", e.target.value)}
                        placeholder="380 000"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-glass-muted">
                    Le reste à encaisser est calculé automatiquement (honoraires réels − paiements).
                  </p>
                </div>

                <div>
                  <FieldLabel>Visibilité</FieldLabel>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["STUDIO", "PERSONAL"] as ProjectVisibility[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVisibility(value)}
                        className={cn(
                          "rounded-lg border px-3 py-2.5 text-left transition",
                          visibility === value
                            ? "border-studio-border/40 bg-[color:var(--glass-bg-hover)] text-glass"
                            : "border-app text-glass-muted hover:border-studio-border/25 hover:text-glass-secondary"
                        )}
                      >
                        <span className="text-[12px] font-medium">
                          {PROJECT_VISIBILITY_LABELS[value]}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-glass-muted">
                          {value === "STUDIO"
                            ? "Visible par tout votre cabinet. Invitez un autre cabinet ci-dessous si besoin."
                            : "Projet privé — visible uniquement par vous."}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {visibility === "STUDIO" && !isEdit && (
                  <div>
                    <FieldLabel>Collaborateurs externes (optionnel)</FieldLabel>
                    <input
                      className={fieldClass}
                      value={collaboratorEmails}
                      onChange={(e) => setCollaboratorEmails(e.target.value)}
                      placeholder="admin@maouni.architecture"
                    />
                    <p className="mt-1 text-[10px] text-glass-muted">
                      Email d&apos;un compte d&apos;un autre cabinet pour collaborer sur ce projet.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <FieldLabel required>Type de projet</FieldLabel>
                    <select
                      className={cn(selectClass, !form.type && "text-glass-muted")}
                      value={form.type}
                      onChange={(e) => set("type", e.target.value)}
                      required
                    >
                      <option value="" className="bg-[#101014]">
                        Sélectionner…
                      </option>
                      {PROJECT_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t} className="bg-[#101014]">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Nature</FieldLabel>
                    <input
                      className={fieldClass}
                      list="project-nature-options"
                      value={form.projectNature}
                      onChange={(e) => set("projectNature", e.target.value)}
                      placeholder="Lotissement…"
                    />
                    <datalist id="project-nature-options">
                      {PROJECT_NATURE_OPTIONS.map((n) => (
                        <option key={n} value={n} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <FieldLabel required>Catégorie</FieldLabel>
                    <select
                      className={selectClass}
                      value={form.projectCategory}
                      onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                      required
                    >
                      {(Object.entries(PROJECT_CATEGORY_LABELS) as [ProjectCategory, string][]).map(
                        ([value, label]) => (
                          <option key={value} value={value} className="bg-[#101014]">
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div
                  className={cn(
                    "grid grid-cols-1 gap-2.5 sm:grid-cols-2",
                    !isEdit ? "lg:grid-cols-4" : "lg:grid-cols-3"
                  )}
                >
                  <div>
                    <FieldLabel>Taille</FieldLabel>
                    <select
                      className={cn(selectClass, !form.projectScale && "text-glass-muted")}
                      value={form.projectScale}
                      onChange={(e) => set("projectScale", e.target.value)}
                    >
                      <option value="" className="bg-[#101014]">
                        Non définie
                      </option>
                      {(Object.entries(PROJECT_SCALE_LABELS) as [ProjectScale, string][]).map(
                        ([value, label]) => (
                          <option key={value} value={value} className="bg-[#101014]">
                            {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <FieldLabel required>Phase</FieldLabel>
                    <select
                      className={selectClass}
                      value={form.phase}
                      onChange={(e) => set("phase", e.target.value as ProjectPhase)}
                      required
                    >
                      {phaseOptions.map((o) => (
                        <option key={o.value} value={o.value} className="bg-[#101014]">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel icon={User}>Client</FieldLabel>
                    <div className="flex gap-2">
                      <select
                        className={cn(selectClass, "min-w-0 flex-1", !form.clientId && "text-glass-muted")}
                        value={form.clientId}
                        onChange={(e) => set("clientId", e.target.value)}
                      >
                        <option value="" className="bg-[#101014]">
                          Aucun
                        </option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#101014]">
                            {c.company ? `${c.name} — ${c.company}` : c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setClientModalOpen(true)}
                        className={cn(
                          glassBtnSecondary,
                          "inline-flex shrink-0 items-center gap-1 px-3 py-2.5 text-[12px]"
                        )}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Client
                      </button>
                    </div>
                  </div>
                  {!isEdit && (
                    <div>
                      <FieldLabel>Priorité</FieldLabel>
                      <select
                        className={selectClass}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                      >
                        <option value="NORMAL" className="bg-[#101014]">
                          Normale
                        </option>
                        <option value="URGENT" className="bg-[#101014]">
                          Urgente
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <FieldLabel icon={Calendar}>Date de prise</FieldLabel>
                    <input
                      type="date"
                      className={fieldClass}
                      value={form.intakeDate}
                      onChange={(e) => set("intakeDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Calendar}>Date limite</FieldLabel>
                    <input
                      type="date"
                      className={fieldClass}
                      value={form.deadline}
                      onChange={(e) => set("deadline", e.target.value)}
                    />
                  </div>
                </div>

                {!isEdit && priority === "URGENT" && (
                  <p className="text-[10px] text-glass-muted">
                    Priorité urgente : deadline à 3 jours si aucune date n&apos;est indiquée.
                  </p>
                )}
              </FormSection>

              <FormSection title="Localisation" className="lg:col-span-2">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <FieldLabel>Province</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.province}
                        onChange={(e) => set("province", e.target.value)}
                        placeholder="Région"
                      />
                    </div>
                    <div>
                      <FieldLabel>Préfecture</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.prefecture}
                        onChange={(e) => set("prefecture", e.target.value)}
                        placeholder="Préfecture"
                      />
                    </div>
                    <div>
                      <FieldLabel>Commune</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.commune}
                        onChange={(e) => set("commune", e.target.value)}
                        placeholder="Commune"
                      />
                    </div>
                    <div>
                      <FieldLabel>Arrondissement</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.arrondissement}
                        onChange={(e) => set("arrondissement", e.target.value)}
                        placeholder="Arrondissement"
                      />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldLabel icon={MapPin} required>Adresse</FieldLabel>
                    <input
                      className={fieldClass}
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="Cap Spartel, Tanger…"
                    />
                  </div>
                  <div>
                    <FieldLabel required>Ville</FieldLabel>
                    <input
                      className={fieldClass}
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Tanger"
                    />
                  </div>
                  <div>
                    <FieldLabel>Pays</FieldLabel>
                    <input
                      className={fieldClass}
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                      placeholder="Maroc"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-[#8ba4c7]/25 bg-[#8ba4c7]/[0.06] p-3">
                  {(geocoding || autoLocated || autoLocateFailed) && (
                    <p
                      className={cn(
                        "mb-2 text-[10px]",
                        autoLocateFailed ? "text-amber-300/90" : "text-[#8ba4c7]"
                      )}
                    >
                      {geocoding
                        ? "Calcul…"
                        : autoLocated
                          ? "OK"
                          : "Adresse introuvable"}
                    </p>
                  )}
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-glass-muted">
                    <input
                      type="checkbox"
                      checked={useTopoCoordinates}
                      onChange={(e) => setUseTopoCoordinates(e.target.checked)}
                      className="rounded border-glass"
                    />
                    X/Y sur la carte
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                    <div>
                      <FieldLabel>X</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.coordinateX}
                        onChange={(e) => {
                          markCoordsManual();
                          set("coordinateX", e.target.value);
                        }}
                        placeholder="452304"
                      />
                    </div>
                    <div>
                      <FieldLabel>Y</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.coordinateY}
                        onChange={(e) => {
                          markCoordsManual();
                          set("coordinateY", e.target.value);
                        }}
                        placeholder="576787"
                      />
                    </div>
                    <div>
                      <FieldLabel>Lat.</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.latitude}
                        onChange={(e) => {
                          markCoordsManual();
                          set("latitude", e.target.value);
                        }}
                        placeholder="35.7595"
                      />
                    </div>
                    <div>
                      <FieldLabel>Long.</FieldLabel>
                      <input
                        className={fieldClass}
                        value={form.longitude}
                        onChange={(e) => {
                          markCoordsManual();
                          set("longitude", e.target.value);
                        }}
                        placeholder="-5.8340"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={geocoding}
                      onClick={() => void handleAutoLocate()}
                      className={cn(
                        glassBtnSecondary,
                        "border-[#8ba4c7]/30 px-3 py-2 text-[11px] text-[#8ba4c7]"
                      )}
                    >
                      {geocoding ? "…" : "Localiser"}
                    </button>
                    <button
                      type="button"
                      onClick={openGoogleMaps}
                      className={cn(
                        glassBtnSecondary,
                        "inline-flex items-center gap-1 px-3 py-2 text-[11px]"
                      )}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Google Maps
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <FieldLabel icon={Link2}>Lien Google Maps</FieldLabel>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        className={cn(fieldClass, "min-w-0 flex-1")}
                        value={form.mapsUrl}
                        onChange={(e) => set("mapsUrl", e.target.value)}
                        placeholder="Généré après localisation…"
                      />
                      {(form.mapsUrl.trim() || buildGoogleMapsUrl(locationInput())) && (
                        <a
                          href={form.mapsUrl.trim() || buildGoogleMapsUrl(locationInput())}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            glassBtnSecondary,
                            "inline-flex shrink-0 items-center gap-1 px-3 py-2 text-[11px]"
                          )}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <FieldLabel icon={Link2}>Lien Google Drive</FieldLabel>
                    <input
                      type="url"
                      className={fieldClass}
                      value={form.driveUrl}
                      onChange={(e) => set("driveUrl", e.target.value)}
                      placeholder="https://drive.google.com/…"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel icon={Link2}>URL du projet</FieldLabel>
                    <input
                      type="url"
                      className={fieldClass}
                      value={form.url}
                      onChange={(e) => set("url", e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
              </FormSection>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <FormSection title="Chiffres & description" className="lg:col-span-2">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Surface (m²)</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={fieldClass}
                        value={form.surface}
                        onChange={(e) => set("surface", e.target.value)}
                        placeholder="350"
                      />
                    </div>
                    <div>
                      <FieldLabel>Surface titre</FieldLabel>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={fieldClass}
                        value={form.titleSurface}
                        onChange={(e) => set("titleSurface", e.target.value)}
                        placeholder="2800"
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel icon={FileText}>Description</FieldLabel>
                    <textarea
                      className={cn(fieldClass, "min-h-[72px] resize-y")}
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Objectifs, particularités…"
                      rows={2}
                    />
                  </div>
                </FormSection>
              </div>

              {formError && (
                <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.08] px-3 py-2 text-[12px] text-rose-200/90">
                  {formError}
                </p>
              )}

              <FormSection title="Visuels">
                <ProjectFormImages
                  images={pendingImages}
                  coverIndex={coverIndex}
                  existingCoverUrl={editProject?.imageUrl}
                  keepExistingCover={showExistingCover}
                  onImagesChange={setPendingImages}
                  onCoverIndexChange={(index) => {
                    setCoverIndex(index);
                    setClearExistingCover(true);
                  }}
                  onClearExistingCover={() => setClearExistingCover(true)}
                  disabled={isPending}
                />
              </FormSection>
            </div>
          </div>

          <footer className="shrink-0 border-t border-app bg-[color:var(--glass-bg)] px-4 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className={cn(glassBtnSecondary, "w-full sm:w-auto")}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending || !form.name.trim() || !form.type || !form.projectCategory || !form.phase}
                className={cn(glassBtnPrimary, "w-full sm:w-auto")}
              >
                {uploadingImages
                  ? "Envoi des images…"
                  : isPending
                    ? isEdit
                      ? "Enregistrement…"
                      : "Création…"
                    : isEdit
                      ? "Enregistrer"
                      : "Créer le projet"}
              </button>
            </div>
          </footer>
        </form>
      </aside>

      <QuickClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onCreated={(client) => {
          setForm((f) => ({ ...f, clientId: client.id }));
          toast.success(`Client « ${client.name} » sélectionné.`);
        }}
      />
    </div>
  );
}
