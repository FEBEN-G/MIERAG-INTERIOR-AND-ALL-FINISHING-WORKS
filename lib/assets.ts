import type { PreviewImage } from "@/types";

const credit = "Development preview photograph. Replace with commissioned MIERAG photography.";

export const images = {
  hero: {
    src: "/assets/preview/hero.jpg",
    alt: "Quiet contemporary living interior with layered materials and natural light",
    credit,
  },
  intro: {
    src: "/assets/preview/intro.jpg",
    alt: "Architectural interior corridor with refined finishes and linear light",
    credit,
  },
  philosophy: {
    src: "/assets/preview/philosophy.jpg",
    alt: "Sculptural residential stair and volume in a finished interior",
    credit,
  },
  exterior: {
    src: "/assets/preview/exterior.jpg",
    alt: "Contemporary house exterior with composed facade and landscape",
    credit,
  },
  kitchen: {
    src: "/assets/preview/kitchen.jpg",
    alt: "Kitchen interior with cabinetry, stone, and considered lighting",
    credit,
  },
  bathroom: {
    src: "/assets/preview/bathroom.jpg",
    alt: "Bathroom finishing with stone, tile, and restrained fixtures",
    credit,
  },
  living: {
    src: "/assets/preview/living.jpg",
    alt: "Living space with layered textiles, timber, and architectural daylight",
    credit,
  },
  ceiling: {
    src: "/assets/preview/ceiling.jpg",
    alt: "Interior volume emphasizing ceiling planes and wall finishes",
    credit,
  },
  flooring: {
    src: "/assets/preview/flooring.jpg",
    alt: "Finished room interior highlighting floor and wall material continuity",
    credit,
  },
  painting: {
    src: "/assets/preview/painting.jpg",
    alt: "Painted interior wall surfaces with calm color and daylight",
    credit,
  },
  tile: {
    src: "/assets/preview/tile.jpg",
    alt: "Tiled wet-area interior with precise jointing and stone surfaces",
    credit,
  },
  construction: {
    src: "/assets/preview/construction.jpg",
    alt: "Unfinished structural interior prior to finishing works",
    credit,
  },
  facade: {
    src: "/assets/preview/facade.jpg",
    alt: "Modern architectural exterior massing and facade composition",
    credit,
  },
  detail: {
    src: "/assets/preview/detail.jpg",
    alt: "Residential interior detail with furniture and finished surfaces",
    credit,
  },
  galleryHero: {
    src: "/assets/preview/gallery-hero.jpg",
    alt: "Open contemporary residence with terrace and refined exterior finishing",
    credit,
  },
} satisfies Record<string, PreviewImage>;
