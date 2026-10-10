"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { images } from "@/lib/assets";
import { SectionMark } from "@/components/ui/SectionMark";

export function About() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const lead = [t.about.lines[0], t.about.lines[1]].join(" ");
  const follow = [t.about.lines[2], t.about.lines[3]].join(" ");

  return (
    <section id="about" className="bg-surface px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <SectionMark index="02" label={t.about.eyebrow} />
          <h2 className="mt-3 font-display text-4xl font-light leading-none sm:text-5xl lg:text-6xl">
            {t.about.eyebrow}
          </h2>
          <p className="mt-6 max-w-md font-display text-2xl font-light leading-snug sm:text-3xl">
            <span className="block">{lead}</span>
            <span className="block">{follow}</span>
          </p>
          <p className="mt-5 max-w-md text-sm leading-8 text-muted">{t.about.body}</p>
          <p className="mt-6 max-w-md border-l border-brand pl-5 text-sm leading-7 text-ink">{t.about.statement}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-6 items-start gap-4 sm:gap-5"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <figure
            className="relative col-span-4 aspect-[3/4] overflow-hidden"
            style={{ borderRadius: "46% 54% 42% 58% / 38% 48% 52% 62%" }}
          >
            <Image
              src={images.intro.src}
              alt={images.intro.alt}
              fill
              sizes="(max-width: 1024px) 55vw, 28vw"
              className="object-cover"
            />
          </figure>
          <figure
            className="relative col-span-2 mt-16 aspect-[3/4] overflow-hidden sm:mt-24"
            style={{ clipPath: "url(#photo-notch)" }}
          >
            <Image
              src={images.detail.src}
              alt={images.detail.alt}
              fill
              sizes="(max-width: 1024px) 30vw, 16vw"
              className="object-cover"
            />
          </figure>
          <p className="col-span-6 text-[10px] uppercase tracking-[0.16em] text-muted">{images.intro.credit}</p>
        </motion.div>
      </div>
    </section>
  );
}
