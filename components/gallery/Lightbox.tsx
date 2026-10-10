"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryItem } from "@/types";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLockBody } from "@/hooks/useLockBody";

type Props = {
  items: GalleryItem[];
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Lightbox({ items, index, onClose, onPrev, onNext }: Props) {
  const item = index != null ? items[index] : null;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useLockBody(Boolean(item));
  useFocusTrap(ref, Boolean(item));

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      {item ? (
        <motion.div
          ref={ref}
          className="fixed inset-0 z-[80] flex flex-col bg-night text-paper"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{item.category}</p>
              <p className="mt-1 text-sm">{item.title}</p>
            </div>
            <button type="button" onClick={onClose} className="min-h-11 text-[11px] uppercase tracking-[0.2em]">
              Close
            </button>
          </div>
          <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-center px-5 pb-8">
            <button type="button" onClick={onPrev} className="min-h-11 min-w-11 text-sm">
              Prev
            </button>
            <motion.div
              key={item.id}
              className="relative mx-4 aspect-[16/10] w-full overflow-hidden"
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Image src={item.image.src} alt={item.image.alt} fill sizes="90vw" className="object-contain" />
            </motion.div>
            <button type="button" onClick={onNext} className="min-h-11 min-w-11 text-sm">
              Next
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
