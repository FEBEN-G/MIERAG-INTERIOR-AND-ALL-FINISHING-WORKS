"use client";

import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/types";
import { useHire } from "@/components/hire/HireContext";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Button } from "@/components/ui/ButtonLink";
import { compensationLabel, formatDate } from "@/lib/utils";

export function ProjectCard({ site }: { site: Site }) {
  const { openHire } = useHire();
  const { locale, t } = useI18n();
  const pay = {
    from: t.projects.from,
    upTo: t.projects.upTo,
    perDay: t.projects.perDay,
    paySite: t.projects.paySite,
  };

  return (
    <article className="border-b border-line pb-10">
      <Link href={`/projects/${site.id}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
          <Image
            src={site.coverImageUrl}
            alt={site.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gold-ink">{t.status[site.status]}</p>
            <h3 className="mt-2 font-display text-lg leading-snug text-balance text-ink sm:text-xl">{site.name}</h3>
          </div>
          {site.isPreview ? <span className="text-sm text-ink/70">{t.projects.previewTag}</span> : null}
        </div>
      </Link>
      <p className="mt-3 text-sm text-ink/80">{site.address}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm text-ink">
        <div>
          <dt className="text-sm text-ink/70">{t.projects.timeline}</dt>
          <dd className="mt-1">{site.estimatedDuration}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink/70">{t.projects.workers}</dt>
          <dd className="mt-1">{site.currentWorkerCount}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink/70">{t.projects.completion}</dt>
          <dd className="mt-1">{formatDate(site.expectedCompletionDate, t.projects.pending, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink/70">{t.projects.compensation}</dt>
          <dd className="mt-1">{compensationLabel(site.compensationMin, site.compensationMax, site.compensationNote, pay)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-ink/80">
        {site.requiredSkills
          .map((skill) => t.projects.skillNames[skill.slug as keyof typeof t.projects.skillNames] ?? skill.name)
          .join(" · ")}
      </p>
      <div className="mt-6">
        {site.isRecruiting ? (
          <Button onClick={() => openHire(site)}>{t.projects.hire}</Button>
        ) : (
          <p className="text-sm text-ink/70">{t.projects.closed}</p>
        )}
      </div>
    </article>
  );
}
