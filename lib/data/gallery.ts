import { images } from "@/lib/assets";
import type { BeforeAfterPair, GalleryCategory, GalleryItem } from "@/types";

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "interior", label: "Interior" },
  { id: "exterior", label: "Exterior" },
  { id: "living", label: "Living Spaces" },
  { id: "kitchens", label: "Kitchens" },
  { id: "bathrooms", label: "Bathrooms" },
  { id: "flooring", label: "Flooring and Tiles" },
  { id: "ceilings", label: "Ceilings and Gypsum" },
  { id: "painting", label: "Painting and Finishing" },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "g-living-01",
    title: "Composed Living Volume",
    category: "living",
    description: "A quiet interior register of timber, textile, and daylight.",
    image: images.living,
  },
  {
    id: "g-kitchen-01",
    title: "Kitchen as Working Architecture",
    category: "kitchens",
    description: "Cabinetry, stone, and light organised as a single working plane.",
    image: images.kitchen,
  },
  {
    id: "g-bath-01",
    title: "Wet-Area Precision",
    category: "bathrooms",
    description: "Tile, stone, and fixture alignment in a finished bathing room.",
    image: images.bathroom,
  },
  {
    id: "g-exterior-01",
    title: "Residential Facade",
    category: "exterior",
    description: "Massing, opening, and landscape held in a single exterior view.",
    image: images.exterior,
  },
  {
    id: "g-interior-01",
    title: "Linear Interior",
    category: "interior",
    description: "A corridor of finished planes and measured light.",
    image: images.intro,
  },
  {
    id: "g-ceiling-01",
    title: "Ceiling Plane",
    category: "ceilings",
    description: "Volume and cornice treated as architectural surface.",
    image: images.ceiling,
  },
  {
    id: "g-floor-01",
    title: "Floor Continuity",
    category: "flooring",
    description: "Material running through a finished residential room.",
    image: images.flooring,
  },
  {
    id: "g-paint-01",
    title: "Painted Field",
    category: "painting",
    description: "Wall finish as atmosphere rather than decoration.",
    image: images.painting,
  },
  {
    id: "g-interior-02",
    title: "Stair as Sculpture",
    category: "interior",
    description: "A finished circulation volume with composed verticality.",
    image: images.philosophy,
  },
  {
    id: "g-exterior-02",
    title: "Public Face",
    category: "exterior",
    description: "Contemporary exterior massing and facade rhythm.",
    image: images.facade,
  },
  {
    id: "g-living-02",
    title: "Domestic Detail",
    category: "living",
    description: "Furniture, floor, and wall meeting with restraint.",
    image: images.detail,
  },
  {
    id: "g-tile-01",
    title: "Stone and Joint",
    category: "flooring",
    description: "Wet-area tiling with disciplined setting-out.",
    image: images.tile,
  },
];

export const beforeAfterPairs: BeforeAfterPair[] = [
  {
    id: "ba-01",
    title: "Structure to Interior",
    description:
      "Development preview only. Replace both frames with photographs of the same MIERAG site, taken before and after finishing.",
    before: images.construction,
    after: images.living,
  },
];

export function filterGallery(category: GalleryCategory) {
  if (category === "all") return galleryItems;
  if (category === "interior") {
    return galleryItems.filter((item) =>
      ["interior", "living", "kitchens", "bathrooms", "ceilings", "painting"].includes(item.category),
    );
  }
  if (category === "exterior") {
    return galleryItems.filter((item) => item.category === "exterior");
  }
  return galleryItems.filter((item) => item.category === category);
}
