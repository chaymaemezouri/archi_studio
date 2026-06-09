import { Suspense } from "react";
import ProjectDetailPage from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProjectDetailPage />
    </Suspense>
  );
}
