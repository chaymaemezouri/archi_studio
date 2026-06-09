import { Suspense } from "react";
import QuotesInvoicesPage from "./QuotesInvoicesClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <QuotesInvoicesPage />
    </Suspense>
  );
}
