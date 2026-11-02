"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api/applications";
import { errorMessage } from "@/lib/api/client";
import { saveSkill, updateSiteSettings, type AdminSkill, type SiteSettings } from "@/lib/api/content";
import { defaultImage, SITE_IMAGE_SLOTS, type ImageSlot } from "@/lib/site-images";
import { Empty, Field } from "./Field";
import { Thumbnail, UploadButton } from "./ImagePicker";

type PanelProps = {
  onError: (message: string) => void;
  onSaved: (message: string) => void;
};

export function SiteImagesPanel({
  settings,
  onChange,
  onError,
  onSaved,
}: PanelProps & { settings: SiteSettings; onChange: (settings: SiteSettings) => void }) {
  const [busy, setBusy] = useState<ImageSlot | null>(null);

  async function setImage(slot: ImageSlot, url: string | null) {
    setBusy(slot);
    onError("");
    try {
      onChange(await updateSiteSettings({ images: { [slot]: url } }));
      onSaved(url ? "Image replaced on the site." : "Default image restored.");
    } catch (err) {
      onError(errorMessage(err, "The image could not be saved."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {SITE_IMAGE_SLOTS.map((slot) => {
        const custom = settings.images[slot.id];
        return (
          <li key={slot.id} className="flex flex-col rounded-lg border border-line bg-surface p-3">
            <Thumbnail src={custom ?? defaultImage(slot.id)} contain={slot.id === "logo"} className="aspect-[16/10] w-full" />
            <p className="mt-3 text-sm font-medium">{slot.label}</p>
            <p className="text-xs text-ink/60">
              {slot.where}
              {custom ? " · Your photo" : " · Default"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <UploadButton label="Replace" onUploaded={(url) => setImage(slot.id, url)} onError={onError} />
              {custom ? (
                <button
                  type="button"
                  disabled={busy === slot.id}
                  className="min-h-10 rounded-md border border-line px-3 text-sm hover:border-ink disabled:opacity-50"
                  onClick={() => {
                    if (window.confirm(`Go back to the default image for “${slot.label}”?`)) void setImage(slot.id, null);
                  }}
                >
                  Restore default
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteDetailsPanel({
  settings,
  onChange,
  onError,
  onSaved,
}: PanelProps & { settings: SiteSettings; onChange: (settings: SiteSettings) => void }) {
  const [draft, setDraft] = useState(settings.contact);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    onError("");
    try {
      onChange(await updateSiteSettings({ contact: draft }));
      onSaved("Contact details updated on the site.");
    } catch (err) {
      onError(errorMessage(err, "The details could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="max-w-lg space-y-4 rounded-lg border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
      <Field label="Company name" hint="Leave empty to keep the standard name.">
        <input className="field" value={draft.companyName} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} />
      </Field>
      <Field label="Phone" hint="Shown at the top of every page, for example +251 91 123 4567.">
        <input className="field" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
      </Field>
      <Field label="Email">
        <input className="field" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
      </Field>
      <Field label="Studio address">
        <input className="field" value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} />
      </Field>
      <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50">
        {saving ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

export function SkillsPanel({
  skills,
  onChange,
  onError,
  onSaved,
}: PanelProps & { skills: AdminSkill[]; onChange: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);

  async function run(action: () => Promise<unknown>, message: string) {
    onError("");
    try {
      await action();
      await onChange();
      onSaved(message);
      return true;
    } catch (err) {
      onError(errorMessage(err, "The skill could not be saved."));
      return false;
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        className="space-y-4 self-start rounded-lg border border-line bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void run(() => saveSkill({ name }), "Skill added.").then((ok) => {
            if (ok) setName("");
          });
        }}
      >
        <h2 className="text-base font-medium">Add a skill</h2>
        <Field label="Name" hint="Workers choose this when they apply.">
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <button type="submit" className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory">Add skill</button>
      </form>
      {skills.length === 0 ? <Empty>No skills yet.</Empty> : (
        <ul className="divide-y divide-line self-start rounded-lg border border-line bg-surface">
          {skills.map((skill) => (
            <li key={skill.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              {renaming?.id === skill.id ? (
                <form
                  className="flex min-w-0 flex-1 gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void run(() => saveSkill({ name: renaming.name }, skill.id), "Skill renamed.").then((ok) => {
                      if (ok) setRenaming(null);
                    });
                  }}
                >
                  <input
                    className="field"
                    aria-label={`New name for ${skill.name}`}
                    value={renaming.name}
                    onChange={(event) => setRenaming({ id: skill.id, name: event.target.value })}
                    required
                  />
                  <button type="submit" className="rounded-md bg-ink px-3 text-sm text-ivory">Save</button>
                  <button type="button" className="rounded-md border border-line px-3 text-sm" onClick={() => setRenaming(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <p className="text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-ink/65">{skill.isActive ? " · On" : " · Off (hidden from workers)"}</span>
                  </p>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-md border border-line px-3 py-2 text-sm" onClick={() => setRenaming({ id: skill.id, name: skill.name })}>Rename</button>
                    <button
                      type="button"
                      className="rounded-md border border-line px-3 py-2 text-sm"
                      onClick={() => void run(() => saveSkill({ isActive: !skill.isActive }, skill.id), skill.isActive ? "Skill turned off." : "Skill turned on.")}
                    >
                      {skill.isActive ? "Turn off" : "Turn on"}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountPanel({ onError, onSaved }: PanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== repeat) {
      onError("The two new passwords do not match.");
      return;
    }
    setSaving(true);
    onError("");
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setRepeat("");
      onSaved("Password changed.");
    } catch (err) {
      onError(errorMessage(err, "The password could not be changed."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="max-w-lg space-y-4 rounded-lg border border-line bg-surface p-4" onSubmit={(event) => void onSubmit(event)}>
      <h2 className="text-base font-medium">Change password</h2>
      <Field label="Current password">
        <input className="field" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
      </Field>
      <Field label="New password" hint="At least 10 characters.">
        <input className="field" type="password" autoComplete="new-password" minLength={10} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
      </Field>
      <Field label="Repeat new password">
        <input className="field" type="password" autoComplete="new-password" minLength={10} value={repeat} onChange={(event) => setRepeat(event.target.value)} required />
      </Field>
      <button type="submit" disabled={saving} className="min-h-11 rounded-md bg-ink px-4 text-sm text-ivory disabled:opacity-50">
        {saving ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
