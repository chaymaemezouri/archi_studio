import { Suspense } from "react";
import ClientDetailPage from "./ClientDetailClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClientDetailPage />
    </Suspense>
  );
}
