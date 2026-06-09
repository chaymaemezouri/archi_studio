import { Suspense } from "react";
import ActivityPage from "./ActivityClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivityPage />
    </Suspense>
  );
}
