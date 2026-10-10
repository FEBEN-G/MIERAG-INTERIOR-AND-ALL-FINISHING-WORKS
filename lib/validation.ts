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

  if (fullName.length < 2) errors.fullName = "Enter your full name (at least 2 characters).";
  if (fullName.length > 100) errors.fullName = "Name must be 100 characters or fewer.";

  if (!isValidEthiopianPhone(phoneNumber)) {
    errors.phoneNumber = "Use an Ethiopian mobile number such as +2519XXXXXXXX or +2517XXXXXXXX.";
  }

  if (!skillCategoryId) errors.skillCategoryId = "Select a skill category.";

  const expectedRate = Number(values.expectedRate);
  if (!Number.isInteger(expectedRate) || expectedRate < 0) {
    errors.expectedRate = "Enter a non-negative daily rate in ETB.";
  }

  const experienceYears = Number(values.experienceYears);
  if (!Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 50) {
    errors.experienceYears = "Experience must be a whole number between 0 and 50.";
  }

  if (experienceDetails.length > 2000) {
    errors.experienceDetails = "Please keep this under 2000 characters.";
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
