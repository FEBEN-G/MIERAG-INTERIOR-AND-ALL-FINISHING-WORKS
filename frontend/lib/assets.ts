import type { PreviewImage } from "@/types";

const credit = "የልማት ቅድመ እይታ ፎቶ። በእውነተኛ የMIERAG ፎቶ ይተኩ።";

export const images = {
  hero: {
    src: "/assets/preview/hero.jpg",
    alt: "የተደራረቡ ቁሳቁሶች እና የተፈጥሮ ብርሃን ያለው ዘመናዊ ሳሎን",
    credit,
  },
  intro: {
    src: "/assets/preview/intro.jpg",
    alt: "የተጠናቀቀ ማጠናቀቂያ እና ቀጥተኛ ብርሃን ያለው የውስጥ መተላለፊያ",
    credit,
  },
  philosophy: {
    src: "/assets/preview/philosophy.jpg",
    alt: "በተጠናቀቀ የቤት ውስጥ ያለ የመኖሪያ ደረጃ",
    credit,
  },
  exterior: {
    src: "/assets/preview/exterior.jpg",
    alt: "የተቀናበረ ፊት እና አካባቢ ያለው ዘመናዊ የቤት ውጭ ገጽታ",
    credit,
  },
  kitchen: {
    src: "/assets/preview/kitchen.jpg",
    alt: "ካቢኔ፣ ድንጋይ እና ብርሃን ያለው ኩሽና",
    credit,
  },
  bathroom: {
    src: "/assets/preview/bathroom.jpg",
    alt: "ድንጋይ፣ ሰድር እና እቃዎች ያሉት መታጠቢያ ቤት",
    credit,
  },
  living: {
    src: "/assets/preview/living.jpg",
    alt: "ጨርቅ፣ እንጨት እና የቀን ብርሃን ያለው ሳሎን",
    credit,
  },
  ceiling: {
    src: "/assets/preview/ceiling.jpg",
    alt: "የጣሪያ እና የግድግዳ ማጠናቀቂያ የሚታይበት ክፍል",
    credit,
  },
  flooring: {
    src: "/assets/preview/flooring.jpg",
    alt: "ወለሉ እና ግድግዳው በአንድ ቁሳቁስ የተጠናቀቁበት ክፍል",
    credit,
  },
  painting: {
    src: "/assets/preview/painting.jpg",
    alt: "ረጋ ያለ ቀለም እና የቀን ብርሃን ያለው ግድግዳ",
    credit,
  },
  tile: {
    src: "/assets/preview/tile.jpg",
    alt: "በትክክል የተሰራ መጋጠሚያ ያለው የእርጥበት ቦታ ሰድር",
    credit,
  },
  construction: {
    src: "/assets/preview/construction.jpg",
    alt: "ማጠናቀቂያ ከመጀመሩ በፊት ያለ ያልተጠናቀቀ መዋቅር",
    credit,
  },
  facade: {
    src: "/assets/preview/facade.jpg",
    alt: "ዘመናዊ የሕንፃ ፊት እና የውጭ ቅርጽ",
    credit,
  },
  detail: {
    src: "/assets/preview/detail.jpg",
    alt: "የቤት እቃ እና የተጠናቀቁ ገጽታዎች ያሉት የውስጥ ዝርዝር",
    credit,
  },
  galleryHero: {
    src: "/assets/preview/gallery-hero.jpg",
    alt: "ረንዳ እና የተጠናቀቀ ውጭ ያለው ክፍት ዘመናዊ መኖሪያ",
    credit,
  },
} satisfies Record<string, PreviewImage>;
