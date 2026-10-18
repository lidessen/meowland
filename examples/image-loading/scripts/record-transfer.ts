import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const assetRoot = join(import.meta.dir, "../assets");
const temporary = await import("node:fs/promises").then((fs) =>
  fs.mkdtemp("/tmp/meowland-transfer-recording-"),
);
const files = {
  original: new Uint8Array(await readFile(join(assetRoot, "coast-original.png"))),
  delivery: new Uint8Array(await readFile(join(assetRoot, "coast-delivery.jpg"))),
};
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>Controlled local image transfer</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f4ea;color:#163f3a;font:18px system-ui,sans-serif;padding:38px 44px}h1{font-size:35px;letter-spacing:-.03em;margin:8px 0 10px}p{margin:0 0 24px;line-height:1.4}.eyebrow{font-size:13px;color:#b74b2d;letter-spacing:.15em;text-transform:uppercase;font-weight:700;margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}.image{width:100%;height:235px;background:#dce6dc;border-radius:12px;display:grid;place-items:center;overflow:hidden}.image img{width:100%;height:100%;object-fit:cover}.status{font-size:16px;margin:10px 0}.bar{height:10px;background:#d1dfd3;border-radius:12px;overflow:hidden}.fill{height:100%;background:#326a5a;width:0}.original .fill{background:#d85b37}.note{font-size:15px;color:#536c65;margin-top:22px}.counter{font-variant-numeric:tabular-nums}</style><body><p class="eyebrow">Actual browser requests · controlled loopback server</p><h1>Same picture. Different amount to send.</h1><p>32 KiB per chunk · one chunk every 70 ms · cache disabled</p><div class="grid"><section class="original"><div class="image">Waiting for original PNG…</div><p class="status">PNG · <span class="counter">0 bytes</span></p><div class="bar"><div class="fill"></div></div></section><section class="delivery"><div class="image">Waiting for delivery JPEG…</div><p class="status">JPEG · <span class="counter">0 bytes</span></p><div class="bar"><div class="fill"></div></div></section></div><p class="note">The wait is imposed by this local server. This is a reproducible illustration,<br>not a measurement of public-network performance.</p><script>
async function load(name){const root=document.querySelector('.'+name),start=performance.now();const response=await fetch('/'+name);const expected=${JSON.stringify({ original: files.original.byteLength, delivery: files.delivery.byteLength })};const total=expected[name];const reader=response.body.getReader();let bytes=0;const chunks=[];while(true){const part=await reader.read();if(part.done)break;chunks.push(part.value);bytes+=part.value.length;root.querySelector('.counter').textContent=bytes.toLocaleString('en-US')+' / '+total.toLocaleString('en-US')+' bytes';root.querySelector('.fill').style.width=(bytes/total*100)+'%';}if(bytes!==total)throw new Error('Transferred bytes differ from source file');const img=new Image();img.src=URL.createObjectURL(new Blob(chunks,{type:response.headers.get('content-type')}));await img.decode();root.querySelector('.image').replaceChildren(img);root.querySelector('.counter').textContent=bytes.toLocaleString('en-US')+' bytes · decoded in '+((performance.now()-start)/1000).toFixed(1)+' s';return {name,bytes,elapsedMs:Math.round(performance.now()-start)};}
window.results=[];setTimeout(()=>Promise.all([load('original'),load('delivery')]).then(value=>{window.results=value;document.body.dataset.loaded='true'}),800);
</script></body></html>`;
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(request) {
    const name = new URL(request.url).pathname.slice(1);
    if (name === "") return new Response(html, { headers: { "Content-Type": "text/html" } });
    if (name !== "original" && name !== "delivery")
      return new Response("Not found", { status: 404 });
    const data = files[name];
    let offset = 0;
    let timer: ReturnType<typeof setTimeout>;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const next = () => {
          if (offset >= data.byteLength) {
            controller.close();
            return;
          }
          const end = Math.min(data.byteLength, offset + 32768);
          controller.enqueue(data.slice(offset, end));
          offset = end;
          timer = setTimeout(next, 70);
        };
        timer = setTimeout(next, 70);
      },
      cancel() {
        clearTimeout(timer);
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": name === "original" ? "image/png" : "image/jpeg",
        "Content-Length": String(data.byteLength),
        "Cache-Control": "no-store",
      },
    });
  },
});
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 960, height: 600 },
    recordVideo: { dir: temporary, size: { width: 960, height: 600 } },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const video = page.video()!;
  const started = performance.now();
  await page.goto(String(server.url));
  await page.locator('body[data-loaded="true"]').waitFor();
  const results = await page.evaluate(() => (window as unknown as { results: unknown }).results);
  await page.waitForTimeout(Math.max(0, 12000 - (performance.now() - started)));
  await page.screenshot({ path: join(temporary, "end-state.png") });
  await context.close();
  const raw = await video.path();
  const encode = Bun.spawn(
    [
      "ffmpeg",
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      raw,
      "-t",
      "12",
      "-c:v",
      "libvpx",
      "-b:v",
      "550k",
      "-an",
      join(assetRoot, "local-transfer.webm"),
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  if ((await encode.exited) !== 0) throw new Error("FFmpeg recording encode failed");
  await writeFile(
    join(assetRoot, "recording.json"),
    JSON.stringify(
      {
        generator: "scripts/record-transfer.ts",
        condition:
          "Loopback HTTP with 32768-byte chunks, one every 70ms, no-store; both requests start together after 800ms",
        viewport: "960x600",
        durationSeconds: 12,
        codec: "VP8, silent",
        browser: browser.version(),
        results,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      recording: join(assetRoot, "local-transfer.webm"),
      results,
      endState: join(temporary, "end-state.png"),
    }),
  );
} finally {
  await browser.close();
  server.stop(true);
}
