"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api/applications";
import { isApiConfigured } from "@/lib/api/client";
import { Button } from "@/components/ui/ButtonLink";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminLogin(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-32">
      <h1 className="font-display text-4xl font-light">Administration</h1>
      {!isApiConfigured() ? (
        <p className="mt-6 text-sm text-warning">
          The API is not configured. Set NEXT_PUBLIC_API_URL and start the backend to use this screen.
        </p>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Email</span>
            <input className="field mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Password</span>
            <input
              className="field mt-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}
    </div>
  );
}
