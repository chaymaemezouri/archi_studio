export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#07070b] p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[480px] w-[480px] rounded-full bg-studio-light/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-studio-light/[0.03] blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-[400px]">{children}</div>
    </div>
  );
}
