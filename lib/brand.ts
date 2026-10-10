export const BRAND = {
  name: "MIERAG INTERIOR AND ALL FINISHING WORKS",
  shortName: "MIERAG",
  slogan: "IN TO THE INFINITE HEIGHT",
  logoSrc: "/assets/brand/mierag-logo.png",
  logoAlt: "MIERAG INTERIOR AND ALL FINISHING WORKS emblem",
  phone: "Phone to be supplied",
  email: "Email to be supplied",
} as const;

export const NAV_ITEMS: { href: string; label: string; index: string }[] = [
  { href: "/", label: "Home", index: "01" },
  { href: "/#services", label: "Our Services", index: "02" },
  { href: "/gallery", label: "Our Work", index: "03" },
  { href: "/projects", label: "Projects & Opportunities", index: "04" },
  { href: "/#about", label: "About Us", index: "05" },
  { href: "/#contact", label: "Contact", index: "06" },
];
