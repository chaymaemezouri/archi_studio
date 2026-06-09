"use client";

import { Suspense, useState } from "react";
import { Building2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  accentBar,
  glassBtnPrimary,
  glassInput,
  glassPanel,
} from "@/lib/glass-styles";

function LoginForm() {
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className={cn(glassPanel, "overflow-hidden")}>
      <div className="border-b border-white/[0.06] px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <Building2 className="h-5 w-5 text-studio-light" strokeWidth={1.75} />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white/92">
          Architecture Studio
        </h1>
       
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-[11px] font-medium text-white/40">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(glassInput, "px-3")}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="text-[11px] font-medium text-white/40">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(glassInput, "px-3")}
            required
            autoComplete="current-password"
          />
        </div>

        {searchParams.get("redirect") && (
          <p className="rounded-lg border border-studio-border/30 bg-studio-muted/40 px-3 py-2 text-[11px] text-studio-light/80">
            Vous devez vous connecter pour accéder à cette page.
          </p>
        )}

        <button
          type="submit"
          disabled={isLoggingIn}
          className={cn(glassBtnPrimary, "mt-2 w-full")}
        >
          {isLoggingIn ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-studio-light/30 border-t-studio-light" />
              Connexion…
            </span>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>

     
    </div>
  );
}

function LoginFallback() {
  return (
    <div className={cn(glassPanel, "flex h-72 items-center justify-center")}>
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-studio-light/25 border-t-studio-light" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
