import { cn } from "@/lib/utils";

type Props = {
  index: string;
  label: string;
  tone?: "ink" | "paper";
  className?: string;
};

export function SectionMark({ index, label, tone = "ink", className }: Props) {
  const onDark = tone === "paper";

  return (
    <p className={cn("chapter-mark", onDark && "on-dark", className)}>
      <span className="chapter-index" aria-hidden>
        {index}
      </span>
      <span className="chapter-rule" aria-hidden />
      <span className="chapter-label">
        <span className="sr-only">{index} </span>
        {label}
      </span>
    </p>
  );
}
