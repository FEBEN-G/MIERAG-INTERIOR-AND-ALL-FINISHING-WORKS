import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "ghost" | "line" | "light";

const variants: Record<Variant, string> = {
  solid:
    "border border-brand bg-brand text-paper hover:bg-transparent hover:text-brand",
  ghost:
    "border border-paper/40 bg-transparent text-paper hover:border-paper hover:bg-paper/10",
  line: "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  light:
    "border border-paper bg-paper text-night hover:bg-transparent hover:text-paper",
};

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "site-label inline-flex min-h-12 items-center justify-center px-6 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "solid",
  className,
  type = "button",
  disabled,
  onClick,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "site-label inline-flex min-h-12 items-center justify-center px-6 text-[11px] uppercase tracking-[0.22em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}
