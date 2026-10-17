import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

// Original deterministic raster illustration. No external artwork or model output.
const width = 2200;
const height = 1400;
const pixels = Buffer.alloc(width * height * 4);
let seed = 20261017;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
const mix = (a: number[], b: number[], t: number) => a.map((n, i) => n + (b[i]! - n) * t);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const u = x / width;
    const v = y / height;
    let color = mix([222, 231, 219], [125, 179, 177], Math.min(1, v * 1.5));
    const sun = Math.hypot((u - 0.72) * 1.4, v - 0.24);
    if (sun < 0.09) color = mix([251, 224, 157], [249, 237, 193], sun / 0.09);
    const ridge1 = 0.48 - Math.sin(u * 8 + 1) * 0.12 - Math.cos(u * 17) * 0.03;
    const ridge2 = 0.59 - Math.sin(u * 10 + 3) * 0.095 - Math.cos(u * 19 + 1) * 0.025;
    if (v > ridge1) color = [113 + v * 20, 151 + v * 13, 145 + v * 10];
    if (v > ridge2) color = [65 + v * 20, 117 + v * 23, 113 + v * 20];
    if (v > 0.68) {
      color = mix([95, 159, 158], [29, 94, 111], (v - 0.68) / 0.32);
      const wave = Math.sin(y * 0.13 + Math.sin(x * 0.015) * 3) * Math.sin(x * 0.007 + y * 0.012);
      color = color.map((n) => n + wave * 12);
      const reflection = Math.exp(-Math.pow((u - 0.72) / (0.025 + (v - 0.68) * 0.4), 2));
      color = mix(color, [228, 213, 164], reflection * 0.6 * Math.max(0, wave));
    }
    const shore = 0.81 + Math.sin(u * 7 + 1) * 0.16;
    if (v > shore && u < 0.56) color = [41, 75, 70];
    const grain = (random() - 0.5) * 17;
    const offset = (y * width + x) * 4;
    for (let c = 0; c < 3; c++) pixels[offset + c] = Math.max(0, Math.min(255, color[c]! + grain));
    pixels[offset + 3] = 255;
  }
}
function chunk(type: string, data: Buffer) {
  const content = Buffer.concat([Buffer.from(type), data]);
  let crc = 0xffffffff;
  for (const byte of content) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([head, content, tail]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
const rows = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y++)
  pixels.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
writeFileSync(
  join(import.meta.dir, "../assets/coast-original.png"),
  Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(rows)),
    chunk("IEND", Buffer.alloc(0)),
  ]),
);
