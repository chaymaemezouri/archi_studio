import { Suspense } from "react";
import TasksPage from "./TasksClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TasksPage />
    </Suspense>
  );
}
