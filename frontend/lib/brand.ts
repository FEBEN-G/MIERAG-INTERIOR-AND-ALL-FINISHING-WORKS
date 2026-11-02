import type { SectionId } from "@/lib/site-images";

export const BRAND = {
  name: "MIERAG INTERIOR AND ALL FINISHING WORKS",
  shortName: "MIERAG",
  slogan: "IN TO THE INFINITE HEIGHT",
  logoSrc: "/assets/brand/mierag-logo.png",
  logoAlt: "MIERAG INTERIOR AND ALL FINISHING WORKS emblem",
} as const;

type NavKey = "home" | "services" | "work" | "projects" | "about" | "contact";

export const NAV_ITEMS = [
  { href: "/", key: "home", index: "01" },
  { href: "/#services", key: "services", index: "02", section: "services" },
  { href: "/gallery", key: "work", index: "03" },
  { href: "/projects", key: "projects", index: "04" },
  { href: "/#about", key: "about", index: "05", section: "about" },
  { href: "/#contact", key: "contact", index: "06", section: "contact" },
] as { href: string; key: NavKey; index: string; section?: SectionId }[];
