"use client";

import { Share2 } from "lucide-react";
import IconActionButton from "@/components/projects/detail/IconActionButton";
import { useCreateSharedNote, type SharedNoteRefDraft } from "@/hooks/useSharedNotes";

export default function ShareNoteButton({
  item,
  label = "Partager dans les notes",
}: {
  item: SharedNoteRefDraft;
  label?: string;
}) {
  const share = useCreateSharedNote();
  return (
    <IconActionButton
      label={label}
      icon={Share2}
      tone="notes"
      disabled={share.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        share.mutate({ content: "", refs: [item] });
      }}
    />
  );
}
