"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/lib/data/copy";
import { beforeAfterPairs } from "@/lib/data/gallery";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { SectionMark } from "@/components/ui/SectionMark";
import { ease, registerGsap } from "@/lib/gsap";

export function Transformation() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.from(".transform-in", {
        scrollTrigger: { trigger: root, start: "top 75%" },
        y: reduce ? 0 : 24,
        opacity: reduce ? 1 : 0,
        duration: 0.75,
        stagger: 0.1,
        ease,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const pair = beforeAfterPairs[0];

  return (
    <section ref={rootRef} className="bg-surface px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionMark index="04" label={t.transform.eyebrow} className="transform-in" />
        <h2 className="transform-in mt-6 max-w-3xl font-display text-3xl font-light leading-none sm:text-4xl md:text-5xl">
          {copy.transformTitle}
        </h2>
        <div className="transform-in mt-6">
          <PreviewNote>{copy.transformNote}</PreviewNote>
        </div>
        <div className="transform-in mt-12">
          <BeforeAfter pair={pair} />
        </div>
      </div>
    </section>
  );
}
