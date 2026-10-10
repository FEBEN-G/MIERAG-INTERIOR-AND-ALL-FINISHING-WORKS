"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/data/copy";
import { getSites } from "@/lib/api/sites";
import type { SiteListResponse } from "@/types";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { SectionMark } from "@/components/ui/SectionMark";

export function ProjectsSection() {
  const [result, setResult] = useState<SiteListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    getSites({ pageSize: 3 })
      .then(setResult)
      .catch(() => setError("Project listings are temporarily unavailable."));
  }, []);

  const recruiting = result?.data.filter((site) => site.isRecruiting).slice(0, 3) ?? [];

  return (
    <section id="projects" className="bg-ivory px-4 py-16 sm:px-6 sm:py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionMark index="05" label={t.projects.eyebrow} />
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <h2 className="font-display text-3xl font-light leading-none text-balance sm:text-5xl md:col-span-7 lg:text-6xl">
            {copy.projectsTitle}
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted md:col-span-5">{copy.projectsBody}</p>
        </div>
        {result?.meta.source === "preview" ? (
          <div className="mt-8">
            <PreviewNote>
              Showing preview site records until the API is connected. These are not live MIERAG projects.
            </PreviewNote>
          </div>
        ) : null}
        {error ? <p className="mt-10 text-sm text-error">{error}</p> : null}
        {!result && !error ? <p className="mt-10 text-sm text-muted">Loading current sites…</p> : null}
        <div className="mt-14 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {recruiting.map((site) => (
            <ProjectCard key={site.id} site={site} />
          ))}
        </div>
        <Link href="/projects" className="mt-12 inline-block text-[11px] uppercase tracking-[0.22em] underline-offset-4 hover:underline">
          Open the full project directory
        </Link>
      </div>
    </section>
  );
}
