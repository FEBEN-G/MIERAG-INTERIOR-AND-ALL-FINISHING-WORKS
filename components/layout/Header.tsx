"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Moon, Phone, Sun } from "lucide-react";
import { BRAND, NAV_ITEMS } from "@/lib/brand";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import { NavOverlay } from "./NavOverlay";

type Props = {
  tone?: "light" | "auto";
  visible?: boolean;
};

export function Header({ tone = "auto", visible = true }: Props) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const active = useActiveSection();
  const overDarkMedia = pathname === "/" || pathname === "/gallery";
  const navKeys = ["services", "work", "projects"] as const;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  function openMenu() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  }

  const inverted = tone === "auto" && overDarkMedia && !scrolled;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
          scrolled ? "bg-ivory/92 backdrop-blur-sm" : "bg-transparent",
        )}
      >
        <div className="flex h-8 items-center justify-end gap-3 bg-night/80 px-3 text-[10px] tracking-[0.06em] text-paper backdrop-blur-sm sm:gap-5 sm:px-5 sm:text-[11px] md:px-10">
          <a
            href={BRAND.phone.startsWith("+") ? `tel:${BRAND.phone.replace(/\s/g, "")}` : "#contact"}
            className="inline-flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-gold"
          >
            <Phone size={12} strokeWidth={1.75} aria-hidden />
            <span>{BRAND.phone}</span>
          </a>
          <a
            href={BRAND.email.includes("@") ? `mailto:${BRAND.email}` : "#contact"}
            className="inline-flex max-w-[52vw] items-center gap-1.5 transition-colors hover:text-gold"
          >
            <Mail size={12} strokeWidth={1.75} aria-hidden />
            <span className="truncate">{BRAND.email}</span>
          </a>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4 md:px-10">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Image
              src={BRAND.logoSrc}
              alt=""
              width={88}
              height={68}
              priority
              className="h-10 w-auto shrink-0 sm:h-14 md:h-16"
            />
            <span
              className={cn(
                "hidden min-w-0 max-w-[9rem] text-[9px] uppercase leading-snug tracking-[0.12em] min-[480px]:block sm:max-w-[16rem] sm:text-[11px] md:max-w-xs md:tracking-[0.16em]",
                inverted ? "text-paper" : "text-ink",
              )}
            >
              {BRAND.name}
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV_ITEMS.slice(1, 4).map((item, index) => {
              const key = navKeys[index];
              const current = active === key;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative pb-1 text-[10px] uppercase tracking-[0.2em] transition-colors",
                    current
                      ? inverted
                        ? "text-paper"
                        : "text-ink"
                      : inverted
                        ? "text-paper/80 hover:text-paper"
                        : "text-ink/70 hover:text-ink",
                  )}
                >
                  {t.nav[key]}
                  <span
                    className={cn(
                      "absolute right-0 -bottom-0.5 left-0 h-px origin-left transition-transform duration-300",
                      current ? "scale-x-100 bg-gold" : "scale-x-0 bg-gold",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "am" : "en")}
              aria-label={locale === "en" ? t.nav.toAmharic : t.nav.toEnglish}
              className={cn(
                "inline-flex h-9 min-w-11 items-center justify-center border px-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors",
                inverted
                  ? "border-paper/40 text-paper hover:border-paper"
                  : "border-ink/20 text-ink hover:border-ink",
              )}
            >
              {locale === "en" ? "EN" : "AMH"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={theme === "dark"}
              aria-label={theme === "dark" ? t.nav.toLight : t.nav.toDark}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center border transition-colors",
                inverted
                  ? "border-paper/40 text-paper hover:border-paper"
                  : "border-ink/20 text-ink hover:border-ink",
              )}
            >
              {theme === "dark" ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
            </button>
          <div
            ref={menuRef}
            className="relative"
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
          >
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
            className="relative flex h-11 w-11 items-center justify-center"
          >
            <span className="sr-only">{open ? t.nav.close : t.nav.open}</span>
            <span className="flex w-6 flex-col gap-1.5">
              <span
                className={cn(
                  "block h-px w-full transition-transform duration-300",
                  inverted ? "bg-paper" : "bg-ink",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full transition-opacity duration-200",
                  inverted ? "bg-paper" : "bg-ink",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full transition-transform duration-300",
                  inverted ? "bg-paper" : "bg-ink",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
          <NavOverlay open={open} onClose={() => setOpen(false)} />
          </div>
          </div>
        </div>
      </header>
    </>
  );
}
