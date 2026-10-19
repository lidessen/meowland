import { chromium } from "@playwright/test";
import { join, normalize, resolve } from "node:path";

const here = resolve(import.meta.dir);
const repoRoot = resolve(here, "../../../..");
const shots = join(repoRoot, "artifacts/pattern-layer/shots");
await Bun.write(join(shots, ".keep"), "");
const authorFiles = ["src/pages/composer-page.tsx", "src/pages/mobile-page.tsx"];
const banned = [
  { label: "style attribute", pattern: /\bstyle\s*=/ },
  { label: "className attribute", pattern: /\bclassName\s*=/ },
  { label: "class attribute", pattern: /\bclass\s*=/ },
  { label: "CSS import", pattern: /from\s+["'][^"']*\.css["']/ },
  { label: "meowcss import", pattern: /from\s+["']meowcss/ },
  {
    label: "raw layout element",
    pattern: /<(div|span|section|header|footer|main|button|textarea|svg)\b/,
  },
];

const authorFindings: string[] = [];
for (const file of authorFiles) {
  const text = await Bun.file(join(here, file)).text();
  for (const rule of banned) {
    if (rule.pattern.test(text)) authorFindings.push(`${file}: ${rule.label}`);
  }
}

const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  async fetch(request) {
    const url = new URL(request.url);
    const requested = url.pathname === "/" ? "/index.html" : url.pathname;
    const full = normalize(join(here, requested));
    if (!full.startsWith(here)) return new Response("forbidden", { status: 403 });
    try {
      const file = Bun.file(full);
      if (!(await file.exists())) return new Response("not found", { status: 404 });
      const type = full.endsWith(".js")
        ? "text/javascript; charset=utf-8"
        : full.endsWith(".css")
          ? "text/css; charset=utf-8"
          : "text/html; charset=utf-8";
      return new Response(file, { headers: { "content-type": type } });
    } catch {
      return new Response("not found", { status: 404 });
    }
  },
});

const browser = await chromium.launch();
const findings: string[] = [...authorFindings];

async function pageFor(path: string, options: Record<string, unknown>) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 500 },
    deviceScaleFactor: 2,
    ...options,
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => findings.push(`pageerror: ${error.message}`));
  await page.goto(`${server.url}${path}`, { waitUntil: "networkidle" });
  return { context, page };
}

{
  const { context, page } = await pageFor("?page=composer", {
    colorScheme: "dark",
  });
  await page.waitForSelector('[data-meowui-part="composer-panel/root"]');
  await page.screenshot({ path: join(shots, "composer-dark-900x500.png") });
  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) return null;
      const box = element.getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    };
    const surface = document.querySelector<HTMLElement>(
      '[data-meowui-part="chat-composer/surface"]',
    );
    return {
      panel: rect('[data-meowui-part="composer-panel/root"]'),
      surface: rect('[data-meowui-part="chat-composer/surface"]'),
      editor: rect('[data-meowui-part="chat-composer/input"]'),
      actions: rect('[data-meowui-part="chat-composer/actions"]'),
      trailing: rect('[data-meowui-part="chat-composer/trailing"]'),
      submit: rect('[data-meowui-part="chat-composer/submit"]'),
      hint: rect('[data-meowui-part="chat-composer/hint"]'),
      meta: rect('[data-meowui-part="composer-panel/meta"]'),
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      surfaceBackground: surface ? getComputedStyle(surface).backgroundColor : "",
    };
  });
  if (!geometry.panel || !geometry.surface || !geometry.editor || !geometry.actions)
    findings.push("composer: missing core box");
  if (geometry.overflow) findings.push("composer: horizontal overflow");
  if (geometry.panel && Math.abs(geometry.panel.width - 720) > 2)
    findings.push(`composer: width ${geometry.panel.width}, expected 720`);
  if (
    geometry.trailing &&
    geometry.submit &&
    geometry.trailing.x + geometry.trailing.width > geometry.submit.x + 1
  )
    findings.push("composer: trailing actions overlap the submit action");
  if (
    geometry.submit &&
    geometry.surface &&
    geometry.submit.x + geometry.submit.width > geometry.surface.x + geometry.surface.width + 1
  )
    findings.push("composer: submit outside the surface");
  if (
    geometry.meta &&
    geometry.surface &&
    geometry.meta.y <= geometry.surface.y + geometry.surface.height - 1
  )
    findings.push("composer: meta not below surface");
  if (
    geometry.hint &&
    geometry.surface &&
    geometry.hint.y < geometry.surface.y + geometry.surface.height
  )
    findings.push("composer: supporting hint not outside the writing surface");
  if (geometry.meta && geometry.hint && geometry.meta.y < geometry.hint.y + geometry.hint.height)
    findings.push("composer: page facts not after the supporting hint");
  if (geometry.surfaceBackground === "rgb(255, 255, 255)")
    findings.push("composer: dark scheme not applied");
  console.log("composer geometry", JSON.stringify(geometry, null, 2));
  await context.close();
}

{
  const { context, page } = await pageFor("?page=mobile", {
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });
  await page.waitForSelector('[data-meowui-part="page-frame/root"]');
  await page.evaluate(() => {
    const log = document.querySelector<HTMLElement>('[role="log"]');
    if (log) log.scrollTop = log.scrollHeight;
  });
  await page.screenshot({ path: join(shots, "mobile-light-375x667.png") });
  const measure = () =>
    page.evaluate(() => {
      const rect = (selector: string) => {
        const element = document.querySelector<HTMLElement>(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      };
      return {
        page: rect('[data-meowui-part="page-frame/root"]'),
        header: rect('[data-meowui-part="app-bar/root"]'),
        body: rect('[data-meowui-part="page-frame/body"]'),
        notice: rect('[data-meowui-part="alert/root"]'),
        footer: rect('[data-meowui-part="page-frame/footer"]'),
        composer: rect('[data-meowui-part="chat-composer/surface"]'),
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        notices: document.querySelectorAll('[data-meowui-part="alert/root"]').length,
        reading: rect('[role="log"]'),
      };
    });
  const mobile = await measure();
  console.log("mobile geometry", JSON.stringify(mobile, null, 2));
  if (mobile.overflow) findings.push("mobile: horizontal overflow");
  if (mobile.notices !== 1) findings.push(`mobile: notices ${mobile.notices}, expected 1`);
  if (
    mobile.header &&
    mobile.notice &&
    mobile.header.y + mobile.header.height > mobile.notice.y + 1
  )
    findings.push("mobile: header/notice order");
  if (mobile.notice && mobile.body && mobile.notice.y + mobile.notice.height > mobile.body.y + 1)
    findings.push("mobile: notice/body order");
  if (mobile.body && mobile.footer && mobile.body.y + mobile.body.height > mobile.footer.y + 1)
    findings.push("mobile: body/footer order");
  if (mobile.footer && mobile.composer && mobile.footer.y > mobile.composer.y)
    findings.push("mobile: composer above footer");
  if (mobile.body && mobile.body.height < 220) findings.push("mobile: body too short at 667");
  await page.setViewportSize({ width: 375, height: 420 });
  await page.evaluate(() => document.querySelector<HTMLElement>('[role="log"]')?.scrollTo(0, 0));
  const keyboard = await measure();
  console.log("mobile keyboard geometry", JSON.stringify(keyboard, null, 2));
  await page.screenshot({ path: join(shots, "mobile-light-375x420.png") });
  if (keyboard.body && keyboard.body.height < 60) findings.push("mobile: body too short at 420");
  if (keyboard.overflow) findings.push("mobile keyboard: horizontal overflow");
  await context.close();
}

await browser.close();
server.stop(true);

console.log("author no-style findings", authorFindings);
if (findings.length) {
  console.error("\nFAIL\n" + findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log("\nPASS: author pages use public components only; composition invariants hold.");
}
