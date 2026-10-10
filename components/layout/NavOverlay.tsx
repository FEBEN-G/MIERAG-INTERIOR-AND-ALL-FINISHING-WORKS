"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NAV_ITEMS } from "@/lib/brand";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";

const NAV_KEYS = ["home", "services", "work", "projects", "about", "contact"] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NavOverlay({ open, onClose }: Props) {
  const reduce = useReducedMotion();
  const { locale, setLocale, t } = useI18n();
  const active = useActiveSection();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="site-menu"
          role="menu"
          aria-label="Site navigation"
          className="absolute top-[calc(100%+0.4rem)] right-0 z-[70] w-[min(18.5rem,calc(100vw-2rem))] origin-top-right overflow-hidden border border-paper/10 bg-night text-paper shadow-[0_18px_50px_rgba(20,17,15,0.28)]"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute inset-y-0 left-0 w-px bg-gold" aria-hidden />
          <nav className="flex flex-col py-2">
            {NAV_ITEMS.map((item, index) => (
              <motion.div
                key={item.href}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: 0.04 + index * 0.035 }}
              >
                <Link
                  href={item.href}
                  role="menuitem"
                  onClick={onClose}
                  aria-current={active === NAV_KEYS[index] ? "page" : undefined}
                  className="group flex items-center gap-3 px-5 py-2.5 transition-colors duration-200 hover:bg-white/6"
                >
                  <span className="w-5 text-[10px] tracking-[0.16em] text-gold">{item.index}</span>
                  <span
                    className={cn(
                      "text-[13px] tracking-wide transition-transform duration-200 group-hover:translate-x-1",
                      active === NAV_KEYS[index] && "underline decoration-gold decoration-1 underline-offset-4",
                    )}
                  >
                    {t.nav[NAV_KEYS[index]]}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-paper/10 px-5 py-3">
            <div className="flex text-[10px] uppercase tracking-[0.18em]" role="group" aria-label="Language">
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={cn("min-h-8 px-2", locale === "en" ? "text-gold" : "text-paper/45 hover:text-paper")}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("am")}
                className={cn(
                  "min-h-8 px-2 font-ethiopic",
                  locale === "am" ? "text-gold" : "text-paper/45 hover:text-paper",
                )}
              >
                አማ
              </button>
            </div>
            <button type="button" onClick={onClose} className="text-[10px] uppercase tracking-[0.18em] text-paper/50">
              {t.nav.close}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
