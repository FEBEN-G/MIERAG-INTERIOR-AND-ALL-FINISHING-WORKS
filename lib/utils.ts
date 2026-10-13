export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value?: string | null, pending = "To be confirmed", locale: "en" | "am" = "en") {
  if (!value) return pending;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return pending;
  return new Intl.DateTimeFormat(locale === "am" ? "am-ET" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEtb(value?: number | null) {
  if (value === null || value === undefined) return null;
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function compensationLabel(
  min?: number | null,
  max?: number | null,
  note?: string | null,
  phrases?: { from: string; upTo: string; perDay: string; paySite: string },
) {
  const from = phrases?.from ?? "From";
  const upTo = phrases?.upTo ?? "Up to";
  const perDay = phrases?.perDay ?? "/ day";
  const paySite = phrases?.paySite ?? "Compensation confirmed on site";
  if (min != null && max != null) {
    return `${formatEtb(min)} – ${formatEtb(max)} ${perDay}`;
  }
  if (min != null) return `${from} ${formatEtb(min)} ${perDay}`;
  if (max != null) return `${upTo} ${formatEtb(max)} ${perDay}`;
  return note ?? paySite;
}

export function statusLabel(status: string) {
  switch (status) {
    case "STRUCTURAL_WORK":
      return "Structural Work";
    case "ROUGH_IN":
      return "Rough-In";
    case "FINAL_FINISHING":
      return "Final Finishing";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

export function mapsHref(address: string, lat?: number | null, lng?: number | null) {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
