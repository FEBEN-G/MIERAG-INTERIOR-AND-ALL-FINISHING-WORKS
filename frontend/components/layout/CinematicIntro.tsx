"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ease, registerGsap } from "@/lib/gsap";

const STORAGE_KEY = "mierag-intro-v2";

export function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem(STORAGE_KEY) === "1") {
      onComplete();
      return;
    }

    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete() {
          sessionStorage.setItem(STORAGE_KEY, "1");
          onComplete();
        },
      });

      tl.fromTo(
        ".intro-logo",
        { opacity: 0, scale: 0.72, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.05, ease },
      )
        .from(".intro-letter", { y: 28, opacity: 0, stagger: 0.055, duration: 0.55, ease }, "-=0.45")
        .fromTo(".intro-line", { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease }, "-=0.2")
        .from(".intro-slogan", { opacity: 0, y: 12, duration: 0.5, ease }, "-=0.25")
        .to({}, { duration: 0.55 })
        .to(root, { opacity: 0, duration: 0.55, ease });
    }, root);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ivory"
      role="dialog"
      aria-label="Brand introduction"
    >
      <Image
        src={BRAND.logoSrc}
        alt={BRAND.logoAlt}
        width={180}
        height={140}
        priority
        className="intro-logo h-auto w-[128px] md:w-[168px]"
        style={{ height: "auto" }}
      />
      <p className="intro-word mt-8 flex max-w-[90vw] justify-center text-[13px] uppercase tracking-[0.18em] text-ink sm:text-[15px] sm:tracking-[0.42em]">
        {BRAND.shortName.split("").map((letter, index) => (
          <span key={`${letter}-${index}`} className="intro-letter inline-block">
            {letter}
          </span>
        ))}
      </p>
      <span className="intro-line mt-4 block h-px w-24 origin-center bg-gold" />
      <p className="intro-slogan mt-4 max-w-[90vw] px-4 text-center text-sm leading-relaxed text-gold-ink">
        {t.hero.lines.join(" ")}
      </p>
    </div>
  );
}
