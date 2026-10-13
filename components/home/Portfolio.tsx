"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPublishedPosts, toGalleryItem } from "@/lib/api/content";
import { isApiConfigured } from "@/lib/api/client";
import { galleryItems, previewImageKeys } from "@/lib/data/gallery";
import type { GalleryItem } from "@/types";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { RoomSlider } from "@/components/ui/RoomSlider";
import { SectionMark } from "@/components/ui/SectionMark";

const ROOM_ORDER = ["living", "kitchens", "bathrooms", "interior", "ceilings", "flooring", "painting", "exterior"];

function orderRooms(items: GalleryItem[]) {
  return [...items].sort((a, b) => {
    const left = ROOM_ORDER.indexOf(a.category);
    const right = ROOM_ORDER.indexOf(b.category);
    return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
  });
}

export function Portfolio() {
  const { t } = useI18n();
  const [featured, setFeatured] = useState<GalleryItem[]>(orderRooms(galleryItems));

  useEffect(() => {
    if (!isApiConfigured()) return;
    getPublishedPosts()
      .then((posts) => setFeatured(orderRooms(posts.map(toGalleryItem))))
      .catch(() => undefined);
  }, []);

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
    <section id="work" className="overflow-hidden bg-ivory px-4 py-16 sm:px-6 sm:py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionMark index="03" label={t.portfolio.eyebrow} />
        <div className="mt-6 grid gap-6 md:grid-cols-12">
          <h2 className="font-display text-3xl leading-tight text-ink sm:text-5xl md:col-span-6 lg:text-6xl">
            {t.portfolio.title}
          </h2>
          <p className="max-w-md text-base text-ink/85 md:col-span-5 md:col-start-8">{t.portfolio.body}</p>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-ink/75">{t.portfolio.house}</p>
      </div>

      <div className="mx-auto mt-10 max-w-7xl">
        <RoomSlider
          items={featured}
          previousLabel={t.portfolio.previous}
          nextLabel={t.portfolio.next}
          caption={caption}
        />
      </div>
      <div className="mx-auto mt-8 max-w-7xl">
        <Link href="/gallery" className="text-sm text-ink underline decoration-gold underline-offset-4">
          {t.portfolio.more}
        </Link>
      </div>
    </section>
  );
}
