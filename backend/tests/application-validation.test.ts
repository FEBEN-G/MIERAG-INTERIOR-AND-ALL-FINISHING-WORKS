import { describe, expect, it } from "vitest";
import { validateApplicationInput } from "../src/modules/applications/validation";

const VALID_SITE_ID = "11111111-1111-4111-8111-111111111111";
const VALID_SKILL_ID = "22222222-2222-4222-8222-222222222222";

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    siteId: VALID_SITE_ID,
    fullName: "Abebe Bekele",
    phoneNumber: "0911234567",
    skillCategoryId: VALID_SKILL_ID,
    expectedRate: 900,
    experienceYears: 4,
    experienceDetails: "Gypsum and painting on residential interiors.",
    ...overrides,
  };
}

describe("validateApplicationInput", () => {
  it("accepts a valid payload and normalizes the phone number", () => {
    const result = validateApplicationInput(validPayload());
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phoneNumber).toBe("+251911234567");
      expect(result.data.fullName).toBe("Abebe Bekele");
      expect(result.data.expectedRate).toBe(900);
      expect(result.data.experienceYears).toBe(4);
    }
  });

  it("rejects a missing or short full name", () => {
    const missing = validateApplicationInput(validPayload({ fullName: "" }));
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.fields.fullName).toBeTruthy();
    }

    const short = validateApplicationInput(validPayload({ fullName: "A" }));
    expect(short.success).toBe(false);
    if (!short.success) {
      expect(short.fields.fullName).toBeTruthy();
    }
  });

  it("rejects a full name longer than 100 characters", () => {
    const result = validateApplicationInput(validPayload({ fullName: "A".repeat(101) }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fields.fullName).toBeTruthy();
    }
  });

  it("rejects an invalid Ethiopian phone number", () => {
    const result = validateApplicationInput(validPayload({ phoneNumber: "0811234567" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fields.phoneNumber).toContain("Ethiopian mobile");
    }
  });

  it("rejects a missing siteId", () => {
    const { siteId: _ignored, ...rest } = validPayload();
    const result = validateApplicationInput(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fields.siteId).toBeTruthy();
    }
  });

  it("rejects a missing skillCategoryId", () => {
    const { skillCategoryId: _ignored, ...rest } = validPayload();
    const result = validateApplicationInput(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fields.skillCategoryId).toBeTruthy();
    }
  });

  it("rejects a negative expected rate and a non-integer rate", () => {
    const negative = validateApplicationInput(validPayload({ expectedRate: -1 }));
    expect(negative.success).toBe(false);
    if (!negative.success) {
      expect(negative.fields.expectedRate).toBeTruthy();
    }

    const decimal = validateApplicationInput(validPayload({ expectedRate: 10.5 }));
    expect(decimal.success).toBe(false);
    if (!decimal.success) {
      expect(decimal.fields.expectedRate).toBeTruthy();
    }
  });

  it("rejects experienceYears outside 0–50", () => {
    const tooHigh = validateApplicationInput(validPayload({ experienceYears: 51 }));
    expect(tooHigh.success).toBe(false);
    if (!tooHigh.success) {
      expect(tooHigh.fields.experienceYears).toBeTruthy();
    }

    const negative = validateApplicationInput(validPayload({ experienceYears: -2 }));
    expect(negative.success).toBe(false);
    if (!negative.success) {
      expect(negative.fields.experienceYears).toBeTruthy();
    }
  });

  it("rejects experienceDetails longer than 2000 characters", () => {
    const result = validateApplicationInput(
      validPayload({ experienceDetails: "x".repeat(2001) }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fields.experienceDetails).toBeTruthy();
    }
  });

  it("treats blank experienceDetails as omitted", () => {
    const result = validateApplicationInput(validPayload({ experienceDetails: "   " }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experienceDetails).toBeUndefined();
    }
  });

  it("rejects a non-object body", () => {
    const result = validateApplicationInput(null);
    expect(result.success).toBe(false);
  });
});
