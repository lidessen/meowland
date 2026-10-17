import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve(
  import.meta.dir,
  "../../../../../artifacts/presentation-review/chrome-20261017",
);
const phase = process.env.CHROME_REVIEW_PHASE === "baseline" ? "baseline" : "final";
const root = (page: Page) => page.getByRole("region", { name: "First test deck", exact: true });
const controls = (page: Page) =>
  root(page).getByRole("navigation", { name: "Presentation controls" });

async function frameReady(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
    await new Promise<void>((done) =>
      requestAnimationFrame(() => requestAnimationFrame(() => done())),
    );
  });
}

async function reachable(control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
      width: innerWidth,
      height: innerHeight,
    };
  });
  expect(box.left).toBeGreaterThanOrEqual(-1);
  expect(box.top).toBeGreaterThanOrEqual(-1);
  expect(box.right).toBeLessThanOrEqual(box.width + 1);
  expect(box.bottom).toBeLessThanOrEqual(box.height + 1);
}

test("chrome screenshots preserve the formal work and expose real light/dark host themes", async ({
  page,
}) => {
  await mkdir(directory, { recursive: true });
  const scenes = [
    {
      name: "formal-opening-wide-light",
      width: 1440,
      height: 960,
      url: "http://127.0.0.1:13009/",
      formal: true,
    },
    {
      name: "formal-opening-narrow-light",
      width: 390,
      height: 844,
      url: "http://127.0.0.1:13009/",
      formal: true,
    },
    {
      name: "fixture-wide-light",
      width: 1280,
      height: 900,
      url: "/?chrome=single&scheme=light&active=false",
      formal: false,
    },
    {
      name: "fixture-wide-dark",
      width: 1280,
      height: 900,
      url: "/?chrome=single&scheme=dark&active=false",
      formal: false,
    },
    {
      name: "fixture-narrow-dark",
      width: 390,
      height: 844,
      url: "/?chrome=single&scheme=dark&active=false",
      formal: false,
    },
    {
      name: "fixture-short-light",
      width: 844,
      height: 390,
      url: "/?chrome=single&scheme=light&active=false",
      formal: false,
    },
  ];
  for (const scene of scenes) {
    await page.setViewportSize({ width: scene.width, height: scene.height });
    await page.goto(scene.url);
    if (scene.formal) await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    else await expect(root(page)).toBeVisible();
    await frameReady(page);
    await page.screenshot({
      path: resolve(directory, `${phase}-${scene.name}.png`),
      animations: "disabled",
    });
  }
});

test("keyboard can reach every enabled chrome control and operate its existing actions", async ({
  page,
}) => {
  await page.goto("/?chrome=single&scheme=dark");
  await root(page).focus();
  const reached = new Set<string>();
  for (let index = 0; index < 16; index++) {
    await page.keyboard.press("Tab");
    const name = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement | null;
      if (!element?.closest('[data-meowui-part="presentation/controls"]')) return "";
      return element.getAttribute("aria-label") ?? element.textContent?.trim() ?? "";
    });
    reached.add(name);
  }
  for (const name of ["Next", "Choose slide", "Pause effects", "Actual size"])
    expect(reached.has(name)).toBe(true);
  const next = controls(page).getByRole("button", { name: "Next", exact: true });
  await next.focus();
  await expect(next).toBeFocused();
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: resolve(directory, `${phase}-fixture-keyboard-focus-dark.png`),
    animations: "disabled",
  });
  await next.press("Enter");
  await expect(root(page).getByLabel("Current step")).toHaveText("1");
  await controls(page).getByRole("button", { name: "Pause effects", exact: true }).click();
  await expect(
    controls(page).getByRole("button", { name: "Resume effects", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("chrome controls retain touch targets without restyling authored content controls", async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?chrome=single&scheme=light&sample=reordered");
    const chrome = page.getByRole("navigation", { name: "Presentation controls" });
    for (const name of ["Previous", "Next", "Pause effects", "Actual size"]) {
      const control = chrome.getByRole("button", { name, exact: true });
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      await reachable(control);
    }
  }
  const style = (element: Element) => {
    const css = getComputedStyle(element);
    return { font: css.font, minHeight: css.minHeight, padding: css.padding };
  };
  const contentStyle = await page
    .getByRole("button", { name: "Open evidence", exact: true })
    .evaluate(style);
  const referenceStyle = await page.locator("#fixture-style-reference").evaluate(style);
  expect(contentStyle).toEqual(referenceStyle);
  const geometry = await page.evaluate(() => {
    const viewport = document
      .querySelector('[data-meowui-part="presentation/viewport"]')!
      .getBoundingClientRect();
    const controls = document
      .querySelector('[data-meowui-part="presentation/controls"]')!
      .getBoundingClientRect();
    return { stageBottom: viewport.bottom, controlsTop: controls.top };
  });
  expect(geometry.controlsTop).toBeGreaterThanOrEqual(geometry.stageBottom);
});

test("chrome computed diagnostics distinguish host theme from authored slide content", async ({
  page,
}) => {
  const samples = [];
  const content = [];
  for (const scene of [
    { name: "authored-light", scheme: "light", width: 1280, height: 900, sample: "reordered" },
    { name: "authored-dark", scheme: "dark", width: 1280, height: 900, sample: "reordered" },
    { name: "plain-wide", scheme: "light", width: 1280, height: 900, sample: "" },
    { name: "plain-narrow", scheme: "light", width: 390, height: 844, sample: "" },
    { name: "plain-short", scheme: "light", width: 844, height: 390, sample: "" },
    { name: "formal-narrow", scheme: "light", width: 390, height: 844, sample: "", formal: true },
  ]) {
    await page.setViewportSize({ width: scene.width, height: scene.height });
    await page.goto(
      "formal" in scene
        ? "http://127.0.0.1:13009/"
        : `/?chrome=single&active=false&scheme=${scene.scheme}&sample=${scene.sample}`,
    );
    await frameReady(page);
    const facts = await page.evaluate(() => {
      const rect = (element: Element) => {
        const value = element.getBoundingClientRect();
        const css = getComputedStyle(element);
        return {
          x: value.x,
          y: value.y,
          width: value.width,
          height: value.height,
          fontSize: css.fontSize,
          padding: css.padding,
          minWidth: css.minWidth,
          minHeight: css.minHeight,
          gridTemplateColumns: css.gridTemplateColumns,
          flexBasis: css.flexBasis,
          flexShrink: css.flexShrink,
        };
      };
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const rgba = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data);
      };
      const blend = (front: number[], back: number[]) => {
        const alpha = front[3]! / 255;
        return front
          .slice(0, 3)
          .map((channel, index) => channel * alpha + back[index]! * (1 - alpha))
          .concat(255);
      };
      const luminance = (color: number[]) =>
        color.slice(0, 3).reduce((sum, channel, index) => {
          const value = channel / 255;
          return (
            sum +
            (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
              [0.2126, 0.7152, 0.0722][index]!
          );
        }, 0);
      const text = Array.from(
        document.querySelectorAll(
          '[data-meowui-part="presentation/title"], [data-meowui-part="presentation/page-number"], [data-meowui-part="presentation/step"], [data-meowui-part="presentation/slide-picker"] > span, [data-meowui-part="presentation/slide-picker"] select, [data-meowui-part="presentation/tools"] button',
        ),
      ).map((element) => {
        let background = [255, 255, 255, 255];
        let opacity = 1;
        const ancestors: Element[] = [];
        for (let current: Element | null = element; current; current = current.parentElement)
          ancestors.unshift(current);
        for (const ancestor of ancestors) {
          const css = getComputedStyle(ancestor);
          background = blend(rgba(css.backgroundColor), background);
          opacity *= Number(css.opacity);
        }
        const css = getComputedStyle(element);
        const foreground = blend(rgba(css.color), background);
        const first = luminance(foreground);
        const second = luminance(background);
        return {
          text: element.textContent?.trim(),
          part: element.getAttribute("data-meowui-part"),
          color: css.color,
          background,
          opacity,
          contrast: (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
        };
      });
      const layout = Array.from(
        document.querySelectorAll(
          '[data-meowui-part="presentation/viewport"], [data-meowui-part="presentation/stage"], [data-meowui-part="presentation/controls"], [data-meowui-part="presentation/navigation"], [data-meowui-part="presentation/navigation"] button, [data-meowui-part="presentation/slide-picker"], [data-meowui-part="presentation/tools"], [data-meowui-part="presentation/tools"] button',
        ),
      ).map((element) => ({
        part: element.getAttribute("data-meowui-part"),
        text: element.textContent?.trim(),
        ...rect(element),
      }));
      const slide = document.querySelector('[data-meowui-part="presentation/slide"]')!;
      const heading = slide.querySelector("h2") ?? slide.querySelector("h1")!;
      return {
        text,
        layout,
        slide: {
          paper: getComputedStyle(slide).backgroundColor,
          ink: getComputedStyle(heading).color,
          font: getComputedStyle(heading).fontSize,
        },
      };
    });
    samples.push({ scene, ...facts });
    if (scene.sample) {
      content.push(facts.slide);
      await page.screenshot({
        path: resolve(directory, `${phase}-fixture-${scene.name}.png`),
        animations: "disabled",
      });
    }
  }
  expect(content[0]).toEqual(content[1]);
  await writeFile(resolve(directory, `${phase}-computed.json`), JSON.stringify(samples, null, 2));
});

test.describe("touch and constrained hosts", () => {
  test.use({ hasTouch: true });
  test("navigation, directory, pause and fit remain reachable in narrow and short windows", async ({
    page,
  }) => {
    for (const size of [
      { width: 390, height: 844 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(size);
      await page.goto("/?chrome=single&scheme=light&active=false");
      const chrome = controls(page);
      for (const name of ["Next", "Pause effects", "Actual size"])
        await reachable(chrome.getByRole("button", { name, exact: true }));
      await reachable(chrome.getByRole("combobox", { name: "Choose slide" }));
      await chrome.getByRole("button", { name: "Next", exact: true }).tap();
      await expect(root(page).getByLabel("Current step")).toHaveText("1");
      await chrome.getByRole("button", { name: "Actual size", exact: true }).tap();
      await reachable(chrome.getByRole("button", { name: "Fit to window", exact: true }));
      await chrome.getByRole("combobox", { name: "Choose slide" }).selectOption("discussion");
      await expect(
        root(page).getByRole("heading", { name: "Discussion content", exact: true }),
      ).toBeVisible();
      await chrome.getByRole("button", { name: "Fit to window", exact: true }).tap();
      await reachable(chrome.getByRole("button", { name: "Actual size", exact: true }));
      await reachable(root(page).locator("audio"));
    }
  });
});

test("a native host fullscreen container retains chrome controls without a player fullscreen feature", async ({
  page,
}) => {
  await page.goto("/?chrome=single&scheme=light&active=false");
  const supported = await page.evaluate(
    () =>
      document.fullscreenEnabled &&
      typeof document.documentElement.requestFullscreen === "function",
  );
  test.skip(!supported, "The browser host does not expose or permit the native Fullscreen API.");
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.textContent = "Host fullscreen";
    button.onclick = () => {
      void document
        .querySelector<HTMLElement>("#test-root")!
        .requestFullscreen()
        .catch((error: unknown) => {
          button.dataset.error = String(error);
        });
    };
    document.body.append(button);
  });
  const request = page.getByRole("button", { name: "Host fullscreen", exact: true });
  await request.click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement?.id ?? ""))
    .toBe("test-root");
  await reachable(controls(page).getByRole("button", { name: "Next", exact: true }));
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: resolve(directory, `${phase}-fixture-native-fullscreen-light.png`),
    animations: "disabled",
  });
  await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
});
