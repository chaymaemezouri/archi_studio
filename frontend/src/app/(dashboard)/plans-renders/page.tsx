import { Suspense } from "react";
import PlansRendersPage from "./PlansRendersClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PlansRendersPage />
    </Suspense>
  );
}
