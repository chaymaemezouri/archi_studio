"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const INVITE_CODES = ["AMINI2026", "MAOUNI2026"] as const;

export default function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const code = inviteCode.trim().toUpperCase();
    if (!INVITE_CODES.includes(code as (typeof INVITE_CODES)[number])) {
      setError("Code invalide — utilisez AMINI2026 ou MAOUNI2026");
      return;
    }

    register({ inviteCode: code, name, email, password });
  };

  return (
    <Card className="border-dark-border shadow-2xl shadow-black/40">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-muted">
          <Building2 className="h-7 w-7 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Créer un compte</h1>
        <p className="mt-2 text-sm text-text-secondary">Rejoignez Architecture Studio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Code d'invitation"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="AMINI2026 ou MAOUNI2026"
          required
        />
        <Input
          label="Nom complet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jean Dupont"
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@cabinet.fr"
          required
          autoComplete="email"
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 caractères"
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" loading={isRegistering}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
