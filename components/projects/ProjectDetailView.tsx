"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/types";
import { getSite } from "@/lib/api/sites";
import { useHire } from "@/components/hire/HireContext";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/ButtonLink";
import { compensationLabel, formatDate, mapsHref } from "@/lib/utils";

export function ProjectDetailView({ id }: { id: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openHire } = useHire();
  const { locale, t } = useI18n();
  const pay = {
    from: t.projects.from,
    upTo: t.projects.upTo,
    perDay: t.projects.perDay,
    paySite: t.projects.paySite,
  };

  useEffect(() => {
    getSite(id)
      .then(setSite)
      .catch(() => setError(t.projects.notFound));
  }, [id, t]);

  if (error) {
    return (
      <div className="px-6 py-32">
        <p className="text-sm text-error">{error}</p>
        <Link href="/projects" className="mt-6 inline-block text-sm text-ink underline">
          {t.projects.back}
        </Link>
      </div>
    );
  }

  if (!site) {
    return <p className="px-6 py-32 text-sm text-ink/80">{t.projects.loadingOne}</p>;
  }

  return (
    <article className="px-4 pt-24 pb-16 sm:px-6 sm:pt-28 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm text-gold-ink">{t.status[site.status]}</p>
        <h1 className="mt-4 font-display text-3xl leading-tight text-balance text-ink sm:text-5xl">{site.name}</h1>
        <p className="mt-4 text-ink/80">{site.address}</p>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden">
          <Image src={site.coverImageUrl} alt={site.name} fill sizes="100vw" className="object-cover" />
        </div>
        <p className="mt-10 max-w-2xl text-base leading-8 text-ink/85">{site.description}</p>
        <dl className="mt-10 grid gap-6 md:grid-cols-2">
          <Item label={t.projects.timeline} value={site.estimatedDuration} />
          <Item label={t.projects.start} value={formatDate(site.startDate, t.projects.pending, locale)} />
          <Item label={t.projects.expected} value={formatDate(site.expectedCompletionDate, t.projects.pending, locale)} />
          <Item label={t.projects.currentWorkers} value={String(site.currentWorkerCount)} />
          <Item
            label={t.projects.compensation}
            value={compensationLabel(site.compensationMin, site.compensationMax, site.compensationNote, pay)}
          />
          <Item
            label={t.projects.skills}
            value={site.requiredSkills
              .map((skill) => t.projects.skillNames[skill.slug as keyof typeof t.projects.skillNames] ?? skill.name)
              .join("፣ ")}
          />
        </dl>
        <a
          href={mapsHref(site.address, site.latitude, site.longitude)}
          className="mt-8 inline-block text-sm text-ink underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {t.projects.map}
        </a>
        <div className="mt-10">
          {site.isRecruiting ? (
            <Button onClick={() => openHire(site)}>{t.projects.hire}</Button>
          ) : (
            <p className="text-sm text-ink/70">{t.projects.closed}</p>
          )}
        </div>
      </div>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink/70">{label}</dt>
      <dd className="mt-2 text-sm text-ink">{value}</dd>
    </div>
  );
}
