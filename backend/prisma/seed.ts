import { PrismaClient, SiteStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

const SKILL_CATEGORIES = [
  { name: "ጂፕሰም", slug: "gypsum" },
  { name: "ሰድር", slug: "tile-installation" },
  { name: "ቀለም", slug: "painting" },
  { name: "ወለል", slug: "flooring" },
  { name: "አናጢነት", slug: "carpentry" },
  { name: "ኤሌክትሪክ", slug: "electrical-work" },
  { name: "ቧንቧ", slug: "plumbing" },
  { name: "ሌላ", slug: "other" },
] as const;

const COVER_IMAGES = [
  "/assets/preview/exterior.jpg",
  "/assets/preview/hero.jpg",
  "/assets/preview/intro.jpg",
  "/assets/preview/philosophy.jpg",
  "/assets/preview/construction.jpg",
] as const;

type SeedSite = {
  name: string;
  previousName?: string;
  description: string;
  status: SiteStatus;
  address: string;
  latitude: number;
  longitude: number;
  estimatedDuration: string;
  startDate: Date;
  expectedCompletionDate: Date;
  currentWorkerCount: number;
  coverImageUrl: string;
  compensationMin: number;
  compensationMax: number;
  compensationNote: string;
  skills: { slug: string; workersNeeded: number }[];
};

const PREVIEW_SITES: SeedSite[] = [
  {
    name: "ቦሌ የመኖሪያ ውስጥ ማጠናቀቂያ — ቅድመ እይታ",
    previousName: "Bole Residential Interior — Preview",
    description:
      "[ቅድመ መዝገብ] በቦሌ ላለ የመኖሪያ ውስጥ ማጠናቀቂያ የተዘጋጀ የናሙና መረጃ ነው። የቀጥታ የMIERAG ስራ ቦታ አይደለም።",
    status: "STRUCTURAL_WORK",
    address: "ቦሌ፣ አዲስ አበባ",
    latitude: 8.994,
    longitude: 38.789,
    estimatedDuration: "4 ወራት",
    startDate: new Date("2026-08-01T00:00:00.000Z"),
    expectedCompletionDate: new Date("2026-12-01T00:00:00.000Z"),
    currentWorkerCount: 6,
    coverImageUrl: COVER_IMAGES[0],
    compensationMin: 700,
    compensationMax: 1200,
    compensationNote: "በሙያ እና በልምድ የሚለያይ የቅድመ እይታ የቀን ክፍያ (ብር)።",
    skills: [
      { slug: "gypsum", workersNeeded: 4 },
      { slug: "electrical-work", workersNeeded: 2 },
      { slug: "plumbing", workersNeeded: 2 },
    ],
  },
  {
    name: "ቃዛንቺስ ድብልቅ ውስጥ ማጠናቀቂያ — ቅድመ እይታ",
    previousName: "Kazanchis Mixed-Use Interior — Preview",
    description:
      "[ቅድመ መዝገብ] በቃዛንቺስ ያለ ድብልቅ የውስጥ ማጠናቀቂያ የናሙና መረጃ ነው። የቀጥታ የMIERAG ስራ ቦታ አይደለም።",
    status: "ROUGH_IN",
    address: "ቃዛንቺስ፣ አዲስ አበባ",
    latitude: 9.01,
    longitude: 38.763,
    estimatedDuration: "3 ወራት",
    startDate: new Date("2026-07-15T00:00:00.000Z"),
    expectedCompletionDate: new Date("2026-10-15T00:00:00.000Z"),
    currentWorkerCount: 8,
    coverImageUrl: COVER_IMAGES[1],
    compensationMin: 800,
    compensationMax: 1400,
    compensationNote: "ለመጀመሪያ ዝርጋታ ሙያዎች የቅድመ እይታ የቀን ክፍያ (ብር)።",
    skills: [
      { slug: "tile-installation", workersNeeded: 3 },
      { slug: "plumbing", workersNeeded: 2 },
      { slug: "electrical-work", workersNeeded: 2 },
    ],
  },
  {
    name: "ሲኤምሲ አፓርትመንት የመጨረሻ ማጠናቀቂያ — ቅድመ እይታ",
    previousName: "CMC Apartment Final Finishing — Preview",
    description:
      "[ቅድመ መዝገብ] በሲኤምሲ ላለ አፓርትመንት የመጨረሻ ማጠናቀቂያ የናሙና መረጃ ነው። የቀጥታ የMIERAG ስራ አይደለም።",
    status: "FINAL_FINISHING",
    address: "ሲኤምሲ፣ አዲስ አበባ",
    latitude: 9.022,
    longitude: 38.827,
    estimatedDuration: "6 ሳምንታት",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    expectedCompletionDate: new Date("2026-10-15T00:00:00.000Z"),
    currentWorkerCount: 5,
    coverImageUrl: COVER_IMAGES[2],
    compensationMin: 900,
    compensationMax: 1600,
    compensationNote: "ለቀለም፣ ለወለል እና ለጂፕሰም የቅድመ እይታ የቀን ክፍያ (ብር)።",
    skills: [
      { slug: "painting", workersNeeded: 3 },
      { slug: "flooring", workersNeeded: 2 },
      { slug: "gypsum", workersNeeded: 2 },
    ],
  },
  {
    name: "የድሮ አየር ማረፊያ የተጠናቀቀ የውስጥ ማጠናቀቂያ — ቅድመ እይታ",
    previousName: "የድሮ አየር ማረፊያ የተጠናቀቀ ውስጥ — ቅድመ እይታ",
    description:
      "[ቅድመ መዝገብ] የተጠናቀቀ ፕሮጀክት እንዴት እንደሚታይ ለማሳየት የተዘጋጀ የናሙና መረጃ ነው። የMIERAG ታሪካዊ ስራ መዝገብ አይደለም።",
    status: "COMPLETED",
    address: "የድሮ አየር ማረፊያ፣ አዲስ አበባ",
    latitude: 8.99,
    longitude: 38.745,
    estimatedDuration: "5 ወራት",
    startDate: new Date("2025-11-01T00:00:00.000Z"),
    expectedCompletionDate: new Date("2026-04-01T00:00:00.000Z"),
    currentWorkerCount: 0,
    coverImageUrl: COVER_IMAGES[3],
    compensationMin: 750,
    compensationMax: 1300,
    compensationNote: "ለማሳያ የተያዘ የቅድመ እይታ ክልል ነው። ይህ ማስታወቂያ ሰራተኛ አይቀበልም።",
    skills: [
      { slug: "painting", workersNeeded: 2 },
      { slug: "carpentry", workersNeeded: 2 },
      { slug: "flooring", workersNeeded: 2 },
    ],
  },
  {
    name: "ቦሌ የንግድ ውስጥ ማጠናቀቂያ — ቅድመ እይታ",
    previousName: "Bole Commercial Fit-Out — Preview",
    description:
      "[ቅድመ መዝገብ] በቦሌ ላለ የንግድ ውስጥ ማጠናቀቂያ የናሙና መረጃ ነው። የቀጥታ የMIERAG ፕሮጀክት አይደለም።",
    status: "ROUGH_IN",
    address: "ቦሌ፣ አዲስ አበባ",
    latitude: 8.998,
    longitude: 38.793,
    estimatedDuration: "3 ወራት",
    startDate: new Date("2026-08-20T00:00:00.000Z"),
    expectedCompletionDate: new Date("2026-11-20T00:00:00.000Z"),
    currentWorkerCount: 10,
    coverImageUrl: COVER_IMAGES[4],
    compensationMin: 1000,
    compensationMax: 1800,
    compensationNote: "ለንግድ ውስጥ ሙያዎች የቅድመ እይታ የቀን ክፍያ (ብር)።",
    skills: [
      { slug: "carpentry", workersNeeded: 3 },
      { slug: "gypsum", workersNeeded: 3 },
      { slug: "electrical-work", workersNeeded: 2 },
      { slug: "other", workersNeeded: 1 },
    ],
  },
];

async function seedSkillCategories() {
  const bySlug = new Map<string, { id: string; slug: string }>();

  for (const skill of SKILL_CATEGORIES) {
    const row = await prisma.skillCategory.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name, isActive: true },
      create: { name: skill.name, slug: skill.slug, isActive: true },
    });
    bySlug.set(skill.slug, { id: row.id, slug: row.slug });
  }

  return bySlug;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });
}

async function seedSites(skillsBySlug: Map<string, { id: string; slug: string }>) {
  for (const site of PREVIEW_SITES) {
    const existing = await prisma.site.findFirst({
      where: {
        OR: [{ name: site.name }, ...(site.previousName ? [{ name: site.previousName }] : [])],
      },
    });

    const data = {
      name: site.name,
      description: site.description,
      status: site.status,
      address: site.address,
      latitude: site.latitude,
      longitude: site.longitude,
      estimatedDuration: site.estimatedDuration,
      startDate: site.startDate,
      expectedCompletionDate: site.expectedCompletionDate,
      currentWorkerCount: site.currentWorkerCount,
      coverImageUrl: site.coverImageUrl,
      compensationMin: site.compensationMin,
      compensationMax: site.compensationMax,
      compensationNote: site.compensationNote,
      isPreview: true,
    };

    const saved = existing
      ? await prisma.site.update({ where: { id: existing.id }, data })
      : await prisma.site.create({ data });

    await prisma.siteRequiredSkill.deleteMany({ where: { siteId: saved.id } });

    await prisma.siteRequiredSkill.createMany({
      data: site.skills.map((skill) => {
        const category = skillsBySlug.get(skill.slug);
        if (!category) {
          throw new Error(`Missing skill category for slug: ${skill.slug}`);
        }
        return {
          siteId: saved.id,
          skillCategoryId: category.id,
          workersNeeded: skill.workersNeeded,
        };
      }),
    });
  }
}

const PREVIEW_POSTS = [
  { slug: "g-living-01", title: "ሳሎን", category: "living", description: "የእንጨት፣ የጨርቅ እና የቀን ብርሃን የተቀናበረበት ሳሎን።", imageUrl: "/assets/preview/living.jpg" },
  { slug: "g-kitchen-01", title: "ኩሽና", category: "kitchens", description: "ካቢኔ፣ ድንጋይ እና ብርሃን በአንድ የስራ ገጽ ላይ የተደራጁ ኩሽና።", imageUrl: "/assets/preview/kitchen.jpg" },
  { slug: "g-bath-01", title: "መታጠቢያ ቤት", category: "bathrooms", description: "ሰድር፣ ድንጋይ እና እቃዎች በትክክል የተሰለፉበት መታጠቢያ።", imageUrl: "/assets/preview/bathroom.jpg" },
  { slug: "g-exterior-01", title: "የቤት ውጭ ገጽታ", category: "exterior", description: "የቤቱ ፊት፣ መክፈቻ እና አካባቢ በአንድ እይታ።", imageUrl: "/assets/preview/exterior.jpg" },
  { slug: "g-interior-01", title: "መተላለፊያ", category: "interior", description: "የተጠናቀቁ ግድግዳዎች እና የተመጠነ ብርሃን ያለው መተላለፊያ።", imageUrl: "/assets/preview/intro.jpg" },
  { slug: "g-ceiling-01", title: "ጣሪያ", category: "ceilings", description: "ጣሪያውና ግድግዳው እንደ ሕንፃ ገጽ የተጠናቀቁበት ክፍል።", imageUrl: "/assets/preview/ceiling.jpg" },
  { slug: "g-floor-01", title: "ወለል", category: "flooring", description: "ቁሳቁሱ በክፍሉ ውስጥ ሳይቋረጥ የሚሄድበት ወለል።", imageUrl: "/assets/preview/flooring.jpg" },
  { slug: "g-paint-01", title: "ቀለም", category: "painting", description: "ግድግዳው እንደ ስሜት የተጠናቀቀበት ቀለም።", imageUrl: "/assets/preview/painting.jpg" },
  { slug: "g-interior-02", title: "ደረጃ", category: "interior", description: "ቁመቱ በጥንቃቄ የተቀናበረበት የመተላለፊያ ደረጃ።", imageUrl: "/assets/preview/philosophy.jpg" },
  { slug: "g-exterior-02", title: "የፊት ገጽታ", category: "exterior", description: "የዘመናዊ ሕንፃ ፊት እና የመክፈቻ ምት።", imageUrl: "/assets/preview/facade.jpg" },
  { slug: "g-living-02", title: "የክፍል ዝርዝር", category: "living", description: "የቤት እቃ፣ ወለል እና ግድግዳ በጥንቃቄ የተገናኙበት ዝርዝር።", imageUrl: "/assets/preview/detail.jpg" },
  { slug: "g-tile-01", title: "የሰድር ስራ", category: "flooring", description: "መጋጠሚያው በትክክል የተሰራበት የእርጥበት ቦታ ሰድር።", imageUrl: "/assets/preview/tile.jpg" },
] as const;

async function seedPosts() {
  for (const post of PREVIEW_POSTS) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        description: post.description,
        category: post.category,
        imageUrl: post.imageUrl,
      },
      create: { ...post, published: true },
    });
  }
}

async function main() {
  const skillsBySlug = await seedSkillCategories();
  await seedAdmin();
  await seedSites(skillsBySlug);
  await seedPosts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed failed";
    console.error(message);
    await prisma.$disconnect();
    process.exit(1);
  });
