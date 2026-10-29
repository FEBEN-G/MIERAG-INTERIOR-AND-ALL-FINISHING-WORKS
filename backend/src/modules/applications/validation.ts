import { z } from "zod";
import { normalizeEthiopianPhone } from "../../utils/phone";

const applicationInputSchema = z.object({
  siteId: z
    .string({ required_error: "A project is required." })
    .uuid("A project is required."),
  fullName: z
    .string({ required_error: "Full name is required and must be 2–100 characters." })
    .trim()
    .min(2, "Full name is required and must be 2–100 characters.")
    .max(100, "Full name is required and must be 2–100 characters."),
  phoneNumber: z.string({ required_error: "Enter a valid Ethiopian mobile number." }),
  skillCategoryId: z
    .string({ required_error: "A skill category is required." })
    .uuid("A skill category is required."),
  expectedRate: z
    .number({
      required_error: "Expected daily rate must be a non-negative integer.",
      invalid_type_error: "Expected daily rate must be a non-negative integer.",
    })
    .int("Expected daily rate must be a non-negative integer.")
    .nonnegative("Expected daily rate must be a non-negative integer."),
  experienceYears: z
    .number({
      required_error: "Years of experience must be an integer between 0 and 50.",
      invalid_type_error: "Years of experience must be an integer between 0 and 50.",
    })
    .int("Years of experience must be an integer between 0 and 50.")
    .min(0, "Years of experience must be an integer between 0 and 50.")
    .max(50, "Years of experience must be an integer between 0 and 50."),
  experienceDetails: z
    .string()
    .max(2000, "Experience details must be at most 2000 characters.")
    .optional(),
});

export type ValidatedApplicationInput = {
  siteId: string;
  fullName: string;
  phoneNumber: string;
  skillCategoryId: string;
  expectedRate: number;
  experienceYears: number;
  experienceDetails?: string;
};

export type ApplicationValidationResult =
  | { success: true; data: ValidatedApplicationInput }
  | { success: false; message: string; fields: Record<string, string> };

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function validateApplicationInput(body: unknown): ApplicationValidationResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      message: "Validation failed",
      fields: { form: "Invalid request body" },
    };
  }

  const parsed = applicationInputSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validation failed",
      fields: fieldErrorsFromZod(parsed.error),
    };
  }

  const phoneNumber = normalizeEthiopianPhone(parsed.data.phoneNumber);
  if (!phoneNumber) {
    return {
      success: false,
      message: "Validation failed",
      fields: { phoneNumber: "Enter a valid Ethiopian mobile number." },
    };
  }

  const details = parsed.data.experienceDetails?.trim();

  return {
    success: true,
    data: {
      siteId: parsed.data.siteId,
      fullName: parsed.data.fullName,
      phoneNumber,
      skillCategoryId: parsed.data.skillCategoryId,
      expectedRate: parsed.data.expectedRate,
      experienceYears: parsed.data.experienceYears,
      ...(details ? { experienceDetails: details } : {}),
    },
  };
}

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "CONTACTED", "ACCEPTED", "REJECTED"], {
    required_error: "A valid application status is required.",
    invalid_type_error: "A valid application status is required.",
  }),
});
