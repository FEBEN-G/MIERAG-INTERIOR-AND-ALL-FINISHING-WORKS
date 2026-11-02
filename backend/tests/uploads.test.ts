import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env", () => ({ env: { UPLOAD_DIR: "uploads" } }));

let detectImageExtension: (file: Buffer) => string | null;

beforeAll(async () => {
  ({ detectImageExtension } = await import("../src/modules/uploads/service"));
});

const bytes = (...values: number[]) => Buffer.from(values);

describe("detectImageExtension", () => {
  it("recognises JPEG, PNG, and WebP from their bytes", () => {
    expect(detectImageExtension(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(detectImageExtension(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00))).toBe("png");
    expect(detectImageExtension(Buffer.from("RIFF\x00\x00\x00\x00WEBPVP8 ", "latin1"))).toBe("webp");
  });

  it("rejects everything else, whatever the file claims to be", () => {
    expect(detectImageExtension(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(detectImageExtension(Buffer.from("<html><script>alert(1)</script>"))).toBeNull();
    expect(detectImageExtension(Buffer.from("RIFF\x00\x00\x00\x00WAVEfmt ", "latin1"))).toBeNull();
    expect(detectImageExtension(Buffer.alloc(0))).toBeNull();
  });
});
