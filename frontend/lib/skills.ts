import { am, type Dictionary } from "@/lib/i18n/dictionary";

/** Built-in skills are translated until the admin renames them; then the admin's name is shown. */
export function skillLabel(t: Dictionary, skill: { name: string; slug: string }) {
  const original: Record<string, string> = am.projects.skillNames;
  if (original[skill.slug] !== skill.name) return skill.name;
  const translated: Record<string, string> = t.projects.skillNames;
  return translated[skill.slug] ?? skill.name;
}
