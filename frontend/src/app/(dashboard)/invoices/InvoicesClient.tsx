"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InvoicesRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "invoices");
    if (params.get("new") === "1") {
      params.delete("new");
      params.set("new", "invoice");
    }
    const qs = params.toString();
    router.replace(`/finances/quotes-invoices${qs ? `?${qs}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-studio-light border-t-transparent"
        aria-label="Redirection"
      />
    </div>
  );
}
