import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export const dynamic = "force-dynamic";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      <Suspense fallback={null}>{children}</Suspense>
    </DashboardLayout>
  );
}
