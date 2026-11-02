import { images } from "@/lib/assets";
import { BRAND } from "@/lib/brand";

/** Every replaceable image on the public site. Keep in sync with backend/src/modules/settings/service.ts. */
export const SITE_IMAGE_SLOTS = [
  { id: "logo", label: "Logo", where: "Header, footer, and opening animation", src: BRAND.logoSrc },
  { id: "hero", label: "Homepage main photo", where: "Top of the homepage", src: images.hero.src },
  { id: "about1", label: "About: large photo", where: "About section", src: images.intro.src },
  { id: "about2", label: "About: small photo", where: "About section", src: images.detail.src },
  { id: "before", label: "Before photo", where: "Before/after slider", src: images.construction.src },
  { id: "after", label: "After photo", where: "Before/after slider", src: images.living.src },
  { id: "galleryBanner", label: "Gallery banner", where: "Top of the gallery page", src: images.galleryHero.src },
  { id: "contactBackground", label: "Contact background", where: "Behind the contact section", src: images.galleryHero.src },
] as const;

/** Homepage sections that can be hidden. Keep in sync with backend/src/modules/settings/service.ts. */
export const HOME_SECTIONS = [
  { id: "services", label: "Services" },
  { id: "about", label: "About" },
  { id: "work", label: "Portfolio" },
  { id: "transformation", label: "Before and after" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof HOME_SECTIONS)[number]["id"];

export type ImageSlot = (typeof SITE_IMAGE_SLOTS)[number]["id"];

export function defaultImage(slot: ImageSlot): string {
  return SITE_IMAGE_SLOTS.find((item) => item.id === slot)?.src ?? "";
}
