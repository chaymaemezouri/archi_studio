"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { detailBackLink, detailHeaderBar } from "./project-detail-ui";

/** Fil d'Ariane minimal — les actions vivent dans le panneau infos */
export default function ProjectDetailHeader() {
  return (
    <header className={detailHeaderBar}>
      <Link href="/projects" className={detailBackLink}>
        <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
        Retour aux projets
      </Link>
    </header>
  );
}
