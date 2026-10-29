"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin, getAdminSession } from "@/lib/api/applications";
import { isApiConfigured } from "@/lib/api/client";
import { BRAND } from "@/lib/brand";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((session) => {
        if (active && session.data) router.replace("/admin");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminLogin(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-app grid min-h-svh place-items-center bg-ivory px-4 py-10 text-ink">
      <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 sm:p-8">
        <p className="text-xs font-medium text-gold-ink">MIERAG</p>
        <h1 className="mt-2 text-2xl font-medium">Studio sign in</h1>
        <p className="mt-2 text-sm text-ink/70">Use this page to manage photos, projects, and messages. It is separate from the public website.</p>
        {!isApiConfigured() ? (
          <p className="mt-6 text-sm text-warning">
            The studio cannot reach the server yet. Start the backend, then open this page again.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input className="field mt-1.5" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Password</span>
              <input
                className="field mt-1.5"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button type="submit" disabled={loading} className="min-h-11 w-full rounded-md bg-ink text-sm text-ivory disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
        <p className="mt-6 text-xs text-ink/50">{BRAND.name}</p>
      </div>
    </div>
  );
}
