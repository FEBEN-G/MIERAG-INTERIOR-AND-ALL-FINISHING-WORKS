"use client";

import { useEffect, useState } from "react";
import { CinematicIntro } from "@/components/layout/CinematicIntro";
import { About } from "./About";
import { ContactCinematic } from "./ContactCinematic";
import { Hero } from "./Hero";
import { Portfolio } from "./Portfolio";
import { ProjectsSection } from "./ProjectsSection";
import { Services } from "./Services";
import { Transformation } from "./Transformation";

const INTRO_KEY = "mierag-intro-v2";

export function HomeExperience() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem(INTRO_KEY) === "1") setReady(true);
  }, []);

  return (
    <>
      {ready ? null : <CinematicIntro onComplete={() => setReady(true)} />}
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
