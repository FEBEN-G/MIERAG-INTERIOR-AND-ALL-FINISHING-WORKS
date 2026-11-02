import type { Dictionary } from "@/lib/i18n/dictionary";

type Tree = { [key: string]: Tree | string } | Array<Tree | string>;

/** Turns the nested dictionary into { "hero.support": "…", "hero.lines.0": "…" }. */
export function flattenText(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value === "string") return { [prefix]: value };
  if (!value || typeof value !== "object") return {};
  return Object.entries(value).reduce<Record<string, string>>(
    (all, [key, child]) => ({ ...all, ...flattenText(child, prefix ? `${prefix}.${key}` : key) }),
    {},
  );
}

/** Returns the dictionary with the admin's wording applied. Paths that no longer exist are ignored. */
export function applyTextOverrides(dictionary: Dictionary, overrides: Record<string, string>): Dictionary {
  const entries = Object.entries(overrides);
  if (entries.length === 0) return dictionary;

  const result = structuredClone(dictionary) as unknown as Tree;
  for (const [path, value] of entries) {
    const keys = path.split(".");
    const last = keys.pop() as string;
    let node: unknown = result;
    for (const key of keys) {
      node = (node as Record<string, unknown> | undefined)?.[key];
    }
    const parent = node as Record<string, unknown> | undefined;
    if (typeof parent?.[last] === "string") parent[last] = value;
  }
  return result as unknown as Dictionary;
}
