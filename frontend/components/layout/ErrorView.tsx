"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function ErrorView({ kind, onRetry }: { kind: "notFound" | "error"; onRetry?: () => void }) {
  const { t } = useI18n();
  const copy = kind === "notFound"
    ? { title: t.errors.notFoundTitle, body: t.errors.notFoundBody }
    : { title: t.errors.errorTitle, body: t.errors.errorBody };

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-2xl flex-col justify-center px-6 py-32">
      <h1 className="font-display text-3xl leading-tight text-ink sm:text-5xl">{copy.title}</h1>
      <p className="mt-5 text-base leading-8 text-ink/85">{copy.body}</p>
      <div className="mt-8 flex flex-wrap items-center gap-5 text-sm">
        {onRetry ? (
          <button type="button" onClick={onRetry} className="min-h-11 bg-ink px-5 text-ivory">
            {t.errors.retry}
          </button>
        ) : null}
        <Link href="/" className="text-ink underline underline-offset-4">
          {t.errors.home}
        </Link>
      </div>
    </div>
  );
}
