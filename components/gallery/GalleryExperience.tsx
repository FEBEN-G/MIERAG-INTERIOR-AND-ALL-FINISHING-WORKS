"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { copy } from "@/lib/data/copy";
import { beforeAfterPairs, filterGallery, galleryCategories } from "@/lib/data/gallery";
import { images } from "@/lib/assets";
import type { GalleryCategory } from "@/types";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionMark } from "@/components/ui/SectionMark";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { Lightbox } from "./Lightbox";

export function GalleryExperience() {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = useMemo(() => filterGallery(category), [category]);
  const { t } = useI18n();

  return (
    <div>
      <section className="relative min-h-[70svh] overflow-hidden bg-night">
        <Image
          src={images.galleryHero.src}
          alt={images.galleryHero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="relative z-10 flex min-h-[70svh] flex-col justify-end px-4 py-20 sm:px-6 md:px-12">
          <SectionMark index="03" label={t.gallery.eyebrow} tone="paper" />
          <h1 className="mt-4 max-w-full font-display text-3xl font-light text-balance text-paper sm:text-5xl lg:text-6xl">
            {copy.galleryTitle}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-paper/75">{copy.galleryBody}</p>
        </div>
      </section>

      <section className="px-4 pt-16 pb-12 sm:px-6 sm:pt-24 md:px-10 md:pt-32">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
          {galleryCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`min-h-11 px-4 text-[11px] uppercase tracking-[0.16em] ${
                category === item.id ? "bg-ink text-ivory" : "border border-line text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-light">{copy.transformTitle}</h2>
          <div className="mt-4">
            <PreviewNote>{copy.transformNote}</PreviewNote>
          </div>
          <div className="mt-8">
            <BeforeAfter pair={beforeAfterPairs[0]} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          <PreviewNote>{copy.portfolioNote}</PreviewNote>
          {items.length === 0 ? (
            <p className="mt-16 text-sm text-muted">No preview images are mapped to this category yet.</p>
          ) : (
            <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.button
                    layout
                    key={item.id}
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="mb-6 w-full break-inside-avoid text-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className={cn("relative aspect-[4/5] overflow-hidden", index % 3 === 0 ? "shape-a" : index % 3 === 1 ? "shape-b" : "shape-c")}>
                      <Image src={item.image.src} alt={item.image.alt} fill sizes="33vw" className="object-cover" />
                    </div>
                    <p className="mt-3 text-sm">{item.title}</p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{item.category}</p>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      <section id="inquiry" className="bg-night px-6 py-24 text-paper md:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-light sm:text-4xl md:text-5xl">Discuss a finishing commission.</h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-paper/70">
            Official contact channels will appear here once supplied. Until then, review current sites or return to the
            studio introduction.
          </p>
          <div className="mt-10">
            <ButtonLink href="/projects" variant="light">
              Explore available projects
            </ButtonLink>
          </div>
        </div>
      </section>

      <Lightbox
        items={items}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onPrev={() => setOpenIndex((current) => (current == null ? current : (current - 1 + items.length) % items.length))}
        onNext={() => setOpenIndex((current) => (current == null ? current : (current + 1) % items.length))}
      />
    </div>
  );
}
