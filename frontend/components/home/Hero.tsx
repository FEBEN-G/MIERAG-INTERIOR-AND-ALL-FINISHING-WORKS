"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { images } from "@/lib/assets";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ease, registerGsap } from "@/lib/gsap";

export function Hero({ ready }: { ready: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (!ready) return;
    const { gsap, ScrollTrigger } = registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (!reduce) {
        const intro = gsap.timeline();
        intro
          .fromTo(
            ".hero-mask",
            { scale: 0.94, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.15, ease },
          )
          .fromTo(".hero-photo", { scale: 1.12 }, { scale: 1, duration: 1.25, ease }, 0)
          .fromTo(
            ".hero-line",
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8, stagger: 0.08, ease },
            0.35,
          )
          .fromTo(".hero-copy", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease }, 0.7);
      }

      if (!reduce) {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate(self) {
            gsap.set(".hero-photo", {
              y: self.progress * -28,
              scale: 1 + self.progress * 0.04,
            });
            gsap.set(".hero-content", {
              y: self.progress * -36,
              opacity: 1 - self.progress * 1.15,
            });
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={rootRef} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-night">
      <div className="hero-mask absolute inset-0 overflow-hidden">
        <Image
          src={images.hero.src}
          alt={images.hero.alt}
          fill
          priority
          sizes="100vw"
          className="hero-photo object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/35" />
      <div className="hero-content absolute inset-0 z-10 flex flex-col justify-end px-4 pt-24 pb-16 sm:px-6 sm:pb-24 md:px-14 md:pb-20">
        <h1 className="on-photo max-w-full font-display text-[2.15rem] leading-[1.15] text-paper min-[420px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          {t.hero.lines.map((line) => (
            <span key={line} className="block overflow-hidden">
              <span className="hero-line inline-block">{line}</span>
            </span>
          ))}
        </h1>
        <p className="on-photo hero-copy mt-5 max-w-md text-base leading-8 text-paper sm:mt-6">{t.hero.support}</p>
        <div className="hero-copy mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
          <ButtonLink href="/gallery" variant="light" className="w-full sm:w-auto">
            {t.hero.work}
          </ButtonLink>
          <ButtonLink href="/projects" variant="ghost" className="w-full sm:w-auto">
            {t.hero.projects}
          </ButtonLink>
        </div>
      </div>
      <div className="hero-copy absolute bottom-8 left-8 z-10 hidden items-center gap-4 sm:flex md:left-14">
        <span className="scroll-line block h-14 w-px bg-paper" />
        <span className="on-photo text-sm text-paper">{t.hero.scroll}</span>
      </div>
      </div>
    </section>
  );
}
