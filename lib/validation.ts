import { isValidEthiopianPhone, normalizeEthiopianPhone } from "./phone";
import type { ApplicationPayload } from "@/types";

export type FieldErrors = Record<string, string>;

export function validateApplication(
  values: Partial<ApplicationPayload>,
): { data: ApplicationPayload; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const fullName = (values.fullName ?? "").trim();
  const phoneNumber = (values.phoneNumber ?? "").trim();
  const skillCategoryId = values.skillCategoryId ?? "";
  const experienceDetails = (values.experienceDetails ?? "").trim();

  if (fullName.length < 2) errors.fullName = "nameShort";
  if (fullName.length > 100) errors.fullName = "nameLong";

  if (!isValidEthiopianPhone(phoneNumber)) {
    errors.phoneNumber = "phone";
  }

  if (!skillCategoryId) errors.skillCategoryId = "skill";

  const expectedRate = Number(values.expectedRate);
  if (!Number.isInteger(expectedRate) || expectedRate < 0) {
    errors.expectedRate = "rate";
  }

  const experienceYears = Number(values.experienceYears);
  if (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 50) {
    errors.experienceYears = "years";
  }

  if (experienceDetails.length > 2000) {
    errors.experienceDetails = "details";
  }

  const normalizedPhone = normalizeEthiopianPhone(phoneNumber) ?? phoneNumber;

  return {
    errors,
    data: {
      siteId: values.siteId ?? "",
      fullName,
      phoneNumber: normalizedPhone,
      skillCategoryId,
      expectedRate,
      experienceYears,
      experienceDetails: experienceDetails || undefined,
    },
  };
}
