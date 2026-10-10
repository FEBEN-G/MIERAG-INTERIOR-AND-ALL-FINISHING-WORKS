import { HomeExperience } from "@/components/home/HomeExperience";
import { BRAND } from "@/lib/brand";

export const metadata = {
  title: `${BRAND.name} · ${BRAND.slogan}`,
  description:
    "From unfinished structures to refined interiors and exteriors, MIERAG transforms architectural vision into carefully finished spaces.",
};

export default function HomePage() {
  return <HomeExperience />;
}
