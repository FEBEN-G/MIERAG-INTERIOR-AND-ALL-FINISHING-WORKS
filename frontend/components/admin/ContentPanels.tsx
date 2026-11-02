"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { errorMessage } from "@/lib/api/client";
import {
  deleteService,
  reorderServices,
  saveService,
  updateSiteSettings,
  type AdminService,
  type ServiceInput,
  type SiteSettings,
  type SiteSettingsPatch,
} from "@/lib/api/content";
import { am, en } from "@/lib/i18n/dictionary";
import { HOME_SECTIONS, type SectionId } from "@/lib/site-images";
import { flattenText } from "@/lib/text-overrides";
import { cn } from "@/lib/utils";
import { Empty, Field } from "./Field";
import { ImagePicker, Thumbnail } from "./ImagePicker";

type PanelProps = {
  onError: (message: string) => void;
  onSaved: (message: string) => void;
};

/** Up and down buttons for a list the admin can put in order. */
export function MoveButtons({
  index,
  count,
  label,
  onMove,
}: {
  index: number;
  count: number;
  label: string;
  onMove: (from: number, to: number) => void;
}) {
  return (
    <div className="flex gap-1">
      <button type="button" disabled={index === 0} aria-label={`Move ${label} up`} className="rounded-md border border-line p-2 disabled:opacity-30" onClick={() => onMove(index, index - 1)}>
        <ArrowUp size={14} aria-hidden />
      </button>
      <button type="button" disabled={index === count - 1} aria-label={`Move ${label} down`} className="rounded-md border border-line p-2 disabled:opacity-30" onClick={() => onMove(index, index + 1)}>
        <ArrowDown size={14} aria-hidden />
      </button>
    </div>
  );
}

export function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

const emptyService: ServiceInput = {
  titleAm: "",
  titleEn: "",
  descriptionAm: "",
  descriptionEn: "",
  imageUrl: "",
  published: true,
};

export function ServicesPanel({
  services,
  onChange,
  onError,
  onSaved,
}: PanelProps & { services: AdminService[]; onChange: (services: AdminService[]) => void }) {
  const [draft, setDraft] = useState<ServiceInput>(emptyService);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function reset() {
    setEditing(null);
    setDraft(emptyService);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError("");
    try {
      const saved = await saveService(draft, editing ?? undefined);
      onChange(editing ? services.map((item) => (item.id === saved.id ? saved : item)) : [...services, saved]);
      onSaved(editing ? "Service updated." : "Service added.");
      reset();
    } catch (err) {
      onError(errorMessage(err, "The service could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function move(from: number, to: number) {
    onError("");
    try {
      onChange(await reorderServices(moved(services, from, to).map((item) => item.id)));
    } catch (err) {
      onError(errorMessage(err, "The order could not be saved."));
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,24rem)_1fr]">
      <form className="space-y-4 self-start rounded-lg border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
        <h2 className="text-base font-medium">{editing ? "Edit this service" : "Add a service"}</h2>
        <Field label="Title (Amharic)">
          <input className="field" value={draft.titleAm} onChange={(event) => setDraft({ ...draft, titleAm: event.target.value })} required />
        </Field>
        <Field label="Title (English)">
          <input className="field" value={draft.titleEn} onChange={(event) => setDraft({ ...draft, titleEn: event.target.value })} required />
        </Field>
        <Field label="Description (Amharic)">
          <textarea className="field min-h-24" value={draft.descriptionAm} onChange={(event) => setDraft({ ...draft, descriptionAm: event.target.value })} required />
        </Field>
        <Field label="Description (English)">
          <textarea className="field min-h-24" value={draft.descriptionEn} onChange={(event) => setDraft({ ...draft, descriptionEn: event.target.value })} required />
        </Field>
        <ImagePicker
          label="Photo"
          value={draft.imageUrl}
          onChange={(imageUrl) => setDraft((current) => ({ ...current, imageUrl }))}
          onError={onError}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} />
          Show this service on the public site
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50">
            {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
          </button>
          {editing ? (
            <button type="button" className="min-h-11 rounded-md border border-line px-4 text-sm" onClick={reset}>Cancel</button>
          ) : null}
        </div>
      </form>
      {services.length === 0 ? <Empty>No services yet. The Services section is hidden until you add one.</Empty> : (
        <ul className="divide-y divide-line self-start rounded-lg border border-line bg-surface">
          {services.map((service, index) => (
            <li key={service.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Thumbnail src={service.imageUrl} className="h-14 w-20" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{service.titleEn}</p>
                  <p className="text-sm text-ink/65">{service.titleAm}{service.published ? " · Visible" : " · Hidden"}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <MoveButtons index={index} count={services.length} label={service.titleEn} onMove={(from, to) => void move(from, to)} />
                <button
                  type="button"
                  className="rounded-md border border-line px-3 py-2 text-sm"
                  onClick={() => {
                    setEditing(service.id);
                    setDraft({
                      titleAm: service.titleAm,
                      titleEn: service.titleEn,
                      descriptionAm: service.descriptionAm,
                      descriptionEn: service.descriptionEn,
                      imageUrl: service.imageUrl,
                      published: service.published,
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-md border border-line px-3 py-2 text-sm text-error"
                  onClick={() => {
                    if (!window.confirm(`Remove “${service.titleEn}” from the site?`)) return;
                    deleteService(service.id)
                      .then(() => {
                        onChange(services.filter((item) => item.id !== service.id));
                        if (editing === service.id) reset();
                        onSaved("Service removed.");
                      })
                      .catch((err: unknown) => onError(errorMessage(err, "The service could not be removed.")));
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TEXT_GROUPS = [
  { id: "nav", label: "Menu and buttons" },
  { id: "hero", label: "Homepage top" },
  { id: "services", label: "Services section" },
  { id: "about", label: "About section" },
  { id: "portfolio", label: "Portfolio section" },
  { id: "transform", label: "Before and after" },
  { id: "projects", label: "Projects pages" },
  { id: "contact", label: "Contact section and footer" },
  { id: "gallery", label: "Gallery page" },
  { id: "hire", label: "Job application form" },
  { id: "status", label: "Project stages" },
  { id: "errors", label: "Error pages" },
] as const;

// These have their own sections in the studio.
const MANAGED_ELSEWHERE = ["services.items.", "gallery.items.", "projects.skillNames."];

const DEFAULTS = { en: flattenText(en), am: flattenText(am) };

const TEXT_ROWS = Object.keys(DEFAULTS.en).filter((path) => !MANAGED_ELSEWHERE.some((prefix) => path.startsWith(prefix)));

function rowLabel(path: string) {
  return path
    .split(".")
    .slice(1)
    .map((part) => (/^\d+$/.test(part) ? String(Number(part) + 1) : part.replace(/([A-Z])/g, " $1").toLowerCase()))
    .join(" ");
}

type Locale = "en" | "am";
type Edits = Record<Locale, Record<string, string>>;

export function WebsiteTextPanel({
  settings,
  onChange,
  onError,
  onSaved,
}: PanelProps & { settings: SiteSettings; onChange: (settings: SiteSettings) => void }) {
  const [edits, setEdits] = useState<Edits>({ en: {}, am: {} });
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const q = query.trim().toLowerCase();
  const editCount = Object.keys(edits.en).length + Object.keys(edits.am).length;
  const customCount = Object.keys(settings.text.en).length + Object.keys(settings.text.am).length;

  const rows = useMemo(
    () =>
      TEXT_ROWS.filter((path) => {
        if (!q) return true;
        const haystack = [
          path,
          DEFAULTS.en[path],
          DEFAULTS.am[path],
          settings.text.en[path],
          settings.text.am[path],
        ];
        return haystack.some((value) => value?.toLowerCase().includes(q));
      }),
    [q, settings.text],
  );

  const shown = (locale: Locale, path: string) => edits[locale][path] ?? settings.text[locale][path] ?? DEFAULTS[locale][path] ?? "";

  function setText(locale: Locale, path: string, value: string) {
    setEdits((current) => ({ ...current, [locale]: { ...current[locale], [path]: value } }));
  }

  async function save() {
    const text: NonNullable<SiteSettingsPatch["text"]> = { en: {}, am: {} };
    for (const locale of ["en", "am"] as const) {
      for (const [path, value] of Object.entries(edits[locale])) {
        // Text matching the default is stored as "no change", so later defaults still apply.
        (text[locale] as Record<string, string | null>)[path] = value === DEFAULTS[locale][path] ? null : value;
      }
    }
    setSaving(true);
    onError("");
    try {
      onChange(await updateSiteSettings({ text }));
      setEdits({ en: {}, am: {} });
      onSaved("Website text updated.");
    } catch (err) {
      onError(errorMessage(err, "The text could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-line bg-ivory py-3">
        <input className="field max-w-sm" placeholder="Search any word on the site" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="button" disabled={saving || editCount === 0} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50" onClick={() => void save()}>
          {saving ? "Saving…" : editCount === 0 ? "No changes to save" : `Save ${editCount} change${editCount === 1 ? "" : "s"}`}
        </button>
        <p className="text-xs text-ink/60">{customCount} item{customCount === 1 ? "" : "s"} differ from the original wording.</p>
      </div>
      {rows.length === 0 ? <Empty>No text matches this search.</Empty> : null}
      {TEXT_GROUPS.map((group) => {
        const groupRows = rows.filter((path) => path.startsWith(`${group.id}.`));
        if (groupRows.length === 0) return null;
        return (
          <details key={group.id} open={Boolean(q) || undefined} className="rounded-lg border border-line bg-surface">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
              {group.label} <span className="font-normal text-ink/55">({groupRows.length})</span>
            </summary>
            <div className="divide-y divide-line border-t border-line">
              {groupRows.map((path) => {
                const changed = (["en", "am"] as const).some((locale) => shown(locale, path) !== DEFAULTS[locale][path]);
                return (
                  <div key={path} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className={cn("text-xs text-ink/60", changed && "font-medium text-brand")}>
                        {rowLabel(path)}
                        {changed ? " · changed" : ""}
                      </p>
                      {changed ? (
                        <button
                          type="button"
                          className="text-xs text-ink/70 underline underline-offset-2"
                          onClick={() => {
                            setText("en", path, DEFAULTS.en[path] ?? "");
                            setText("am", path, DEFAULTS.am[path] ?? "");
                          }}
                        >
                          Use original
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {(["am", "en"] as const).map((locale) => {
                        const value = shown(locale, path);
                        return (
                          <label key={locale} className="block">
                            <span className="sr-only">{rowLabel(path)} in {locale === "am" ? "Amharic" : "English"}</span>
                            <textarea
                              className="field min-h-11 text-sm"
                              lang={locale}
                              rows={value.length > 70 ? 3 : 1}
                              value={value}
                              placeholder={locale === "am" ? "Amharic (empty hides it)" : "English (empty hides it)"}
                              onChange={(event) => setText(locale, path, event.target.value)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}

export function SectionsPanel({
  settings,
  onChange,
  onError,
  onSaved,
}: PanelProps & { settings: SiteSettings; onChange: (settings: SiteSettings) => void }) {
  async function toggle(id: SectionId, show: boolean) {
    const hiddenSections = show
      ? settings.hiddenSections.filter((item) => item !== id)
      : [...settings.hiddenSections, id];
    onError("");
    try {
      onChange(await updateSiteSettings({ hiddenSections }));
      onSaved(show ? "Section shown on the homepage." : "Section hidden from the homepage.");
    } catch (err) {
      onError(errorMessage(err, "The section could not be changed."));
    }
  }

  return (
    <ul className="max-w-xl divide-y divide-line rounded-lg border border-line bg-surface">
      {HOME_SECTIONS.map((section) => {
        const visible = !settings.hiddenSections.includes(section.id);
        return (
          <li key={section.id} className="px-4 py-3">
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>
                <span className="font-medium">{section.label}</span>
                <span className="block text-xs text-ink/60">{visible ? "Shown on the homepage" : "Hidden"}</span>
              </span>
              <input type="checkbox" className="size-5" checked={visible} onChange={(event) => void toggle(section.id, event.target.checked)} />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
