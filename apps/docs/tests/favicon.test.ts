import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const path = join(import.meta.dir, "../favicon.ico");

describe("the site icon", () => {
  test("contains PNG images at browser icon sizes", async () => {
    const ico = await readFile(path);
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    for (const [index, size] of [16, 32, 64].entries()) {
      const entry = 6 + index * 16;
      expect(ico[entry]).toBe(size);
      expect(ico[entry + 1]).toBe(size);
      const offset = ico.readUInt32LE(entry + 12);
      expect([...ico.subarray(offset, offset + 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    }
  });
});
