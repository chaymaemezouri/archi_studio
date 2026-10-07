"use client";

import { useEffect } from "react";
import DashboardSharedNotes from "@/components/dashboard/DashboardSharedNotes";
import { useMarkSharedNotesRead } from "@/hooks/useSharedNotes";

export default function DiscussionPage() {
  const markRead = useMarkSharedNotesRead();

  useEffect(() => {
    markRead.mutate();
    // Une seule fois à l’ouverture de la page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-2">
      <DashboardSharedNotes variant="page" />
    </div>
  );
}
