import { expect, test, type Locator, type Page } from "@playwright/test";

const slideIds = ["welcome", "growth", "problems", "protect", "meaning", "act"] as const;
const tasks = ["growth", "problems", "protect", "meaning", "act"] as const;
const supportNames = ["Hint", "Reference", "Evidence"] as const;
const canvas = (page: Page) => page.locator('[data-meowui-part="presentation/slide"]');
const directory = (page: Page) => page.getByRole("combobox", { name: "Choose slide", exact: true });
const supportButton = (page: Page, name: string) =>
  canvas(page).getByRole("button", { name, exact: true });
const supportPanel = (page: Page, name: string) =>
  canvas(page).locator(`section[aria-label="${name} panel"]`);

async function ready(page: Page) {
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, (image) => image.decode()));
  });
}

async function visit(page: Page, id: string) {
  await directory(page).selectOption(id);
  await ready(page);
  await expect(directory(page)).toHaveValue(id);
}

async function expectSupport(page: Page, name: string, expanded: boolean) {
  await expect(supportButton(page, name)).toHaveAttribute("aria-expanded", String(expanded));
  const panel = supportPanel(page, name);
  const panelId = await panel.getAttribute("id");
  expect(panelId).toBeTruthy();
  await expect(supportButton(page, name)).toHaveAttribute("aria-controls", panelId!);
  if (expanded) await expect(panel).toBeVisible();
  else {
    await expect(panel).toBeHidden();
    await expect(
      canvas(page).getByRole("region", { name: `${name} panel`, exact: true }),
    ).toHaveCount(0);
  }
}

async function reachable(locator: Locator) {
  await locator.focus();
  await expect(locator).toBeInViewport();
  const bounds = await locator.boundingBox();
  const viewport = locator.page().viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(bounds!.y).toBeGreaterThanOrEqual(-1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
}

test("teacher hints, reference and evidence open independently and can be withdrawn and restored", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  for (const id of tasks) {
    await visit(page, id);
    const excerpts = canvas(page).getByRole("region", { name: "Reading excerpts", exact: true });
    const originalText = (await excerpts.count())
      ? ((await excerpts.textContent()) ?? "")
      : undefined;
    for (const name of supportNames) await expectSupport(page, name, false);
    await supportButton(page, "Hint").focus();
    await page.keyboard.press("Enter");
    await expectSupport(page, "Hint", true);
    await expectSupport(page, "Reference", false);
    await expectSupport(page, "Evidence", false);
    await supportButton(page, "Evidence").click();
    await expectSupport(page, "Evidence", true);
    if (originalText !== undefined) {
      await expect(excerpts).toHaveText(originalText);
      for (const mark of await excerpts.locator("[data-evidence]").all())
        await expect(mark).toHaveAttribute("data-evidence", "true");
    }
    await expectSupport(page, "Reference", false);
    await supportButton(page, "Reference").click();
    await supportButton(page, "Hint").click();
    await expectSupport(page, "Hint", false);
    await expectSupport(page, "Reference", true);
    await expectSupport(page, "Evidence", true);
    await supportButton(page, "Reference").click();
    await expectSupport(page, "Reference", false);
    await expectSupport(page, "Evidence", true);
    await supportButton(page, "Hint").click();
    await expectSupport(page, "Hint", true);
    await supportButton(page, "Evidence").click();
    await expectSupport(page, "Evidence", false);
    if (originalText !== undefined) {
      await expect(excerpts).toHaveText(originalText);
      for (const mark of await excerpts.locator("[data-evidence]").all())
        await expect(mark).toHaveAttribute("data-evidence", "false");
    }
    await expect(directory(page)).toHaveValue(id);
  }
});

test("page visits preserve each task while an explicit restart clears only that task", async ({
  page,
}) => {
  await page.goto("/?slide=growth");
  await ready(page);
  const stage = canvas(page).getByRole("button", { name: "Select stage:", exact: false }).first();
  await stage.click();
  await expect(stage).toHaveAttribute("aria-pressed", "true");
  await supportButton(page, "Hint").click();
  await visit(page, "act");
  const idea = canvas(page).getByRole("button", { name: "Use idea:", exact: false }).first();
  const draft = page.getByRole("textbox", { name: "My action and reason", exact: true });
  await idea.click();
  await expect(draft).toHaveValue("");
  await draft.fill("I could share what I learned because others can make informed choices.");
  for (const name of supportNames) await supportButton(page, name).click();
  await visit(page, "protect");
  await visit(page, "act");
  await expect(idea).toHaveAttribute("aria-pressed", "true");
  await expect(draft).toHaveValue(
    "I could share what I learned because others can make informed choices.",
  );
  for (const name of supportNames) await expectSupport(page, name, true);
  await page.getByRole("button", { name: "Start this task again", exact: true }).click();
  await expect(draft).toHaveValue("");
  await expect(idea).toHaveAttribute("aria-pressed", "false");
  for (const name of supportNames) await expectSupport(page, name, false);
  await visit(page, "growth");
  await expect(stage).toHaveAttribute("aria-pressed", "true");
  await expectSupport(page, "Hint", true);
  await page.getByRole("button", { name: "Start this task again", exact: true }).click();
  await expect(stage).toHaveAttribute("aria-pressed", "false");
  for (const name of supportNames) await expectSupport(page, name, false);
});

test("classroom choices stay visible and native keyboard input never advances the lesson", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  for (const [id, prefix] of [
    ["growth", "Select stage:"],
    ["problems", "Explore problem:"],
    ["protect", "Choose action:"],
    ["act", "Use idea:"],
  ] as const) {
    await visit(page, id);
    await expect(canvas(page).locator("select")).toHaveCount(0);
    const choices = canvas(page).getByRole("button", { name: prefix, exact: false });
    expect(await choices.count()).toBeGreaterThan(1);
    for (const choice of await choices.all()) await expect(choice).toBeVisible();
    await choices.first().focus();
    await page.keyboard.press("Space");
    await expect(choices.first()).toHaveAttribute("aria-pressed", "true");
    await expect(directory(page)).toHaveValue(id);
    for (const name of supportNames) await expectSupport(page, name, false);
  }
  await expect(canvas(page).getByRole("button", { name: "Use idea:", exact: false })).toHaveCount(
    3,
  );
  const draft = page.getByRole("textbox", { name: "My action and reason", exact: true });
  await expect(draft).toHaveValue("");
  await draft.fill("My independent idea");
  await draft.press("Home");
  await draft.press("ArrowRight");
  await draft.press("Space");
  await draft.press("End");
  await expect(directory(page)).toHaveValue("act");
  await expectSupport(page, "Reference", false);
  const written = await draft.inputValue();
  await canvas(page).getByRole("button", { name: "Use idea:", exact: false }).last().click();
  await expect(draft).toHaveValue(written);
  await visit(page, "meaning");
  const meanings = canvas(page).locator("button[aria-pressed]");
  await expect(meanings).toHaveCount(2);
  await meanings.first().focus();
  await page.keyboard.press("Enter");
  await expect(meanings.first()).toHaveAttribute("aria-pressed", "true");
  await expect(directory(page)).toHaveValue("meaning");
});

test("the delivered lesson cold-starts every scene without outside resources or runtime errors", async ({
  page,
}) => {
  const outside: string[] = [];
  const failures: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failures.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.route("**/*", async (route) => {
    if (new URL(route.request().url()).origin !== "http://127.0.0.1:13034") {
      outside.push(route.request().url());
      await route.abort("internetdisconnected");
    } else await route.continue();
  });
  await page.goto("/");
  await ready(page);
  expect(
    await directory(page)
      .locator("option")
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)),
  ).toEqual(slideIds);
  for (const id of slideIds) {
    await visit(page, id);
    await expect(canvas(page).locator("select")).toHaveCount(0);
    for (const image of await canvas(page).locator("img").all()) {
      expect(
        await image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
      await expect(image).toHaveAttribute("alt");
    }
  }
  await page.reload();
  await ready(page);
  await expect(directory(page)).toHaveValue("welcome");
  expect(outside).toEqual([]);
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});

test("direct task entry and reduced motion keep teacher support hidden until explicitly requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const id of tasks) {
    await page.goto(`/?slide=${id}`);
    await ready(page);
    await expect(directory(page)).toHaveValue(id);
    for (const name of supportNames) await expectSupport(page, name, false);
    await supportButton(page, "Evidence").click();
    await expectSupport(page, "Evidence", true);
    await expectSupport(page, "Hint", false);
    await expectSupport(page, "Reference", false);
  }
});

test("expanded classroom scenes fit the canvas and keep controls reachable in wide, narrow and short windows", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1280, height: 330 },
  ]) {
    await page.setViewportSize(size);
    for (const id of slideIds) {
      await page.goto(`/?slide=${id}`);
      await ready(page);
      if (id === "welcome") await page.getByRole("button", { name: "Next", exact: true }).click();
      if (id !== "welcome")
        for (const name of supportNames) await supportButton(page, name).click();
      if (id === "act")
        await page
          .getByRole("textbox", { name: "My action and reason", exact: true })
          .fill(
            "I could explain the problem, connect an action to the reading evidence, and invite others to make a careful choice. ".repeat(
              5,
            ),
          );
      const clipped = await canvas(page).evaluate((slide) => {
        const bounds = slide.getBoundingClientRect();
        return Array.from(
          slide.querySelectorAll("h1,h2,h3,p,blockquote,img,button,input,textarea,select"),
        )
          .filter((element) => element.checkVisibility({ visibilityProperty: true }))
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.left < bounds.left - 1 ||
              box.right > bounds.right + 1 ||
              box.top < bounds.top - 1 ||
              box.bottom > bounds.bottom + 1
            );
          })
          .map((element) => ({
            tag: element.tagName,
            name: element.getAttribute("aria-label") ?? element.textContent?.trim(),
          }));
      });
      expect(
        clipped,
        `${id} at ${size.width}x${size.height} contains clipped classroom content`,
      ).toEqual([]);
      const bodyOverflow = await canvas(page)
        .locator('[data-meowui-part="presentation-layout/body"]')
        .evaluate((body) => ({
          clientHeight: body.clientHeight,
          scrollHeight: body.scrollHeight,
          clientWidth: body.clientWidth,
          scrollWidth: body.scrollWidth,
        }));
      expect(
        bodyOverflow.scrollHeight,
        `${id} at ${size.width}x${size.height}: body must not overlap teacher support`,
      ).toBeLessThanOrEqual(bodyOverflow.clientHeight + 1);
      expect(bodyOverflow.scrollWidth).toBeLessThanOrEqual(bodyOverflow.clientWidth + 1);
      await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      await reachable(page.getByRole("button", { name: "Presentation options", exact: true }));
      await reachable(directory(page));
      await page.screenshot({
        path: testInfo.outputPath(`${id}-${size.width}x${size.height}-expanded.png`),
        animations: "disabled",
      });
    }
  }
});

test("authored classroom rules leave the shared player heading and directory untouched", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  const readChrome = () => {
    const read = (element: Element) => {
      const css = getComputedStyle(element);
      return {
        fontSize: css.fontSize,
        fontFamily: css.fontFamily,
        fontWeight: css.fontWeight,
        lineHeight: css.lineHeight,
        letterSpacing: css.letterSpacing,
        margin: css.margin,
        padding: css.padding,
        background: css.backgroundColor,
        border: css.border,
      };
    };
    return {
      heading: read(document.querySelector('[data-meowui-part="presentation/title"]')!),
      directory: read(document.querySelector('[aria-label="Choose slide"]')!),
    };
  };
  const authored = await page.evaluate(readChrome);
  const removed = await page.evaluate(() => {
    let count = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
        const rule = sheet.cssRules[index]!;
        if (rule instanceof CSSStyleRule && rule.selectorText.includes(".panda-lesson")) {
          sheet.deleteRule(index);
          count++;
        }
      }
    }
    return count;
  });
  expect(removed).toBeGreaterThan(0);
  expect(authored).toEqual(await page.evaluate(readChrome));
});
