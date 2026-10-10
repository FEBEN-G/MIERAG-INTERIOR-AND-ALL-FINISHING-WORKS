import type { Metadata } from "next";
import Script from "next/script";
import { Suspense, type ReactNode } from "react";
import { Cormorant_Garamond, Noto_Sans_Ethiopic, Outfit } from "next/font/google";
import { JsonLd } from "@/components/layout/JsonLd";
import { SiteShell } from "@/components/layout/SiteShell";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const ethiopic = Noto_Sans_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND.name} · ${BRAND.slogan}`,
    template: `%s · ${BRAND.shortName}`,
  },
  description:
    "Interior finishing, exterior finishing, and construction finishing in Ethiopia — with a project directory for skilled professionals.",
  openGraph: {
    title: BRAND.name,
    description: BRAND.slogan,
    type: "website",
    locale: "en_ET",
    images: [{ url: BRAND.logoSrc, alt: BRAND.logoAlt }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} ${ethiopic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ivory text-ink">
        <Script id="mierag-theme" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("mierag-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`}
        </Script>
        <JsonLd />
        <Suspense fallback={null}>
          <SiteShell>{children}</SiteShell>
        </Suspense>
      </body>
    </html>
  );
}
