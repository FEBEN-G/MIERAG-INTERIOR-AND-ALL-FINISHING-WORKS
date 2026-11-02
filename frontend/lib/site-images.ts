import { images } from "@/lib/assets";
import { BRAND } from "@/lib/brand";

/** Every replaceable image on the public site. Keep in sync with backend/src/modules/settings/service.ts. */
export const SITE_IMAGE_SLOTS = [
  { id: "logo", label: "Logo", where: "Header, footer, and opening animation", src: BRAND.logoSrc },
  { id: "hero", label: "Homepage main photo", where: "Top of the homepage", src: images.hero.src },
  { id: "about1", label: "About: large photo", where: "About section", src: images.intro.src },
  { id: "about2", label: "About: small photo", where: "About section", src: images.detail.src },
  { id: "service-interior", label: "Service: interior finishing", where: "Services section", src: images.living.src },
  { id: "service-exterior", label: "Service: exterior finishing", where: "Services section", src: images.exterior.src },
  { id: "service-gypsum", label: "Service: gypsum and ceilings", where: "Services section", src: images.ceiling.src },
  { id: "service-tile", label: "Service: tile and flooring", where: "Services section", src: images.tile.src },
  { id: "service-painting", label: "Service: painting", where: "Services section", src: images.painting.src },
  { id: "service-renovation", label: "Service: renovation", where: "Services section", src: images.detail.src },
  { id: "before", label: "Before photo", where: "Before/after slider", src: images.construction.src },
  { id: "after", label: "After photo", where: "Before/after slider", src: images.living.src },
  { id: "galleryBanner", label: "Gallery banner", where: "Top of the gallery page", src: images.galleryHero.src },
  { id: "contactBackground", label: "Contact background", where: "Behind the contact section", src: images.galleryHero.src },
] as const;

export type ImageSlot = (typeof SITE_IMAGE_SLOTS)[number]["id"];

export function defaultImage(slot: ImageSlot): string {
  return SITE_IMAGE_SLOTS.find((item) => item.id === slot)?.src ?? "";
}
