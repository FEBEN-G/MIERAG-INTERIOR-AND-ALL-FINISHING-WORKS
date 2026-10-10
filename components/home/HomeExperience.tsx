"use client";

import { useIntroReady } from "@/components/layout/IntroContext";
import { About } from "./About";
import { ContactCinematic } from "./ContactCinematic";
import { Hero } from "./Hero";
import { Portfolio } from "./Portfolio";
import { ProjectsSection } from "./ProjectsSection";
import { Services } from "./Services";
import { Transformation } from "./Transformation";

export function HomeExperience() {
  const ready = useIntroReady();

  return (
    <>
      <Hero ready={ready} />
      <Services />
      <About />
      <Portfolio />
      <Transformation />
      <ProjectsSection />
      <ContactCinematic />
    </>
  );
}
