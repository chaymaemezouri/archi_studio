import { Suspense } from "react";
import ProjectsPage from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ProjectsPage />
    </Suspense>
  );
}
