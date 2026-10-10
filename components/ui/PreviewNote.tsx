export function PreviewNote({ children }: { children: string }) {
  return (
    <p className="max-w-xl text-[11px] uppercase leading-relaxed tracking-[0.16em] text-muted">
      {children}
    </p>
  );
}
