import { resolve } from "node:path";

const result = await Bun.build({
  entrypoints: [resolve(import.meta.dir, "fixture.tsx")],
  target: "browser",
  minify: false,
});
if (!result.success) throw new Error(result.logs.map(String).join("\n"));
const script = await result.outputs[0]!.text();

// A local PCM asset exercises the browser media implementation without network or codecs.
const samples = 8000 * 3;
const wav = new Uint8Array(44 + samples * 2);
const header = new DataView(wav.buffer);
const label = (offset: number, value: string) => {
  for (let index = 0; index < value.length; index++) wav[offset + index] = value.charCodeAt(index);
};
label(0, "RIFF");
header.setUint32(4, wav.length - 8, true);
label(8, "WAVEfmt ");
header.setUint32(16, 16, true);
header.setUint16(20, 1, true);
header.setUint16(22, 1, true);
header.setUint32(24, 8000, true);
header.setUint32(28, 16000, true);
header.setUint16(32, 2, true);
header.setUint16(34, 16, true);
label(36, "data");
header.setUint32(40, samples * 2, true);

Bun.serve({
  hostname: "127.0.0.1",
  port: 13019,
  fetch(request) {
    const path = new URL(request.url).pathname;
    if (path === "/fixture.js")
      return new Response(script, { headers: { "content-type": "text/javascript" } });
    if (path === "/silence.wav") {
      const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.get("range") ?? "");
      if (range) {
        const start = Number(range[1]);
        const end = Math.min(Number(range[2] || wav.length - 1), wav.length - 1);
        return new Response(wav.slice(start, end + 1), {
          status: 206,
          headers: {
            "content-type": "audio/wav",
            "accept-ranges": "bytes",
            "content-range": `bytes ${start}-${end}/${wav.length}`,
          },
        });
      }
      return new Response(wav, {
        headers: { "content-type": "audio/wav", "accept-ranges": "bytes" },
      });
    }
    if (path !== "/") return new Response("Not found", { status: 404 });
    return new Response(
      '<!doctype html><html lang="en"><meta charset="utf-8"><title>Presentation contracts</title><body><main id="test-root"></main><script type="module" src="/fixture.js"></script></body></html>',
      { headers: { "content-type": "text/html" } },
    );
  },
});
