import { expect, test, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const directory = resolve(
  import.meta.dir,
  "../../../../../artifacts/presentation-review/toolbar-20261018",
);
const phase = process.env.CHROME_REVIEW_PHASE === "baseline" ? "baseline" : "final";
const root = (page: Page) => page.getByRole("region", { name: "First test deck", exact: true });
const controls = (page: Page) =>
  root(page).getByRole("navigation", { name: "Presentation controls" });
test.beforeAll(async () => {
  await mkdir(directory, { recursive: true });
});
const optionsTrigger = (scope: Locator) =>
  scope.getByRole("button", { name: "Presentation options", exact: true });
const optionsDialog = (scope: Locator) =>
  scope.getByRole("dialog", { name: "Presentation options", exact: true });

async function openOptions(scope: Locator) {
  const dialog = optionsDialog(scope);
  if (!(await dialog.isVisible())) await optionsTrigger(scope).click();
  await expect(dialog).toBeVisible();
  await dialog.evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => {})),
    );
  });
  return dialog;
}

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
      hit: element.contains(
        document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2),
      ),
    };
  });
  expect(box.left).toBeGreaterThanOrEqual(-1);
  expect(box.top).toBeGreaterThanOrEqual(-1);
  expect(box.right).toBeLessThanOrEqual(box.width + 1);
  expect(box.bottom).toBeLessThanOrEqual(box.height + 1);
  expect(box.hit).toBe(true);
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
    {
      name: "long-title-narrow-light",
      width: 390,
      height: 844,
      url: "/?chrome=long&scheme=light&active=false",
      formal: false,
    },
    {
      name: "narrow-host-wide-window",
      width: 1280,
      height: 900,
      url: "/?chrome=single&host=narrow&scheme=light&active=false",
      formal: false,
    },
  ];
  for (const scene of scenes) {
    await page.setViewportSize({ width: scene.width, height: scene.height });
    await page.goto(scene.url);
    if (scene.formal) await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    else await expect(page.locator('[data-meowui-part="presentation/root"]').first()).toBeVisible();
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
  for (const name of ["Next", "Choose slide", "Presentation options"])
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
  const dialog = await openOptions(controls(page));
  await dialog.getByRole("button", { name: "Pause effects", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Resume effects", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("chrome controls retain touch targets without restyling authored content controls", async ({
  page,
}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?chrome=single&scheme=light&sample=reordered");
    const chrome = page.getByRole("navigation", { name: "Presentation controls" });
    for (const name of ["Previous", "Next", "Presentation options"]) {
      const control = chrome.getByRole("button", { name, exact: true });
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
      await reachable(control);
    }
    const dialog = await openOptions(chrome);
    expect(await dialog.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
      await chrome.evaluate((element) => getComputedStyle(element).backgroundColor),
    );
    for (const name of ["Pause effects", "Actual size"]) {
      const control = dialog.getByRole("button", { name, exact: true });
      const bounds = await control.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      await reachable(control);
    }
    await page.keyboard.press("Escape");
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
      for (const name of ["Next", "Presentation options"])
        await reachable(chrome.getByRole("button", { name, exact: true }));
      await reachable(chrome.getByRole("combobox", { name: "Choose slide" }));
      await chrome.getByRole("button", { name: "Next", exact: true }).tap();
      await expect(root(page).getByLabel("Current step")).toHaveText("1");
      const dialog = await openOptions(chrome);
      await dialog.getByRole("button", { name: "Actual size", exact: true }).tap();
      const viewport = root(page).locator('[data-meowui-part="presentation/viewport"]');
      await viewport.evaluate((element) => {
        element.scrollLeft = 640;
        element.scrollTop = 360;
      });
      expect(await viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await reachable(dialog.getByRole("button", { name: "Fit to window", exact: true }));
      await page.keyboard.press("Escape");
      await chrome.getByRole("combobox", { name: "Choose slide" }).selectOption("discussion");
      await expect(
        root(page).getByRole("heading", { name: "Discussion content", exact: true }),
      ).toBeVisible();
      await openOptions(chrome);
      await dialog.getByRole("button", { name: "Fit to window", exact: true }).tap();
      await reachable(dialog.getByRole("button", { name: "Actual size", exact: true }));
      await page.keyboard.press("Escape");
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

test("options retain native toggle and Tab behavior, Escape return and outside target focus", async ({
  page,
}) => {
  await page.goto("/?chrome=single&scheme=dark&active=false");
  const chrome = controls(page);
  const trigger = optionsTrigger(chrome);
  const dialog = optionsDialog(chrome);
  await trigger.focus();
  await trigger.press("Enter");
  const pause = dialog.getByRole("button", { name: "Pause effects", exact: true });
  const actual = dialog.getByRole("button", { name: "Actual size", exact: true });
  await expect(pause).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await pause.press("Tab");
  await expect(actual).toBeFocused();
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await expect(actual).toHaveAttribute("aria-pressed", "false");
  await actual.press("Shift+Tab");
  await expect(pause).toBeFocused();
  await pause.press("Space");
  const resume = dialog.getByRole("button", { name: "Resume effects", exact: true });
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  await resume.press("Tab");
  await actual.press("Enter");
  await expect(dialog.getByRole("button", { name: "Fit to window", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Space");
  await expect(resume).toBeFocused();
  await page.evaluate(() => {
    const button = document.createElement("button");
    button.id = "options-outside-target";
    button.textContent = "Outside options target";
    document.body.append(button);
  });
  const outside = page.getByRole("button", { name: "Outside options target", exact: true });
  await outside.click();
  await expect(dialog).toBeHidden();
  await expect(outside).toBeFocused();
  await openOptions(chrome);
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  const fit = dialog.getByRole("button", { name: "Fit to window", exact: true });
  await fit.focus();
  await fit.press("Tab");
  await expect(dialog).toBeHidden();
  await openOptions(chrome);
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  await expect(fit).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    document.querySelector("#options-outside-target")?.remove();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: resolve(directory, `${phase}-options-keyboard-dark.png`),
    animations: "disabled",
  });
});

test("long titles and narrow hosts preserve reachable controls across container and viewport boundaries", async ({
  page,
}) => {
  const facts = [];
  for (const scene of [
    { width: 320, height: 844 },
    { width: 390, height: 844 },
    { width: 479, height: 844 },
    { width: 480, height: 844 },
    { width: 481, height: 844 },
    { width: 513, height: 844 },
    { width: 514, height: 844 },
    { width: 515, height: 844 },
    { width: 700, height: 844 },
    { width: 701, height: 844 },
    { width: 844, height: 390 },
    { width: 390, height: 320 },
    { width: 1280, height: 900, narrowHost: true },
  ]) {
    await page.setViewportSize({ width: scene.width, height: scene.height });
    await page.goto(
      `/?chrome=long&active=false&scheme=light${"narrowHost" in scene ? "&host=narrow" : ""}`,
    );
    await frameReady(page);
    const deck = page.locator('[data-meowui-part="presentation/root"]').first();
    const chrome = deck.getByRole("navigation", { name: "Presentation controls" });
    for (const name of ["Next", "Presentation options"])
      await reachable(chrome.getByRole("button", { name, exact: true }));
    const picker = chrome.getByRole("combobox", { name: "Choose slide" });
    await reachable(picker);
    await picker.selectOption("media");
    await expect(picker.locator('option[value="media"]')).toContainText("UnbrokenSlideTitle");
    await expect(picker).toHaveAttribute(
      "title",
      (await picker.locator('option[value="media"]').textContent())!,
    );
    expect(await page.evaluate(() => window.presentationTest.facts(0).position)).toEqual({
      slideId: "media",
      step: 0,
    });
    const dialog = await openOptions(chrome);
    await reachable(dialog.getByRole("button", { name: "Pause effects", exact: true }));
    await reachable(dialog.getByRole("button", { name: "Actual size", exact: true }));
    const geometry = await deck.evaluate((element) => {
      const get = (part: string) => {
        const rect = element
          .querySelector(`[data-meowui-part="presentation/${part}"]`)!
          .getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      };
      return {
        overflow: element.scrollWidth - element.clientWidth,
        navigation: get("navigation"),
        picker: get("slide-picker"),
        tools: get("tools"),
      };
    });
    expect(geometry.overflow).toBeLessThanOrEqual(1);
    if ("narrowHost" in scene) expect(geometry.picker.y).toBeGreaterThan(geometry.navigation.y);
    facts.push({ scene, geometry });
    if (scene.height <= 390 || "narrowHost" in scene)
      await page.screenshot({
        path: resolve(
          directory,
          `${phase}-options-${scene.width}x${scene.height}${"narrowHost" in scene ? "-narrow-host" : ""}.png`,
        ),
        animations: "disabled",
      });
  }
  await writeFile(
    resolve(directory, `${phase}-container-boundaries.json`),
    JSON.stringify(facts, null, 2),
  );
  await page.setViewportSize({ width: 390, height: 320 });
  await frameReady(page);
  const resized = page.getByRole("dialog", { name: "Presentation options", exact: true });
  await expect(resized).toBeVisible();
  await reachable(resized.getByRole("button", { name: "Pause effects", exact: true }));
  await reachable(resized.getByRole("button", { name: "Actual size", exact: true }));
  await page.screenshot({
    path: resolve(directory, `${phase}-options-resized-open.png`),
    animations: "disabled",
  });
});

test("options ids, toggles and cleanup remain isolated across two presentation instances", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto("/?scheme=light&active=false");
  const first = root(page);
  const second = page.getByRole("region", { name: "Second test deck", exact: true });
  const firstTrigger = optionsTrigger(first);
  const secondTrigger = optionsTrigger(second);
  const firstId = await firstTrigger.getAttribute("aria-controls");
  const secondId = await secondTrigger.getAttribute("aria-controls");
  expect(firstId).toBeTruthy();
  expect(firstId).not.toBe(secondId);
  for (const id of [firstId, secondId])
    expect(
      await page.evaluate(
        (value) =>
          Array.from(document.querySelectorAll("[id]")).filter((element) => element.id === value)
            .length,
        id,
      ),
    ).toBe(1);
  const firstDialog = await openOptions(first);
  await firstDialog.getByRole("button", { name: "Pause effects", exact: true }).click();
  await page.keyboard.press("Escape");
  const secondDialog = await openOptions(second);
  await expect(
    secondDialog.getByRole("button", { name: "Pause effects", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    secondDialog.getByRole("button", { name: "Actual size", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await firstTrigger.click();
  await expect(secondDialog).toBeHidden();
  await expect(
    firstDialog.getByRole("button", { name: "Resume effects", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.presentationTest.dispose());
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.querySelectorAll(":popover-open").length)).toBe(0);
});
