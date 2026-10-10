"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { CinematicIntro } from "./CinematicIntro";
import { IntroContext } from "./IntroContext";
import { HireProvider } from "@/components/hire/HireContext";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [introDone, setIntroDone] = useState(!isHome);

  return (
    <ThemeProvider>
    <LanguageProvider>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <clipPath id="photo-notch" clipPathUnits="objectBoundingBox">
            <path d="M0.07 0.02 H0.9 C0.97 0.02 0.98 0.07 0.98 0.14 V0.8 C0.98 0.92 0.9 0.98 0.78 0.98 H0.34 C0.24 0.98 0.2 0.88 0.14 0.8 C0.06 0.68 0.02 0.62 0.02 0.5 V0.14 C0.02 0.06 0.04 0.02 0.07 0.02 Z" />
          </clipPath>
        </defs>
      </svg>
      <IntroContext.Provider value={introDone}>
        <HireProvider>
          {isHome && !introDone ? <CinematicIntro onComplete={() => setIntroDone(true)} /> : null}
          <Header visible={introDone} />
          <main className="flex-1">{children}</main>
          <Footer />
        </HireProvider>
      </IntroContext.Provider>
    </LanguageProvider>
    </ThemeProvider>
  );
}
