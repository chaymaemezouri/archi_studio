import { detailSectionCard } from "./project-detail-ui";
import { cn } from "@/lib/utils";

interface ProjectSectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ProjectSectionCard({
  children,
  className,
}: ProjectSectionCardProps) {
  return <section className={cn(detailSectionCard, className)}>{children}</section>;
}
