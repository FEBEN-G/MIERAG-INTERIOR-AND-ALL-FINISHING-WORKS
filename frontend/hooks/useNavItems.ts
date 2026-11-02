"use client";

import { NAV_ITEMS } from "@/lib/brand";
import { useSiteSettings } from "@/lib/site-settings";

/** The site's navigation, without links to sections the admin has hidden. */
export function useNavItems() {
  const { settings } = useSiteSettings();
  return NAV_ITEMS.filter((item) => !item.section || !settings.hiddenSections.includes(item.section));
}
