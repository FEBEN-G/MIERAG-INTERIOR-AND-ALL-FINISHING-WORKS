"use client";

import { useState } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types";
import { cn } from "@/lib/utils";

type Props = {
  items: GalleryItem[];
  previousLabel: string;
  nextLabel: string;
  caption: (item: GalleryItem) => { title: string; description: string };
};

export function RoomSlider({ items, previousLabel, nextLabel, caption }: Props) {
  const [index, setIndex] = useState(0);
  const count = items.length;
  const safeIndex = count === 0 ? 0 : index % count;
  const current = items[safeIndex];

  if (!current) return null;

  function step(direction: -1 | 1) {
    setIndex((value) => (value + direction + count) % count);
  }

  const text = caption(current);

  return (
    <div>
      <div className="relative overflow-hidden bg-night">
        <div className="relative aspect-[4/5] sm:aspect-[16/10]">
          <Image
            key={current.id}
            src={current.image.src}
            alt={text.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1100px"
            className="object-cover"
            priority={safeIndex === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 via-night/15 to-night/10" />
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-6">
            <div className="min-w-0">
              <p className="on-photo font-ethiopic text-xl text-paper sm:text-2xl">{text.title}</p>
              <p className="on-photo mt-1 text-sm leading-7 text-paper">{text.description}</p>
            </div>
            <p className="on-photo shrink-0 text-sm text-paper">
              {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={previousLabel}
          className="absolute top-1/2 left-3 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-night/80 text-lg text-paper"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label={nextLabel}
          className="absolute top-1/2 right-3 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-night/80 text-lg text-paper"
        >
          ›
        </button>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {items.map((item, itemIndex) => {
          const label = caption(item).title;
          const active = itemIndex === safeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-current={active ? "true" : undefined}
              aria-label={label}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden border-2",
                active ? "border-brand" : "border-transparent opacity-80",
              )}
            >
              <Image src={item.image.src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
