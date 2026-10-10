"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Site } from "@/types";
import { submitApplication } from "@/lib/api/applications";
import { getSkills } from "@/lib/api/sites";
import { isApiConfigured } from "@/lib/api/client";
import { validateApplication } from "@/lib/validation";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockBody } from "@/hooks/useLockBody";
import { Button } from "@/components/ui/ButtonLink";
import type { SkillCategory } from "@/types";

type Props = {
  site: Site | null;
  onClose: () => void;
};

const empty = {
  fullName: "",
  phoneNumber: "",
  skillCategoryId: "",
  expectedRate: "",
  experienceYears: "",
  experienceDetails: "",
};

export function HireModal({ site, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useLockBody(Boolean(site));
  useFocusTrap(panelRef, Boolean(site));

  useEffect(() => {
    if (!site) return;
    setValues(empty);
    setErrors({});
    setSuccess(null);
    setFailure(null);
    getSkills().then(setSkills).catch(() => setSkills([]));
  }, [site]);

  useEffect(() => {
    if (!site) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [site, submitting, onClose]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!site || submitting) return;
    const { data, errors: nextErrors } = validateApplication({
      siteId: site.id,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      skillCategoryId: values.skillCategoryId,
      expectedRate: values.expectedRate === "" ? Number.NaN : Number(values.expectedRate),
      experienceYears: values.experienceYears === "" ? Number.NaN : Number(values.experienceYears),
      experienceDetails: values.experienceDetails,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFailure(null);
    try {
      await submitApplication(data);
      setSuccess(
        "Your application has been submitted successfully. The team will contact you using the phone number provided.",
      );
    } catch (error) {
      const fields = (error as Error & { fields?: Record<string, string> }).fields;
      if (fields) setErrors(fields);
      setFailure(error instanceof Error ? error.message : "The application could not be sent.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {site ? (
        <motion.div
          className="fixed inset-0 z-[75] flex items-end justify-center bg-night/55 p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <button type="button" className="absolute inset-0" aria-label="Close application form" onClick={() => !submitting && onClose()} />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-title"
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto bg-ivory p-6 md:p-8"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28 }}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">HIRE / ቅጥር</p>
            <h2 id="hire-title" className="mt-3 font-display text-3xl font-light">
              Apply for this site
            </h2>
            <p className="mt-3 text-sm text-muted">
              {site.name}
              <br />
              {site.address}
            </p>
            {!isApiConfigured() ? (
              <p className="mt-4 text-xs text-warning">
                Preview mode: submissions are validated locally until the API is connected.
              </p>
            ) : null}

            {success ? (
              <div className="mt-8 space-y-6">
                <p className="text-sm leading-7 text-success">{success}</p>
                <Button onClick={onClose} variant="line">
                  Close
                </Button>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    value={values.fullName}
                    onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
                    autoComplete="name"
                    className="field"
                  />
                </Field>
                <Field label="Phone Number" error={errors.phoneNumber}>
                  <input
                    value={values.phoneNumber}
                    onChange={(e) => setValues((v) => ({ ...v, phoneNumber: e.target.value }))}
                    inputMode="tel"
                    placeholder="+2519XXXXXXXX"
                    className="field"
                  />
                </Field>
                <Field label="Skill Category" error={errors.skillCategoryId}>
                  <select
                    value={values.skillCategoryId}
                    onChange={(e) => setValues((v) => ({ ...v, skillCategoryId: e.target.value }))}
                    className="field"
                  >
                    <option value="">Select a skill</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Expected Daily Rate (ETB)" error={errors.expectedRate}>
                  <input
                    value={values.expectedRate}
                    onChange={(e) => setValues((v) => ({ ...v, expectedRate: e.target.value }))}
                    inputMode="numeric"
                    className="field"
                  />
                </Field>
                <Field label="Years of Experience" error={errors.experienceYears}>
                  <input
                    value={values.experienceYears}
                    onChange={(e) => setValues((v) => ({ ...v, experienceYears: e.target.value }))}
                    inputMode="numeric"
                    className="field"
                  />
                </Field>
                <Field label="Professional Experience Details (optional)" error={errors.experienceDetails}>
                  <textarea
                    value={values.experienceDetails}
                    onChange={(e) => setValues((v) => ({ ...v, experienceDetails: e.target.value }))}
                    rows={4}
                    className="field resize-y"
                  />
                </Field>
                {failure ? <p className="text-sm text-error">{failure}</p> : null}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit application"}
                  </Button>
                  <Button variant="line" onClick={onClose} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-error">{error}</p> : null}
    </label>
  );
}
