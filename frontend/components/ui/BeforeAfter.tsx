"use client";

import { useCallback, useId, useRef, useState } from "react";
import Image from "next/image";
import type { BeforeAfterPair } from "@/types";

export function BeforeAfter({ pair }: { pair: BeforeAfterPair }) {
  const [value, setValue] = useState(50);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const labelId = useId();

  const updateFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.min(100, Math.max(0, next)));
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    updateFromClientX(event.clientX);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div className="space-y-4">
      <div
        ref={trackRef}
        className="relative aspect-[16/10] cursor-ew-resize overflow-hidden bg-night select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Image src={pair.after.src} alt={pair.after.alt} fill sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <Image src={pair.before.src} alt={pair.before.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${value}%` }}>
          <div className="absolute inset-y-0 -ml-px w-px bg-paper" />
          <div className="absolute top-1/2 left-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-paper bg-night text-paper">
            <span className="sr-only">Drag to compare</span>
            <span aria-hidden className="text-xs">
              ‹ ›
            </span>
          </div>
        </div>
        <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.18em] text-paper">Before</span>
        <span className="absolute right-4 bottom-4 text-[10px] uppercase tracking-[0.18em] text-paper">After</span>
      </div>
      <label className="block">
        <span id={labelId} className="sr-only">
          Compare unfinished structure and finished space
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          aria-labelledby={labelId}
          onChange={(event) => setValue(Number(event.target.value))}
          className="h-11 w-full accent-brand"
        />
      </label>
    </div>
  );
}
