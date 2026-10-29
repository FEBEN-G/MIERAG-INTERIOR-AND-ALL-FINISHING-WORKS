"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/api/content";
import { isApiConfigured } from "@/lib/api/client";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/ButtonLink";

export function ContactForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isApiConfigured()) {
      setError(t.contact.unavailable);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await submitInquiry({ name, email, phone, message });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.contact.sendError);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="contact-cta max-w-md text-base leading-8 text-paper">{t.contact.sent}</p>;
  }

  return (
    <form className="contact-cta mt-8 grid max-w-xl gap-3" onSubmit={onSubmit}>
      <input className="field" placeholder={t.contact.name} value={name} onChange={(event) => setName(event.target.value)} required />
      <input className="field" type="email" placeholder={t.contact.email} value={email} onChange={(event) => setEmail(event.target.value)} required />
      <input className="field" placeholder={t.contact.phone} value={phone} onChange={(event) => setPhone(event.target.value)} />
      <textarea
        className="field min-h-28"
        placeholder={t.contact.message}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        required
      />
      {error ? <p className="text-sm text-gold-bright">{error}</p> : null}
      <Button type="submit" variant="light" disabled={loading} className="w-full sm:w-auto">
        {loading ? t.contact.sending : t.contact.send}
      </Button>
    </form>
  );
}
