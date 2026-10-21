import { describe, expect, test } from "bun:test";
import { faviconIco, faviconPixels } from "../favicon";

describe("the site icon", () => {
  test("the icon is an ICO file with one image", () => {
    const ico = faviconIco();
    const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
    expect(view.getUint16(0, true)).toBe(0);
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(1);
    expect(ico[6]).toBe(16);
    expect(ico[7]).toBe(16);
  });

  test("the icon carries the mark on the dark surface", () => {
    const pixels = faviconPixels();
    // The top left corner is the surface, the left stroke of the mark is white.
    const surface = [pixels[0], pixels[1], pixels[2], pixels[3]];
    expect(surface).toEqual([0x0f, 0x11, 0x15, 0xff]);
    const stroke = (7 * 16 + 4) * 4;
    expect([pixels[stroke], pixels[stroke + 1], pixels[stroke + 2]]).toEqual([0xff, 0xff, 0xff]);
  });
});
