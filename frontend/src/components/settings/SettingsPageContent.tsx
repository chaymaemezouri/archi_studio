"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, FileText, Lock, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import SettingsImageUpload from "./SettingsImageUpload";
import {
  SettingsDocPreview,
  SettingsField,
  SettingsSaveBar,
  SettingsSection,
  SettingsSelect,
} from "./settings-shared";
import {
  settingsCard,
  settingsContent,
  settingsGrid2,
  settingsGrid3,
  settingsLayout,
  settingsNav,
  settingsNavBtn,
  settingsPage,
  settingsSectionIcon,
  settingsSectionTitle,
  settingsTabBtnActive,
  settingsTabBtnInactive,
} from "./settings-ui";
import { useAuth } from "@/hooks/useAuth";
import {
  changeUserPassword,
  fetchStudioSettings,
  type StudioSettings,
  updateStudioSettings,
  updateUserProfile,
  uploadStudioLogo,
  uploadUserAvatar,
} from "@/lib/settings-api";
import { normalizeUser, resolveMediaUrl } from "@/lib/assets";
import {
  loadUserPreferences,
  saveUserPreferences,
  type UserAppPreferences,
} from "@/lib/settings-user-prefs";
import { accentBar, glassInput } from "@/lib/glass-styles";
import { cn, formatDate } from "@/lib/utils";

type SettingsTab = "profile" | "studio" | "billing" | "security";

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profil", icon: User },
  { id: "studio", label: "Cabinet", icon: Building2 },
  { id: "billing", label: "Facturation", icon: FileText },
  { id: "security", label: "Sécurité", icon: Shield },
];

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Administrateur",
  USER: "Utilisateur",
};

export default function SettingsPageContent() {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const [form, setForm] = useState<StudioSettings>({});
  const [profileName, setProfileName] = useState("");
  const [prefs, setPrefs] = useState<UserAppPreferences>(loadUserPreferences);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchStudioSettings,
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (user?.name) setProfileName(user.name);
  }, [user?.name]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }, [queryClient]);

  const saveSettings = useMutation({
    mutationFn: updateStudioSettings,
    onSuccess: (result) => {
      invalidateAll();
      if (user?.studio && result) {
        setUser(
          normalizeUser({
            ...user,
            studio: {
              ...user.studio,
              name: result.cabinetName ?? user.studio.name,
              logoUrl: result.cabinetLogo ?? user.studio.logoUrl,
            },
          })
        );
      }
      toast.success("Enregistré");
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  const logoUpload = useMutation({
    mutationFn: uploadStudioLogo,
    onSuccess: (result) => {
      invalidateAll();
      if (user?.studio) {
        setUser(
          normalizeUser({
            ...user,
            studio: {
              ...user.studio,
              name: result.cabinetName ?? user.studio.name,
              logoUrl: result.cabinetLogo ?? user.studio.logoUrl,
            },
          })
        );
      }
      toast.success("Logo mis à jour");
    },
    onError: () => toast.error("Échec de l'upload"),
  });

  const avatarUpload = useMutation({
    mutationFn: uploadUserAvatar,
    onSuccess: (updated) => {
      setUser(normalizeUser(updated));
      toast.success("Photo mise à jour");
    },
    onError: () => toast.error("Échec de l'upload"),
  });

  const saveProfile = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (updated) => {
      setUser(normalizeUser(updated));
      toast.success("Profil mis à jour");
    },
    onError: () => toast.error("Erreur"),
  });

  const passwordChange = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Mot de passe modifié");
    },
    onError: () => toast.error("Mot de passe incorrect"),
  });

  const patch = (field: keyof StudioSettings, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const logoPreview =
    resolveMediaUrl(form.cabinetLogo) ??
    resolveMediaUrl(user?.studio?.logoUrl) ??
    null;

  return (
    <div className={settingsPage}>
      <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#e8edf4]/92 sm:text-2xl">
        <span className={accentBar} aria-hidden />
        Paramètres
      </h1>

      <div className={settingsLayout}>
        <nav className={cn(settingsNav, settingsCard, "p-1.5 lg:p-2")} aria-label="Sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                settingsNavBtn,
                tab === id ? settingsTabBtnActive : settingsTabBtnInactive
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </nav>

        <div className={settingsContent}>
          {tab === "profile" && (
            <div className={settingsCard}>
              <h2 className={settingsSectionTitle}>
                <User className={settingsSectionIcon} strokeWidth={1.75} />
                Profil
              </h2>

              <form
                className="space-y-3.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  saveUserPreferences(prefs);
                  saveProfile.mutate({ name: profileName.trim() });
                }}
              >
                <div className={settingsGrid2}>
                  <SettingsSection title="Photo">
                    <SettingsImageUpload
                      kind="avatar"
                      previewName={profileName || user?.name || "U"}
                      previewSrc={user?.avatar}
                      uploading={avatarUpload.isPending}
                      onUpload={(file) => avatarUpload.mutate(file)}
                    />
                  </SettingsSection>

                  <SettingsSection title="Compte">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <SettingsField label="Email">
                        <input
                          type="email"
                          value={user?.email ?? ""}
                          disabled
                          className={cn(glassInput, "opacity-60")}
                        />
                      </SettingsField>
                      <SettingsField label="Rôle">
                        <input
                          type="text"
                          value={ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? ""}
                          disabled
                          className={cn(glassInput, "opacity-60")}
                        />
                      </SettingsField>
                      <SettingsField label="Nom affiché" className="sm:col-span-2">
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className={glassInput}
                        />
                      </SettingsField>
                    </div>
                    {user?.studio?.name && (
                      <p className="mt-2 text-[11px] text-white/35">
                        Studio · {user.studio.name}
                        {user.createdAt && (
                          <> · depuis {formatDate(user.createdAt, "MMM yyyy")}</>
                        )}
                      </p>
                    )}
                  </SettingsSection>
                </div>

                <SettingsSection title="Affichage par défaut">
                  <div className={settingsGrid3}>
                    <SettingsField label="Projets">
                      <SettingsSelect
                        value={prefs.defaultProjectsView}
                        onChange={(v) =>
                          setPrefs((p) => ({
                            ...p,
                            defaultProjectsView: v as "grid" | "list",
                          }))
                        }
                        options={[
                          { value: "grid", label: "Grille" },
                          { value: "list", label: "Liste" },
                        ]}
                      />
                    </SettingsField>
                    <SettingsField label="Tâches">
                      <SettingsSelect
                        value={prefs.defaultTasksView}
                        onChange={(v) =>
                          setPrefs((p) => ({
                            ...p,
                            defaultTasksView: v as "list" | "board",
                          }))
                        }
                        options={[
                          { value: "list", label: "Liste" },
                          { value: "board", label: "Tableau" },
                        ]}
                      />
                    </SettingsField>
                    <SettingsField label="Calendrier">
                      <SettingsSelect
                        value={prefs.defaultCalendarView}
                        onChange={(v) =>
                          setPrefs((p) => ({
                            ...p,
                            defaultCalendarView: v as UserAppPreferences["defaultCalendarView"],
                          }))
                        }
                        options={[
                          { value: "month", label: "Mois" },
                          { value: "week", label: "Semaine" },
                          { value: "day", label: "Jour" },
                          { value: "list", label: "Liste" },
                        ]}
                      />
                    </SettingsField>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-white/55">
                      <input
                        type="checkbox"
                        checked={prefs.showDoneTasksByDefault}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            showDoneTasksByDefault: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-studio-light"
                      />
                      Tâches terminées visibles
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[12px] text-white/55">
                      <input
                        type="checkbox"
                        checked={prefs.showDoneCalendarByDefault}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            showDoneCalendarByDefault: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/[0.04] accent-studio-light"
                      />
                      Événements terminés visibles
                    </label>
                  </div>
                </SettingsSection>

                <SettingsSaveBar saving={saveProfile.isPending} label="Enregistrer" />
              </form>
            </div>
          )}

          {tab === "studio" && (
            <div className={settingsCard}>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveSettings.mutate(form);
                  }}
                  className="space-y-3.5"
                >
                  <h2 className={settingsSectionTitle}>
                    <Building2 className={settingsSectionIcon} strokeWidth={1.75} />
                    Cabinet
                  </h2>

                  <SettingsSection title="Logo & identité">
                    <SettingsImageUpload
                      kind="logo"
                      previewName={form.cabinetName || user?.studio?.name || "Studio"}
                      previewSrc={logoPreview}
                      studioName={form.cabinetName || user?.studio?.name}
                      uploading={logoUpload.isPending}
                      onUpload={(file) => logoUpload.mutate(file)}
                    />
                    {user?.studio?.slug && (
                      <p className="mt-2 text-[11px] text-white/35">
                        Identifiant ·{" "}
                        <span className="font-mono text-white/50">{user.studio.slug}</span>
                      </p>
                    )}
                  </SettingsSection>

                  <div className={settingsGrid2}>
                    <SettingsSection title="Coordonnées">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SettingsField label="Nom" className="sm:col-span-2">
                          <input
                            type="text"
                            value={form.cabinetName || ""}
                            onChange={(e) => patch("cabinetName", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Email">
                          <input
                            type="email"
                            value={form.cabinetEmail || ""}
                            onChange={(e) => patch("cabinetEmail", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Téléphone">
                          <input
                            type="tel"
                            value={form.cabinetPhone || ""}
                            onChange={(e) => patch("cabinetPhone", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Site web">
                          <input
                            type="url"
                            value={form.cabinetWebsite || ""}
                            onChange={(e) => patch("cabinetWebsite", e.target.value)}
                            className={glassInput}
                            placeholder="https://"
                          />
                        </SettingsField>
                        <SettingsField label="Ville">
                          <input
                            type="text"
                            value={form.cabinetCity || ""}
                            onChange={(e) => patch("cabinetCity", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Adresse" className="sm:col-span-2">
                          <input
                            type="text"
                            value={form.cabinetAddress || ""}
                            onChange={(e) => patch("cabinetAddress", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Pays">
                          <input
                            type="text"
                            value={form.cabinetCountry || ""}
                            onChange={(e) => patch("cabinetCountry", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                      </div>
                    </SettingsSection>

                    <SettingsSection title="Identifiants légaux">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SettingsField label="ICE">
                          <input
                            type="text"
                            value={form.cabinetIce || ""}
                            onChange={(e) => patch("cabinetIce", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="RC">
                          <input
                            type="text"
                            value={form.cabinetRc || ""}
                            onChange={(e) => patch("cabinetRc", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="CNSS">
                          <input
                            type="text"
                            value={form.cabinetCnss || ""}
                            onChange={(e) => patch("cabinetCnss", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Patente">
                          <input
                            type="text"
                            value={form.cabinetPatente || ""}
                            onChange={(e) => patch("cabinetPatente", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                      </div>
                    </SettingsSection>
                  </div>

                  <SettingsSaveBar saving={saveSettings.isPending} />
                </form>
              )}
            </div>
          )}

          {tab === "billing" && (
            <div className={settingsCard}>
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveSettings.mutate(form);
                  }}
                  className="space-y-3.5"
                >
                  <h2 className={settingsSectionTitle}>
                    <FileText className={settingsSectionIcon} strokeWidth={1.75} />
                    Facturation
                  </h2>

                  <div className={settingsGrid2}>
                    <SettingsSection title="Numérotation">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SettingsField label="TVA (%)">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            value={form.tvaDefault ?? 20}
                            onChange={(e) => patch("tvaDefault", Number(e.target.value))}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Délai paiement (j)">
                          <input
                            type="number"
                            min={0}
                            max={365}
                            value={form.paymentTermsDays ?? 30}
                            onChange={(e) =>
                              patch("paymentTermsDays", Number(e.target.value))
                            }
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Préfixe devis">
                          <input
                            type="text"
                            value={form.devisPrefix || ""}
                            onChange={(e) => patch("devisPrefix", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                        <SettingsField label="Préfixe factures">
                          <input
                            type="text"
                            value={form.invoicePrefix || ""}
                            onChange={(e) => patch("invoicePrefix", e.target.value)}
                            className={glassInput}
                          />
                        </SettingsField>
                      </div>
                    </SettingsSection>

                    <SettingsSection title="Aperçu PDF">
                      <SettingsDocPreview settings={form} />
                    </SettingsSection>
                  </div>

                  <SettingsSection title="Banque">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <SettingsField label="Banque">
                        <input
                          type="text"
                          value={form.bankName || ""}
                          onChange={(e) => patch("bankName", e.target.value)}
                          className={glassInput}
                        />
                      </SettingsField>
                      <SettingsField label="RIB / IBAN">
                        <input
                          type="text"
                          value={form.bankRib || ""}
                          onChange={(e) => patch("bankRib", e.target.value)}
                          className={glassInput}
                        />
                      </SettingsField>
                    </div>
                  </SettingsSection>

                  <SettingsSection title="Textes PDF">
                    <div className={settingsGrid2}>
                      <SettingsField label="Pied de page">
                        <textarea
                          value={form.invoiceFooter || ""}
                          onChange={(e) => patch("invoiceFooter", e.target.value)}
                          rows={3}
                          className={cn(glassInput, "min-h-[80px] resize-y")}
                        />
                      </SettingsField>
                      <SettingsField label="CGV">
                        <textarea
                          value={form.cgv || ""}
                          onChange={(e) => patch("cgv", e.target.value)}
                          rows={5}
                          className={cn(glassInput, "min-h-[120px] resize-y")}
                        />
                      </SettingsField>
                    </div>
                  </SettingsSection>

                  <SettingsSaveBar saving={saveSettings.isPending} />
                </form>
              )}
            </div>
          )}

          {tab === "security" && (
            <div className={settingsCard}>
              <h2 className={settingsSectionTitle}>
                <Lock className={settingsSectionIcon} strokeWidth={1.75} />
                Mot de passe
              </h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPassword !== confirmPassword) {
                    toast.error("Les mots de passe ne correspondent pas");
                    return;
                  }
                  if (newPassword.length < 8) {
                    toast.error("8 caractères minimum");
                    return;
                  }
                  passwordChange.mutate({ currentPassword, newPassword });
                }}
                className="space-y-3.5"
              >
                <SettingsSection title="Changement">
                  <div className={settingsGrid3}>
                    <SettingsField label="Actuel">
                      <input
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={glassInput}
                      />
                    </SettingsField>
                    <SettingsField label="Nouveau">
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={glassInput}
                      />
                    </SettingsField>
                    <SettingsField label="Confirmation">
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={glassInput}
                      />
                    </SettingsField>
                  </div>
                </SettingsSection>

                <SettingsSaveBar
                  saving={passwordChange.isPending}
                  label="Mettre à jour"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
