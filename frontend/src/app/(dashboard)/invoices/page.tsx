import { Suspense } from "react";
import InvoicesPage from "./InvoicesClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvoicesPage />
    </Suspense>
  );
}
