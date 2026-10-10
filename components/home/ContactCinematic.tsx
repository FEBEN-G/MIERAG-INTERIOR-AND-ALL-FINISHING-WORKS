"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { copy } from "@/lib/data/copy";
import { images } from "@/lib/assets";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionMark } from "@/components/ui/SectionMark";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { ease, registerGsap } from "@/lib/gsap";

export function ContactCinematic() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-mask",
        { clipPath: reduce ? "inset(0%)" : "inset(12% 12% 12% 12%)" },
        {
          clipPath: "inset(0%)",
          duration: 1.15,
          ease,
          scrollTrigger: { trigger: root, start: "top 70%" },
        },
      );
      gsap.from(".contact-line", {
        scrollTrigger: { trigger: root, start: "top 68%" },
        yPercent: reduce ? 0 : 110,
        duration: 0.8,
        stagger: 0.08,
        ease,
      });
      gsap.from(".contact-cta", {
        scrollTrigger: { trigger: root, start: "top 62%" },
        opacity: reduce ? 1 : 0,
        y: reduce ? 0 : 16,
        duration: 0.6,
        delay: 0.2,
        ease,
      });
      if (!reduce && !mobile) {
        gsap.to(".contact-photo", {
          y: 70,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const words = copy.contactTitle.split(" ");

  return (
    <section id="contact" ref={rootRef} className="relative min-h-[90svh] overflow-hidden bg-night">
      <div className="contact-mask absolute inset-0">
        <Image
          src={images.galleryHero.src}
          alt={images.galleryHero.alt}
          fill
          sizes="100vw"
          className="contact-photo object-cover"
        />
        <div className="absolute inset-0 bg-night/55" />
      </div>
      <div className="relative z-10 flex min-h-[90svh] flex-col justify-end px-4 py-20 sm:px-6 md:px-12">
        <SectionMark index="06" label={t.nav.contact} tone="paper" className="contact-cta" />
        <h2 className="mt-5 max-w-4xl font-display text-3xl font-light leading-[0.95] text-balance text-paper sm:text-5xl lg:text-6xl">
          {words.map((word) => (
            <span key={word} className="mr-[0.22em] inline-block overflow-hidden">
              <span className="contact-line inline-block">{word}</span>
            </span>
          ))}
        </h2>
        <p className="contact-cta mt-8 max-w-lg text-[11px] uppercase tracking-[0.22em] text-gold">
          {BRAND.name}
        </p>
        <p className="contact-cta mt-3 text-[12px] uppercase tracking-[0.28em] text-paper/80">
          {BRAND.slogan}
        </p>
        <p className="contact-cta mt-6 max-w-md text-sm leading-7 text-paper/70">{copy.contactBody}</p>
        <div className="contact-cta mt-10">
          <ButtonLink href="/gallery#inquiry" variant="light">
            Contact Us
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
