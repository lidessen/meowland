import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const SIZE = 16;

/** The site mark, drawn as the dark rounded square of the inline icon. */
const BACKGROUND: readonly [number, number, number, number] = [0x0f, 0x11, 0x15, 0xff];
/** The stroke of the mark. */
const STROKE: readonly [number, number, number, number] = [0xff, 0xff, 0xff, 0xff];

/** The strokes of the "M", as pixel coordinates. */
const STROKES: readonly (readonly (readonly [number, number])[])[] = [
  [
    [4, 10],
    [4, 5],
  ],
  [
    [4, 5],
    [8, 8],
  ],
  [
    [8, 8],
    [11, 5],
  ],
  [
    [11, 5],
    [11, 10],
  ],
];

/** Draw a line onto the pixel grid, one pixel wide. */
function stroke(
  pixels: Uint8Array,
  from: readonly [number, number],
  to: readonly [number, number],
) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let step = 0; step <= steps; step++) {
    const t = steps === 0 ? 0 : step / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) continue;
    const offset = (y * SIZE + x) * 4;
    pixels[offset] = STROKE[0]!;
    pixels[offset + 1] = STROKE[1]!;
    pixels[offset + 2] = STROKE[2]!;
    pixels[offset + 3] = STROKE[3]!;
  }
}

/** The 16 pixel RGBA image of the mark, top row first. */
export function faviconPixels(): Uint8Array {
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  for (let index = 0; index < SIZE * SIZE; index++) {
    const offset = index * 4;
    pixels[offset] = BACKGROUND[0]!;
    pixels[offset + 1] = BACKGROUND[1]!;
    pixels[offset + 2] = BACKGROUND[2]!;
    pixels[offset + 3] = BACKGROUND[3]!;
  }
  for (const [from, to] of STROKES) stroke(pixels, from, to);
  return pixels;
}

/** The icon as an ICO file: a header, one directory entry, and a bitmap. */
export function faviconIco(): Uint8Array {
  const pixels = faviconPixels();
  const maskRow = 4; // 16 bits padded to a four byte boundary
  const pixelsSize = SIZE * SIZE * 4;
  const maskSize = SIZE * maskRow;
  const bitmapSize = 40 + pixelsSize + maskSize;

  const ico = new Uint8Array(6 + 16 + bitmapSize);
  const view = new DataView(ico.buffer);
  // ICONDIR
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  // ICONDIRENTRY
  ico[6] = SIZE;
  ico[7] = SIZE;
  ico[8] = 0;
  ico[9] = 0;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, bitmapSize, true);
  view.setUint32(18, 22, true);
  // BITMAPINFOHEADER
  const header = 22;
  view.setUint32(header, 40, true);
  view.setUint32(header + 4, SIZE, true);
  view.setUint32(header + 8, SIZE * 2, true);
  view.setUint16(header + 12, 1, true);
  view.setUint16(header + 14, 32, true);
  view.setUint32(header + 16, 0, true);
  view.setUint32(header + 20, pixelsSize + maskSize, true);
  // The XOR bitmap is stored bottom-up in BGRA order.
  const bitmap = header + 40;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const source = ((SIZE - 1 - y) * SIZE + x) * 4;
      const target = bitmap + (y * SIZE + x) * 4;
      ico[target] = pixels[source + 2]!;
      ico[target + 1] = pixels[source + 1]!;
      ico[target + 2] = pixels[source]!;
      ico[target + 3] = pixels[source + 3]!;
    }
  }
  // The AND mask is empty: every pixel is opaque.
  return ico;
}

/**
 * Write the icon at the root of the output directory. The site's own pages
 * carry the mark inline, but the workbench inside the site is a separate
 * document, and a browser without an icon link asks the server for one.
 */
export async function writeFavicon(outputDirectory: string): Promise<void> {
  await writeFile(join(outputDirectory, "favicon.ico"), faviconIco());
}
