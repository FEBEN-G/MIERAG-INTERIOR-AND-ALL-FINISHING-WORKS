"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Site } from "@/types";
import { HireModal } from "./HireModal";

type HireContextValue = {
  openHire: (site: Site) => void;
};

const HireContext = createContext<HireContextValue | null>(null);

export function HireProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<Site | null>(null);
  const value = useMemo(() => ({ openHire: setSite }), []);

  return (
    <HireContext.Provider value={value}>
      {children}
      <HireModal site={site} onClose={() => setSite(null)} />
    </HireContext.Provider>
  );
}

export function useHire() {
  const ctx = useContext(HireContext);
  if (!ctx) throw new Error("useHire must be used within HireProvider");
  return ctx;
}
