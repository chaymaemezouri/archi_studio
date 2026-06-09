"use client";

import type { LucideIcon } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import {
  detailIconActionBtn,
  detailIconActionBtnDanger,
  detailIconActionBtnDownload,
  detailIconActionBtnNotes,
  detailIconActionBtnSuccess,
  detailIconActionBtnUpload,
  detailIconActionBtnView,
} from "./project-detail-ui";
import { cn } from "@/lib/utils";

type IconActionVariant = "default" | "success" | "danger";
export type IconActionTone =
  | "default"
  | "view"
  | "download"
  | "upload"
  | "notes"
  | "success"
  | "danger";

const variantClasses: Record<IconActionVariant, string> = {
  default: detailIconActionBtn,
  success: detailIconActionBtnSuccess,
  danger: detailIconActionBtnDanger,
};

const toneClasses: Record<IconActionTone, string> = {
  default: detailIconActionBtn,
  view: detailIconActionBtnView,
  download: detailIconActionBtnDownload,
  upload: detailIconActionBtnUpload,
  notes: detailIconActionBtnNotes,
  success: detailIconActionBtnSuccess,
  danger: detailIconActionBtnDanger,
};

interface IconActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  download?: boolean;
  disabled?: boolean;
  variant?: IconActionVariant;
  tone?: IconActionTone;
  className?: string;
  target?: string;
  rel?: string;
}

export default function IconActionButton({
  label,
  icon: Icon,
  onClick,
  href,
  download,
  disabled,
  variant = "default",
  tone = "default",
  className,
  target,
  rel,
}: IconActionButtonProps) {
  const useVariantStyle = variant !== "default";
  const classes = cn(
    useVariantStyle ? variantClasses[variant] : toneClasses[tone],
    className
  );

  if (href) {
    return (
      <Tooltip label={label}>
        <a
          href={href}
          download={download || undefined}
          target={target}
          rel={rel}
          aria-label={label}
          className={classes}
        >
          <Icon className="h-3 w-3" aria-hidden />
        </a>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={classes}
      >
        <Icon className="h-3 w-3" aria-hidden />
      </button>
    </Tooltip>
  );
}
