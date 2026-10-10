import Link from "next/link";
import Image from "next/image";
import { BRAND, NAV_ITEMS } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory px-4 py-14 sm:px-6 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Image src={BRAND.logoSrc} alt={BRAND.logoAlt} width={64} height={48} className="h-12 w-auto" />
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted">{BRAND.name}</p>
          <p className="mt-3 max-w-full text-[11px] uppercase leading-relaxed tracking-[0.14em] text-gold sm:tracking-[0.22em]">{BRAND.slogan}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href + item.label} href={item.href} className="min-w-0 text-sm leading-snug text-ink/80 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-[11px] uppercase leading-relaxed tracking-[0.12em] text-muted sm:tracking-[0.16em]">
        Ethiopia · Official contact details to be supplied
      </p>
    </footer>
  );
}
