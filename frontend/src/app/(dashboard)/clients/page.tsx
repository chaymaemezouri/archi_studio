import { Suspense } from "react";
import ClientsPage from "./ClientsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientsPage />
    </Suspense>
  );
}
