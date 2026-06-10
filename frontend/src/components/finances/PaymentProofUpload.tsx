"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadPaymentProof } from "@/lib/payment-proof-upload";
import { resolveMediaUrl } from "@/lib/assets";
import { paymentFieldClass } from "./payment-form-ui";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface PaymentProofUploadProps {
  proofUrl: string;
  onProofUrlChange: (url: string) => void;
}

export default function PaymentProofUpload({
  proofUrl,
  onProofUrlChange,
}: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const preview = resolveMediaUrl(proofUrl);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const url = await uploadPaymentProof(file);
      onProofUrlChange(url);
      toast.success("Justificatif ajouté");
    } catch {
      toast.error("Impossible d'envoyer l'image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-glass bg-[color:var(--glass-bg-hover)]/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Justificatif"
            className="max-h-40 w-full object-contain p-2"
          />
          <button
            type="button"
            onClick={() => onProofUrlChange("")}
            className="absolute right-2 top-2 rounded-md border border-glass bg-[color:var(--glass-bg)] p-1 text-glass-muted hover:text-glass"
            aria-label="Retirer le justificatif"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files[0]);
          }}
          disabled={uploading}
          className={cn(
            paymentFieldClass,
            "flex min-h-[88px] flex-col items-center justify-center gap-2 border-dashed text-center",
            dragOver && "border-studio-border/50 bg-[color:var(--glass-bg-hover)]",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-glass-muted" />
          ) : (
            <ImagePlus className="h-5 w-5 text-glass-muted" strokeWidth={1.5} />
          )}
          <span className="text-[12px] text-glass-muted">
            {uploading ? "Envoi…" : "Glisser une image ou cliquer (JPG, PNG…)"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <input
        type="url"
        className={paymentFieldClass}
        value={proofUrl}
        onChange={(e) => onProofUrlChange(e.target.value)}
        placeholder="Ou coller un lien https://…"
      />
    </div>
  );
}
