import { describe, expect, it } from "vitest";
import { normalizeEthiopianPhone } from "../src/utils/phone";

describe("normalizeEthiopianPhone", () => {
  it("keeps +2519XXXXXXXX unchanged", () => {
    expect(normalizeEthiopianPhone("+251911234567")).toBe("+251911234567");
  });

  it("keeps +2517XXXXXXXX unchanged", () => {
    expect(normalizeEthiopianPhone("+251711234567")).toBe("+251711234567");
  });

  it("normalizes 09XXXXXXXX to +2519XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("0911234567")).toBe("+251911234567");
  });

  it("normalizes 07XXXXXXXX to +2517XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("0711234567")).toBe("+251711234567");
  });

  it("normalizes 9XXXXXXXX to +2519XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("911234567")).toBe("+251911234567");
  });

  it("normalizes 7XXXXXXXX to +2517XXXXXXXX", () => {
    expect(normalizeEthiopianPhone("711234567")).toBe("+251711234567");
  });

  it("strips spaces and hyphens before normalizing", () => {
    expect(normalizeEthiopianPhone("091 123 4567")).toBe("+251911234567");
    expect(normalizeEthiopianPhone("+251-911-234567")).toBe("+251911234567");
  });

  it("returns null for invalid numbers", () => {
    expect(normalizeEthiopianPhone("")).toBeNull();
    expect(normalizeEthiopianPhone("0811234567")).toBeNull();
    expect(normalizeEthiopianPhone("91123456")).toBeNull();
    expect(normalizeEthiopianPhone("+251411234567")).toBeNull();
    expect(normalizeEthiopianPhone("not-a-phone")).toBeNull();
    expect(normalizeEthiopianPhone(null)).toBeNull();
  });
});
