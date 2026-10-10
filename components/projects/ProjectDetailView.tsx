"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/types";
import { getSite } from "@/lib/api/sites";
import { useHire } from "@/components/hire/HireContext";
import { Button } from "@/components/ui/ButtonLink";
import { compensationLabel, formatDate, mapsHref, statusLabel } from "@/lib/utils";

export function ProjectDetailView({ id }: { id: string }) {
  const [site, setSite] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { openHire } = useHire();

  useEffect(() => {
    getSite(id)
      .then(setSite)
      .catch((err) => setError(err instanceof Error ? err.message : "Project not found."));
  }, [id]);

  if (error) {
    return (
      <div className="px-6 py-32">
        <p className="text-sm text-error">{error}</p>
        <Link href="/projects" className="mt-6 inline-block text-sm underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!site) {
    return <p className="px-6 py-32 text-sm text-muted">Loading project…</p>;
  }

  return (
    <article className="px-4 pt-24 pb-16 sm:px-6 sm:pt-28 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{statusLabel(site.status)}</p>
        <h1 className="mt-4 font-display text-3xl font-light text-balance sm:text-5xl">{site.name}</h1>
        <p className="mt-4 text-muted">{site.address}</p>
        <div className="relative mt-10 aspect-[16/9] overflow-hidden">
          <Image src={site.coverImageUrl} alt={`${site.name} cover`} fill sizes="100vw" className="object-cover" />
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-8 text-muted">{site.description}</p>
        <dl className="mt-10 grid gap-6 md:grid-cols-2">
          <Item label="Timeline" value={site.estimatedDuration} />
          <Item label="Start" value={formatDate(site.startDate)} />
          <Item label="Expected completion" value={formatDate(site.expectedCompletionDate)} />
          <Item label="Current workers" value={String(site.currentWorkerCount)} />
          <Item
            label="Compensation"
            value={compensationLabel(site.compensationMin, site.compensationMax, site.compensationNote) ?? "—"}
          />
          <Item label="Skills" value={site.requiredSkills.map((skill) => skill.name).join(", ")} />
        </dl>
        <a
          href={mapsHref(site.address, site.latitude, site.longitude)}
          className="mt-8 inline-block text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Open map
        </a>
        <div className="mt-10">
          {site.isRecruiting ? (
            <Button onClick={() => openHire(site)}>HIRE / ቅጥር</Button>
          ) : (
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Recruitment closed</p>
          )}
        </div>
      </div>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-2 text-sm">{value}</dd>
    </div>
  );
}
