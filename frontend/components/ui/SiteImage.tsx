"use client";

import Image, { type ImageProps } from "next/image";
import { defaultImage, type ImageSlot } from "@/lib/site-images";
import { useSiteSettings } from "@/lib/site-settings";
import { isUploadedImage } from "@/lib/utils";

type Props = Omit<ImageProps, "src"> & { slot: ImageSlot };

/** An image the admin can replace. It stays hidden until settings load, so the default never flashes. */
export function SiteImage({ slot, alt, style, ...props }: Props) {
  const { ready, settings } = useSiteSettings();
  const src = settings.images[slot] ?? defaultImage(slot);

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      unoptimized={isUploadedImage(src)}
      style={ready ? style : { ...style, visibility: "hidden" }}
    />
  );
}
