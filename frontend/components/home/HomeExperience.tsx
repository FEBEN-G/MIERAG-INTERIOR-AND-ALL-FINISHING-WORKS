"use client";

import { useState, useSyncExternalStore } from "react";
import { CinematicIntro } from "@/components/layout/CinematicIntro";
import { useSiteSettings } from "@/lib/site-settings";
import { About } from "./About";
import { ContactCinematic } from "./ContactCinematic";
import { Hero } from "./Hero";
import { Portfolio } from "./Portfolio";
import { ProjectsSection } from "./ProjectsSection";
import { Services } from "./Services";
import { Transformation } from "./Transformation";

const INTRO_KEY = "mierag-intro-v2";

const noop = () => () => {};

function shouldSkipIntro() {
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return reduce || sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export function HomeExperience() {
  const skipIntro = useSyncExternalStore(noop, shouldSkipIntro, () => false);
  const [introDone, setIntroDone] = useState(false);
  const ready = skipIntro || introDone;
  const { hiddenSections } = useSiteSettings().settings;

  return (
    <>
      {ready ? null : <CinematicIntro onComplete={() => setIntroDone(true)} />}
      <Hero ready={ready} />
      {hiddenSections.includes("services") ? null : <Services />}
      {hiddenSections.includes("about") ? null : <About />}
      {hiddenSections.includes("work") ? null : <Portfolio />}
      {hiddenSections.includes("transformation") ? null : <Transformation />}
      {hiddenSections.includes("projects") ? null : <ProjectsSection />}
      {hiddenSections.includes("contact") ? null : <ContactCinematic />}
    </>
  );
}
