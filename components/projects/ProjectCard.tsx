"use client";

import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/types";
import { useHire } from "@/components/hire/HireContext";
import { Button } from "@/components/ui/ButtonLink";
import { compensationLabel, formatDate, statusLabel } from "@/lib/utils";

export function ProjectCard({ site }: { site: Site }) {
  const { openHire } = useHire();

  return (
    <article className="border-b border-line pb-10">
      <Link href={`/projects/${site.id}`} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
          <Image
            src={site.coverImageUrl}
            alt={`${site.name} cover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{statusLabel(site.status)}</p>
            <h3 className="mt-2 text-lg tracking-tight text-balance sm:text-xl">{site.name}</h3>
          </div>
          {site.isPreview ? (
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Preview</span>
          ) : null}
        </div>
      </Link>
      <p className="mt-3 text-sm text-muted">{site.address}</p>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Timeline</dt>
          <dd className="mt-1">{site.estimatedDuration}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Workers</dt>
          <dd className="mt-1">{site.currentWorkerCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Completion</dt>
          <dd className="mt-1">{formatDate(site.expectedCompletionDate)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Compensation</dt>
          <dd className="mt-1">{compensationLabel(site.compensationMin, site.compensationMax, site.compensationNote)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted">
        {site.requiredSkills.map((skill) => skill.name).join(" · ")}
      </p>
      <div className="mt-6">
        {site.isRecruiting ? (
          <Button onClick={() => openHire(site)}>HIRE / ቅጥር</Button>
        ) : (
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Recruitment closed</p>
        )}
      </div>
    </article>
  );
}
