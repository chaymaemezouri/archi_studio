"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FolderKanban,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Users,
} from "lucide-react";
import ClientDetailTabs, {
  CLIENT_TABS,
  type ClientTabId,
} from "@/components/clients/ClientDetailTabs";
import ClientTabPanels from "@/components/clients/ClientTabPanels";
import ClientForm from "@/components/clients/ClientForm";
import {
  detailClientHero,
  detailClientHeroActions,
  detailClientHeroMeta,
  detailClientHeroTitle,
  detailClientPage,
} from "@/components/clients/client-detail-ui";
import CreateProjectDrawer from "@/components/projects/CreateProjectDrawer";
import {
  detailContentShell,
  detailIconActionGroup,
  detailSectionContent,
} from "@/components/projects/detail/project-detail-ui";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { useClient, useUpdateClient } from "@/hooks/useClients";
import {
  CLIENT_STATUS_LABELS,
  CLIENT_TYPE_LABELS,
  type Client,
} from "@/types";

const TAB_IDS = new Set(CLIENT_TABS.map((t) => t.id));

function statusVariant(status?: string): "default" | "success" | "warning" {
  if (status === "ACTIVE") return "success";
  if (status === "ARCHIVED") return "warning";
  return "default";
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: client, isLoading, isError, refetch } = useClient(id);
  const updateClient = useUpdateClient();

  const tabParam = searchParams.get("tab");
  const activeTab: ClientTabId =
    tabParam && TAB_IDS.has(tabParam as ClientTabId) ? (tabParam as ClientTabId) : "overview";

  const [editOpen, setEditOpen] = useState(false);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);

  const setTab = useCallback(
    (tab: ClientTabId) => {
      router.replace(`/clients/${id}?tab=${tab}`, { scroll: false });
    },
    [id, router]
  );

  const handleUpdate = (payload: Partial<Client>) => {
    updateClient.mutate({ id, ...payload }, { onSuccess: () => setEditOpen(false) });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#8ba4c7]/30 border-t-[#8ba4c7]" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <EmptyState
        icon={Users}
        title="Client introuvable"
        description="Ce client n'existe pas ou a été supprimé."
        actionLabel="Retour aux clients"
        onAction={() => router.push("/clients")}
      />
    );
  }

  const mapsQuery = [client.address, client.city, client.country].filter(Boolean).join(", ");

  return (
    <div className={detailClientPage}>
      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#9aa3b0]/55 hover:text-[#8ba4c7]/75"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux clients
      </Link>

      <header className={detailClientHero}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={detailClientHeroTitle}>{client.name}</h1>
              <Badge variant={statusVariant(client.status)}>
                {CLIENT_STATUS_LABELS[client.status ?? "ACTIVE"]}
              </Badge>
            </div>
            <p className={detailClientHeroMeta}>
              {CLIENT_TYPE_LABELS[client.type ?? ""] ?? client.type}
              {client.type === "COMPANY" && client.company && ` · ${client.company}`}
            </p>
            {(client.phone || client.email || mapsQuery) && (
              <div className={cn("mt-2.5", detailClientHeroActions)}>
                {client.phone && (
                  <IconActionButton
                    label={`Appeler ${client.phone}`}
                    icon={Phone}
                    tone="view"
                    href={`tel:${client.phone.replace(/\s/g, "")}`}
                  />
                )}
                {client.email && (
                  <IconActionButton
                    label={`Email ${client.email}`}
                    icon={Mail}
                    tone="notes"
                    href={`mailto:${client.email}`}
                  />
                )}
                {mapsQuery && (
                  <IconActionButton
                    label="Voir l'adresse sur la carte"
                    icon={MapPin}
                    tone="view"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                  />
                )}
              </div>
            )}
          </div>

          <div className={detailIconActionGroup}>
            <IconActionButton
              label="Modifier le client"
              icon={Pencil}
              tone="notes"
              onClick={() => setEditOpen(true)}
            />
            <IconActionButton
              label="Ajouter un projet"
              icon={FolderKanban}
              tone="upload"
              onClick={() => setProjectDrawerOpen(true)}
            />
            <IconActionButton
              label="Créer une facture"
              icon={Receipt}
              tone="download"
              href={`/finances/quotes-invoices?new=invoice&clientId=${client.id}`}
            />
          </div>
        </div>
      </header>

      <div className={detailContentShell}>
        <div className={detailSectionContent}>
          <ClientDetailTabs active={activeTab} onChange={setTab} client={client} />
          <div className="mt-3">
            <ClientTabPanels client={client} tab={activeTab} />
          </div>
        </div>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Modifier le client"
        size="lg"
        variant="glass"
      >
        <ClientForm
          initial={client}
          onSubmit={handleUpdate}
          loading={updateClient.isPending}
          submitLabel="Enregistrer"
        />
      </Modal>

      <CreateProjectDrawer
        isOpen={projectDrawerOpen}
        onClose={() => {
          setProjectDrawerOpen(false);
          void refetch();
        }}
        defaultClientId={client.id}
      />
    </div>
  );
}
