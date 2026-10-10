const LOCAL_MOBILE = /^(?:0)?([97]\d{8})$/;
const E164_MOBILE = /^\+251([97]\d{8})$/;

export function normalizeEthiopianPhone(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  const e164 = compact.match(E164_MOBILE);
  if (e164) return `+251${e164[1]}`;
  const local = compact.match(LOCAL_MOBILE);
  if (local) return `+251${local[1]}`;
  return null;
}

export function isValidEthiopianPhone(input: string) {
  return normalizeEthiopianPhone(input) !== null;
}
