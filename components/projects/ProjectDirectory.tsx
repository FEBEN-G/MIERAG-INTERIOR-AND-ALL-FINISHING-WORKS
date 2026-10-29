"use client";

import { useEffect, useState } from "react";
import { getAllSites, getSkills } from "@/lib/api/sites";
import { SITE_STATUSES, type SiteListResponse, type SiteStatus, type SkillCategory } from "@/types";
import { ProjectCard } from "./ProjectCard";
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
  // Every address seen so far, so typing a location does not shrink the suggestions.
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    getSkills().then(setSkills).catch(() => setSkills([]));
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      getAllSites({
        search: search || undefined,
        status: (status || undefined) as SiteStatus | undefined,
        skill: skill || undefined,
        location: location || undefined,
      })
        .then((next) => {
          setResult(next);
          setLocations((previous) => mergeLocations(previous, next.data.map((site) => site.address)));
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [search, status, skill, location]);

  const active = result?.data.filter((site) => site.status !== "COMPLETED") ?? [];
  const completed = result?.data.filter((site) => site.status === "COMPLETED") ?? [];

  function clearFilters() {
    setSearch("");
    setStatus("");
    setSkill("");
    setLocation("");
  }

  return (
    <div className="px-4 pt-24 pb-16 sm:px-6 sm:pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <SectionMark index="05" label={t.projects.eyebrow} />
        <h1 className="mt-5 max-w-4xl font-display text-3xl leading-tight text-balance text-ink sm:text-5xl lg:text-6xl">{t.projects.title}</h1>
        <p className="mt-6 max-w-xl text-base text-ink/85">{t.projects.body}</p>

        {result ? (
          <dl className="mt-12 grid grid-cols-2 gap-6 border-y border-line py-8 md:grid-cols-4">
            <Stat label={t.projects.listed} value={result.stats.total} />
            <Stat label={t.projects.activeStat} value={result.stats.active} />
            <Stat label={t.projects.recruiting} value={result.stats.recruiting} />
            <Stat label={t.projects.completedStat} value={result.stats.completed} />
          </dl>
        ) : null}

        {result?.meta.source === "preview" ? (
          <div className="mt-8">
            <p className="text-sm text-ink/80">{t.projects.preview}</p>
          </div>
        ) : null}

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="text-sm text-ink/80">{t.projects.search}</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="field mt-2" />
          </label>
          <label>
            <span className="text-sm text-ink/80">{t.projects.status}</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field mt-2">
              <option value="">{t.projects.all}</option>
              {SITE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t.status[item]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm text-ink/80">{t.projects.skill}</span>
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className="field mt-2">
              <option value="">{t.projects.all}</option>
              {skills.map((item) => (
                <option key={item.id} value={item.slug}>
                  {t.projects.skillNames[item.slug as keyof typeof t.projects.skillNames] ?? item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm text-ink/80">{t.projects.location}</span>
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
            {t.projects.clear}
          </Button>
        </div>

        {loading ? <p className="mt-12 text-sm text-ink/80">{t.projects.loading}</p> : null}
        {error ? <p className="mt-12 text-sm text-error">{t.projects.error}</p> : null}
        {!loading && !error && result && result.data.length === 0 ? (
          <p className="mt-12 text-sm text-ink/80">{t.projects.empty}</p>
        ) : null}

        {active.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-3xl leading-tight text-ink">{t.projects.active}</h2>
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              {active.map((site) => (
                <ProjectCard key={site.id} site={site} />
              ))}
            </div>
          </section>
        ) : null}

        {completed.length > 0 ? (
          <section className="mt-20">
            <h2 className="font-display text-3xl leading-tight text-ink">{t.projects.completed}</h2>
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

function mergeLocations(previous: string[], addresses: string[]) {
  const merged = Array.from(new Set([...previous, ...addresses])).sort();
  return merged.length === previous.length ? previous : merged;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-light">{value}</dd>
    </div>
  );
}
