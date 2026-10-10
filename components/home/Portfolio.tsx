"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { copy } from "@/lib/data/copy";
import { galleryItems } from "@/lib/data/gallery";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { ease, registerGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const featured = galleryItems.slice(0, 6);

const frames = ["shape-b", "shape-c", "shape-a", "shape-c", "shape-a", "shape-b"] as const;

export function Portfolio() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const { gsap } = registerGsap();
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      gsap.from(".portfolio-head", {
        scrollTrigger: { trigger: root, start: "top 75%" },
        y: reduce ? 0 : 28,
        opacity: reduce ? 1 : 0,
        duration: 0.8,
        ease,
      });

      root.querySelectorAll<HTMLElement>(".portfolio-item").forEach((item, index) => {
        gsap.fromTo(
          item.querySelector(".portfolio-clip"),
          { clipPath: reduce ? "inset(0%)" : index % 2 === 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.05,
            ease,
            scrollTrigger: { trigger: item, start: "top 82%" },
          },
        );
        gsap.from(item.querySelector(".portfolio-meta"), {
          scrollTrigger: { trigger: item, start: "top 78%" },
          opacity: reduce ? 1 : 0,
          y: reduce ? 0 : 16,
          duration: 0.6,
          delay: 0.15,
          ease,
        });
        if (!reduce && !mobile) {
          gsap.to(item.querySelector(".portfolio-photo"), {
            scale: 1.06,
            ease: "none",
            scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={rootRef} className="overflow-hidden bg-ivory px-6 py-24 md:px-10 md:py-32">
      <div className="portfolio-head mx-auto max-w-7xl">
        <div className="chapter-mark flex items-end gap-4">
          <span className="chapter-index" aria-hidden>
            03
          </span>
          <span className="chapter-rule" aria-hidden />
          <span className="chapter-label">
            <span className="sr-only">03 </span>
            {t.portfolio.eyebrow}
          </span>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <h2 className="font-display text-4xl font-light leading-none sm:text-5xl md:col-span-6 lg:text-6xl">
            {copy.portfolioTitle}
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted md:col-span-5 md:col-start-8">{copy.portfolioBody}</p>
        </div>
        <div className="mt-8">
          <PreviewNote>{copy.portfolioNote}</PreviewNote>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-7xl gap-x-8 gap-y-12 md:grid-cols-2">
        {featured.map((item, index) => (
          <article key={item.id} className={cn("portfolio-item relative", index % 2 === 1 && "md:mt-20")}>
            <div className="portfolio-clip overflow-hidden">
              <div
                className={cn(
                  "relative aspect-[4/5] overflow-hidden",
                  index % 2 === 0 ? "photo-notch" : frames[index],
                )}
                style={index % 2 === 0 ? { clipPath: "url(#photo-notch)" } : undefined}
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="portfolio-photo object-cover"
                />
              </div>
            </div>
            <div className="portfolio-meta relative z-10 mt-4 flex items-baseline justify-between gap-4 bg-ivory">
              <div>
                <p className="text-sm">{item.title}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">{item.category}</p>
              </div>
              <span className="font-display text-2xl font-light text-ink/15">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-7xl">
        <Link href="/gallery" className="text-[11px] uppercase tracking-[0.22em] text-ink underline-offset-4 hover:underline">
          View the full gallery
        </Link>
      </div>
    </section>
  );
}
