"use client";

import Modal from "@/components/ui/Modal";
import ClientForm from "@/components/clients/ClientForm";
import { attachClientCinDocuments, type ClientCinUploads } from "@/lib/client-cin";
import { useCreateClient } from "@/hooks/useClients";
import { useQueryClient } from "@tanstack/react-query";
import type { Client } from "@/types";

interface QuickClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}

export default function QuickClientModal({
  isOpen,
  onClose,
  onCreated,
}: QuickClientModalProps) {
  const createClient = useCreateClient();
  const queryClient = useQueryClient();

  const handleSubmit = async (
    payload: Partial<Client>,
    cinUploads?: ClientCinUploads
  ) => {
    try {
      const created = await createClient.mutateAsync(payload);
      if (cinUploads?.front || cinUploads?.back) {
        await attachClientCinDocuments(created.id, cinUploads);
      }
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
      onCreated(created);
      onClose();
    } catch {
      /* toast from mutation */
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau client"
      size="lg"
      variant="glass"
    >
      <p className="mb-3 text-[12px] text-glass-muted">
        Saisissez les informations client et importez la CIN (recto / verso) si disponible.
      </p>
      <ClientForm
        onSubmit={handleSubmit}
        loading={createClient.isPending}
        submitLabel="Créer et sélectionner"
      />
    </Modal>
  );
}
