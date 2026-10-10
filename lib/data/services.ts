import { images } from "@/lib/assets";
import type { ServiceItem } from "@/types";

export const services: ServiceItem[] = [
  {
    id: "interior",
    number: "01",
    title: "Interior Finishing",
    description:
      "Complete interior sequences — walls, joinery interfaces, and the quiet alignment of rooms that must be lived in as well as seen.",
    image: images.living,
  },
  {
    id: "exterior",
    number: "02",
    title: "Exterior Finishing",
    description:
      "Facade composure, weather-facing surfaces, and the last layer that gives a building its public presence.",
    image: images.exterior,
  },
  {
    id: "gypsum",
    number: "03",
    title: "Gypsum and Ceiling Works",
    description:
      "Ceiling planes, cornices, and gypsum volumes that hold light and proportion without drawing attention to themselves.",
    image: images.ceiling,
  },
  {
    id: "tile",
    number: "04",
    title: "Tile and Flooring Installation",
    description:
      "Floors and wet-area surfaces set with disciplined jointing, level, and material continuity from threshold to room.",
    image: images.tile,
  },
  {
    id: "painting",
    number: "05",
    title: "Painting and Decorative Finishing",
    description:
      "Color, sheen, and decorative layers applied as part of the architecture rather than as a final afterthought.",
    image: images.painting,
  },
  {
    id: "renovation",
    number: "06",
    title: "Renovation and Final Finishing",
    description:
      "The last sequence of a renovation — coordinating trades so the closing week of work is as precise as the first.",
    image: images.detail,
  },
];
