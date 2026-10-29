"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getPublishedPosts, toGalleryItem } from "@/lib/api/content";
import { isApiConfigured } from "@/lib/api/client";
import { beforeAfterPairs, filterGallery, galleryCategories, galleryItems, previewImageKeys } from "@/lib/data/gallery";
import { images } from "@/lib/assets";
import type { GalleryCategory, GalleryItem } from "@/types";
import { BeforeAfter } from "@/components/ui/BeforeAfter";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RoomSlider } from "@/components/ui/RoomSlider";
import { SectionMark } from "@/components/ui/SectionMark";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Lightbox } from "./Lightbox";

export function GalleryExperience() {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<GalleryItem[]>(galleryItems);
  const items = useMemo(() => filterGallery(category, catalog), [category, catalog]);

  useEffect(() => {
    if (!isApiConfigured()) return;
    getPublishedPosts()
      .then((posts) => setCatalog(posts.map(toGalleryItem)))
      .catch(() => undefined);
  }, []);
  const { t } = useI18n();
  const caption = useMemo(
    () => (item: GalleryItem) => {
      const key = previewImageKeys[item.image.src] ?? item.id;
      const known = t.gallery.items[key as keyof typeof t.gallery.items];
      return {
        title: known?.title ?? item.title,
        description: known?.description ?? item.description,
      };
    },
    [t],
  );

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
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/30" />
        <div className="relative z-10 flex min-h-[70svh] flex-col justify-end px-4 py-20 sm:px-6 md:px-12">
          <SectionMark index="03" label={t.gallery.eyebrow} tone="paper" />
          <h1 className="on-photo mt-4 max-w-full font-display text-3xl leading-tight text-balance text-paper sm:text-5xl lg:text-6xl">
            {t.gallery.title}
          </h1>
          <p className="on-photo mt-6 max-w-xl text-base leading-8 text-paper">{t.gallery.body}</p>
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
              {t.gallery.categories[item.id]}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl leading-tight text-ink">{t.transform.title}</h2>
          <div className="mt-4">
            <p className="max-w-2xl text-sm text-ink/80">{t.transform.note}</p>
          </div>
          <div className="mt-8">
            <BeforeAfter pair={beforeAfterPairs[0]} />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-7xl">
          {items.length === 0 ? (
            <p className="mt-16 text-base text-ink/80">{t.gallery.empty}</p>
          ) : (
            <div className="mt-10">
              <RoomSlider
                items={items}
                previousLabel={t.gallery.prev}
                nextLabel={t.gallery.next}
                caption={caption}
              />
            </div>
          )}
        </div>
      </section>

      <section id="inquiry" className="bg-night px-6 py-24 text-paper md:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="on-photo font-display text-3xl leading-tight text-paper sm:text-4xl md:text-5xl">{t.gallery.inquiryTitle}</h2>
          <p className="on-photo mt-6 max-w-xl text-base leading-8 text-paper">
            {t.gallery.inquiryBody}
          </p>
          <div className="mt-10">
            <ButtonLink href="/projects" variant="light">
              {t.gallery.inquiryCta}
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
