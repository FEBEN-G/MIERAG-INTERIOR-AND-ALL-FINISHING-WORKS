"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { services } from "@/lib/data/services";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { PreviewNote } from "@/components/ui/PreviewNote";
import { SectionMark } from "@/components/ui/SectionMark";
import { cn } from "@/lib/utils";

const shapes = ["shape-a", "shape-b", "shape-c"] as const;

export function Services() {
  const { t } = useI18n();

  return (
    <section id="services" className="relative overflow-hidden bg-ivory px-4 pt-24 pb-16 sm:px-6 sm:pt-28 md:px-10 md:pt-40 md:pb-28">
      <motion.div
        className="mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <SectionMark index="01" label={t.services.eyebrow} />
        <div className="mt-6 grid gap-8 md:grid-cols-12">
          <h2 className="font-display text-3xl font-light leading-none sm:text-5xl md:col-span-6 lg:text-6xl">
            {t.services.title}
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted md:col-span-5 md:col-start-8 md:mt-4">
            {t.services.body}
          </p>
        </div>
        <div className="mt-8">
          <PreviewNote>{t.services.note}</PreviewNote>
        </div>
      </motion.div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col gap-6">
        {services.map((service, index) => {
          const imageRight = index % 2 === 0;
          const item = t.services.items[service.id as keyof typeof t.services.items];
          return (
            <motion.article
              key={service.id}
              className="group grid grid-cols-1 items-center gap-6 py-8 sm:grid-cols-2 sm:gap-12 md:py-12"
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.75, delay: 0.05 }}
            >
              <div className={cn(imageRight ? "sm:order-1" : "sm:order-2 sm:text-right")}>
                <span className="font-display text-4xl font-light text-ink/15">{service.number}</span>
                <h3 className="mt-3 text-xl tracking-tight text-balance sm:text-2xl">{item.title}</h3>
                <p className={cn("mt-3 text-sm leading-7 text-muted", imageRight ? "max-w-sm" : "sm:ml-auto sm:max-w-sm")}>
                  {item.description}
                </p>
              </div>
              <div className={cn(imageRight ? "sm:order-2" : "sm:order-1")}>
                <ServiceFrame
                  src={service.image.src}
                  alt={service.image.alt}
                  shape={shapes[index % shapes.length]}
                  notch={index % 2 === 0}
                  delay={index * 0.35}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function ServiceFrame({
  src,
  alt,
  shape,
  notch,
  delay,
}: {
  src: string;
  alt: string;
  shape: (typeof shapes)[number];
  notch: boolean;
  delay: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [shift, setShift] = useState({ x: 0, y: 0, scale: 1.12 });

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduce) return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    setShift({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 26,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 18,
      scale: 1.2,
    });
  }

  return (
    <div
      className="frame-float"
      style={{ animationDelay: `${delay}s`, animationPlayState: reduce ? "paused" : "running" }}
    >
      <div
        ref={frameRef}
        onPointerMove={onMove}
        onPointerLeave={() => setShift({ x: 0, y: 0, scale: 1.12 })}
        className={cn(
          "relative aspect-[5/4] cursor-crosshair overflow-hidden bg-transparent",
          notch ? "photo-notch" : shape,
        )}
        style={notch ? { clipPath: "url(#photo-notch)" } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, 46vw"
          className="object-cover"
          style={{
            transform: `scale(${shift.scale}) translate3d(${shift.x}px, ${shift.y}px, 0)`,
            transition: "transform 0.35s ease-out",
          }}
        />
      </div>
    </div>
  );
}
