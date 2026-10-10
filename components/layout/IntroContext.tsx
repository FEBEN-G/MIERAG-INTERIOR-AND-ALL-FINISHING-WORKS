"use client";

import { createContext, useContext } from "react";

export const IntroContext = createContext(true);

export function useIntroReady() {
  return useContext(IntroContext);
}
