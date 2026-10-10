"use client";

import { useEffect, useMemo, useState } from "react";
import { copy } from "@/lib/data/copy";
import { getSites, getSkills } from "@/lib/api/sites";
import { SITE_STATUSES, type SiteListResponse, type SiteStatus, type SkillCategory } from "@/types";
import { statusLabel } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { Button } from "@/components/ui/ButtonLink";
import { SectionMark } from "@/components/ui/SectionMark";
import { useI18n } from "@/components/i18n/LanguageProvider";

export function ProjectDirectory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<SiteListResponse | null>(null);
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    getSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      getSites({
        search: search || undefined,
        status: (status || undefined) as SiteStatus | undefined,
        skill: skill || undefined,
        location: location || undefined,
      })
        .then(setResult)
        .catch(() => setError("Projects could not be loaded."))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [search, status, skill, location]);

  const locations = useMemo(
    () => Array.from(new Set((result?.data ?? []).map((site) => site.address))).sort(),
    [result],
  );

  const active = result?.data.filter((site) => site.status !== "COMPLETED") ?? [];
  const completed = result?.data.filter((site) => site.status === "COMPLETED") ?? [];

  function clearFilters() {
    setSearch("");
    setStatus("");
    setSkill("");
    setLocation("");
  }

  return (
    <div className="px-6 pb-24 pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionMark index="05" label={t.projects.eyebrow} />
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-light sm:text-5xl lg:text-6xl">{copy.projectsTitle}</h1>
        <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{copy.projectsBody}</p>

        {result ? (
          <dl className="mt-12 grid grid-cols-2 gap-6 border-y border-line py-8 md:grid-cols-4">
            <Stat label="Listed sites" value={result.stats.total} />
            <Stat label="Active" value={result.stats.active} />
            <Stat label="Recruiting" value={result.stats.recruiting} />
            <Stat label="Completed" value={result.stats.completed} />
          </dl>
        ) : null}

        {result?.meta.source === "preview" ? (
          <div className="mt-8">
            <PreviewNote>
              These counts and records come from preview data until the backend is connected. They are not live MIERAG
              project statistics.
            </PreviewNote>
          </div>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Search</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="field mt-2" />
          </label>
          <label>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field mt-2">
              <option value="">All</option>
              {SITE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {statusLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Skill</span>
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className="field mt-2">
              <option value="">All</option>
              {skills.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="locations"
              className="field mt-2"
            />
            <datalist id="locations">
              {locations.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
        </div>
        <div className="mt-4">
          <Button variant="line" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>

        {loading ? <p className="mt-12 text-sm text-muted">Loading projects…</p> : null}
        {error ? <p className="mt-12 text-sm text-error">{error}</p> : null}
        {!loading && !error && result && result.data.length === 0 ? (
          <p className="mt-12 text-sm text-muted">No projects match the current filters.</p>
        ) : null}

        {active.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-3xl font-light">Active construction projects</h2>
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              {active.map((site) => (
                <ProjectCard key={site.id} site={site} />
              ))}
            </div>
          </section>
        ) : null}

        {completed.length > 0 ? (
          <section className="mt-20">
            <h2 className="font-display text-3xl font-light">Completed projects</h2>
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              {completed.map((site) => (
                <ProjectCard key={site.id} site={site} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-light">{value}</dd>
    </div>
  );
}
