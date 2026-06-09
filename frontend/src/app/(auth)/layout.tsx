import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app-shell p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[480px] w-[480px] rounded-full bg-app-glow-primary blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-app-glow-secondary blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-[400px]">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </div>
  );
}
