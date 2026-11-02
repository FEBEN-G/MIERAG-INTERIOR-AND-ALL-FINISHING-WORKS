"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { errorMessage } from "@/lib/api/client";
import { MAX_UPLOAD_BYTES, uploadImage } from "@/lib/api/content";
import { cn } from "@/lib/utils";

function canPreview(src: string) {
  return (src.startsWith("/") && !src.startsWith("//")) || src.startsWith("https://images.unsplash.com/");
}

export function Thumbnail({ src, contain, className }: { src: string; contain?: boolean; className?: string }) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-ink/5", className)}>
      {canPreview(src) ? (
        <Image src={src} alt="" fill sizes="240px" unoptimized className={contain ? "object-contain p-2" : "object-cover"} />
      ) : null}
    </div>
  );
}

export function UploadButton({
  label,
  onUploaded,
  onError,
}: {
  label: string;
  onUploaded: (url: string) => void | Promise<void>;
  onError: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      onError("That file is too large. The limit is 10 MB.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      await onUploaded(await uploadImage(file));
    } catch (err) {
      onError(errorMessage(err, "The photo could not be uploaded."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <label className={cn("inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm hover:border-ink", busy && "opacity-50")}>
      <Upload size={14} aria-hidden />
      {busy ? "Uploading…" : label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={busy}
        onChange={(event) => void onFile(event)}
      />
    </label>
  );
}

export function ImagePicker({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onError: (message: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-0.5 text-xs text-ink/60">Upload a JPG, PNG, or WebP up to 10 MB, or enter an image address.</p>
      <div className="mt-2 flex items-center gap-3">
        <Thumbnail src={value} className="h-20 w-28" />
        <UploadButton label={value ? "Replace photo" : "Upload photo"} onUploaded={onChange} onError={onError} />
      </div>
      <input
        className="field mt-2"
        aria-label={`${label} address`}
        placeholder="/assets/… or an uploaded photo’s address"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </div>
  );
}
