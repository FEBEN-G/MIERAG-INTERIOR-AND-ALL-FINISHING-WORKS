import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { env } from "../../config/env";
import { AppError } from "../../middleware/error";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const UPLOAD_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const UPLOAD_URL_PREFIX = "/api/uploads";
const MAX_DIMENSION = 2000;

/** Decides the type from the file's own bytes; the browser's Content-Type is not trusted. */
export function detectImageExtension(file: Buffer): "jpg" | "png" | "webp" | null {
  if (file.length >= 3 && file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff) return "jpg";
  if (file.length >= 8 && file.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (
    file.length >= 12 &&
    file.subarray(0, 4).toString("latin1") === "RIFF" &&
    file.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

/**
 * Fits the photo within 2000 px so pages stay fast on phones. Re-encoding also drops hidden
 * metadata such as the GPS location a phone camera records, and proves the file is a real image.
 */
async function optimize(file: Buffer, extension: "jpg" | "png" | "webp") {
  const image = sharp(file)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true });
  if (extension === "jpg") return image.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (extension === "png") return image.png({ compressionLevel: 9 }).toBuffer();
  return image.webp({ quality: 82 }).toBuffer();
}

export async function saveUpload(body: unknown) {
  const extension = Buffer.isBuffer(body) ? detectImageExtension(body) : null;
  if (!extension) {
    throw new AppError(415, "Use a JPG, PNG, or WebP image.");
  }
  const optimized = await optimize(body as Buffer, extension).catch(() => {
    throw new AppError(415, "That image could not be read. Try saving it again as a JPG.");
  });
  await mkdir(env.UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${extension}`;
  await writeFile(path.join(env.UPLOAD_DIR, name), optimized, { flag: "wx" });
  return { data: { url: `${UPLOAD_URL_PREFIX}/${name}` } };
}
