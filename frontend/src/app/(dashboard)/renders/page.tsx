"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RendersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/plans-renders");
  }, [router]);

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-studio-light border-t-transparent"
        aria-label="Redirection"
      />
    </div>
  );
}
