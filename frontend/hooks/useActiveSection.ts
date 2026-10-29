"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type ActiveNav = "services" | "work" | "projects" | null;

const WATCH = ["services", "about", "work", "projects", "contact"] as const;

function navFor(id: (typeof WATCH)[number]): ActiveNav {
  if (id === "services" || id === "work" || id === "projects") return id;
  return null;
}

export function useActiveSection(): ActiveNav {
  const pathname = usePathname();
  const [section, setSection] = useState<ActiveNav>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    const update = () => {
      const line = Math.min(180, window.innerHeight * 0.28);
      let current: ActiveNav = null;
      for (const id of WATCH) {
        const node = document.getElementById(id);
        if (!node) continue;
        if (node.getBoundingClientRect().top <= line) current = navFor(id);
      }
      setSection((previous) => (previous === current ? previous : current));
    };

    update();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("hashchange", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("hashchange", update);
    };
  }, [isHome]);

  if (pathname.startsWith("/gallery")) return "work";
  if (pathname.startsWith("/projects")) return "projects";
  return isHome ? section : null;
}
