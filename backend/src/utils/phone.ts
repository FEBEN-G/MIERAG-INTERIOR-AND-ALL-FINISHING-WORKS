const STRIP_PATTERN = /[\s\-()]/g;

/**
 * Accepts Ethiopian mobile numbers in common local and international forms
 * and normalizes them to +2519XXXXXXXX or +2517XXXXXXXX.
 */
export function normalizeEthiopianPhone(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const cleaned = input.trim().replace(STRIP_PATTERN, "");

  if (!cleaned) {
    return null;
  }

  if (/^\+251[97]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^0[97]\d{8}$/.test(cleaned)) {
    return `+251${cleaned.slice(1)}`;
  }

  if (/^[97]\d{8}$/.test(cleaned)) {
    return `+251${cleaned}`;
  }

  return null;
}
