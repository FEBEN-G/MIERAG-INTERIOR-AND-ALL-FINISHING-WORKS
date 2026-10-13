"use client";

import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function PublicChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Header visible />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
