"use client";

import type { LucideIcon } from "lucide-react";
import ProjectTabSectionHeader from "@/components/projects/detail/ProjectTabSectionHeader";
import { detailChecklistSection, detailChecklistTitle } from "./client-detail-ui";
import type { IconActionTone } from "@/components/projects/detail/IconActionButton";

interface ClientTabSectionProps {
  title: string;
  count?: number;
  action?: {
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
    href?: string;
    tone?: IconActionTone;
  };
  children: React.ReactNode;
  className?: string;
}

export default function ClientTabSection({
  title,
  count,
  action,
  children,
  className,
}: ClientTabSectionProps) {
  return (
    <section className={className ?? detailChecklistSection}>
      {action ? (
        <ProjectTabSectionHeader title={title} count={count} action={action} />
      ) : (
        <h2 className={detailChecklistTitle}>{title}</h2>
      )}
      {children}
    </section>
  );
}
