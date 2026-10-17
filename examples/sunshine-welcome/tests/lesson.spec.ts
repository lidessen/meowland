import { expect, test, type Locator, type Page } from "@playwright/test";

const navigation = (page: Page) =>
  page.getByRole("navigation", { name: "Presentation controls", exact: true });
const next = (page: Page) => navigation(page).getByRole("button", { name: "Next", exact: true });
const previous = (page: Page) =>
  navigation(page).getByRole("button", { name: "Previous", exact: true });
const directory = (page: Page) =>
  navigation(page).getByRole("combobox", { name: "Choose slide", exact: true });
const suggestion = (page: Page) => page.getByText("A helpful first question: B.", { exact: true });
const explanation = (page: Page) => page.getByText("Possible reason:", { exact: false });

async function ready(page: Page) {
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map((image) => image.decode()));
  });
}

async function reachable(locator: Locator) {
  await expect(locator).toBeVisible();
  const bounds = await locator.boundingBox();
  const viewport = locator.page().viewportSize()!;
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.y).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
}

test("teacher steps reveal the suggestion and explanation without changing the student's response", async ({
  page,
}) => {
  await page.goto("/?slide=choose&step=0");
  await ready(page);
  await expect(suggestion(page)).toBeHidden();
  await expect(explanation(page)).toBeHidden();
  expect(await page.locator("#app").ariaSnapshot()).not.toContain("A helpful first question");
  const answer = page.getByRole("button", { name: "Choose A:", exact: false });
  await answer.focus();
  await answer.press("Space");
  await expect(answer).toHaveAttribute("aria-pressed", "true");
  const reason = page.getByRole("textbox", { name: "Give a reason", exact: true });
  await reason.fill("I want to help, but I should ask first.");
  await reason.press("Home");
  await reason.press("ArrowRight");
  await reason.press("Space");
  await expect(suggestion(page)).toBeHidden();
  await next(page).click();
  await expect(page.getByText("Which sentence asks,", { exact: false })).toBeVisible();
  await expect(suggestion(page)).toBeHidden();
  await next(page).click();
  await expect(suggestion(page)).toBeVisible();
  await expect(explanation(page)).toBeHidden();
  await next(page).click();
  await expect(explanation(page)).toBeVisible();
  await previous(page).click();
  await expect(explanation(page)).toBeHidden();
  await expect(suggestion(page)).toBeVisible();
  await previous(page).click();
  await expect(suggestion(page)).toBeHidden();
  await previous(page).click();
  await expect(answer).toHaveAttribute("aria-pressed", "true");
  await expect(reason).not.toHaveValue("");
});

test("page visits preserve choices and writing while explicit redo clears the task and feedback", async ({
  page,
}) => {
  await page.goto("/?slide=choose&step=0");
  const choice = page.getByRole("button", { name: "Choose B:", exact: false });
  const reason = page.getByRole("textbox", { name: "Give a reason", exact: true });
  await choice.click();
  await reason.fill("It gives the person a choice.");
  await next(page).click();
  await next(page).click();
  await next(page).click();
  await page.getByRole("button", { name: "Revisit the idea", exact: true }).click();
  await expect(directory(page)).toHaveValue("notice");
  await directory(page).selectOption("welcome");
  await directory(page).selectOption("choose");
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(reason).toHaveValue("It gives the person a choice.");
  await expect(suggestion(page)).toBeHidden();
  await next(page).click();
  await next(page).click();
  await next(page).click();
  await page.getByRole("button", { name: "Redo this task", exact: true }).click();
  await expect(reason).toHaveValue("");
  await expect(choice).toHaveAttribute("aria-pressed", "false");
  await expect(suggestion(page)).toBeHidden();
  await expect(explanation(page)).toBeHidden();
});

test("warm-up hints remain teacher-controlled and direct steps also work with reduced motion", async ({
  page,
}) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/?slide=notice&step=0");
    const hint = page.getByText("Think about a safe path,", { exact: false });
    const principle = page.getByText("Ask. Listen. Then offer help.", { exact: true });
    await expect(hint).toBeHidden();
    await expect(principle).toBeHidden();
    await next(page).click();
    await expect(hint).toBeVisible();
    await expect(principle).toBeHidden();
    await next(page).click();
    await expect(principle).toBeVisible();
    await previous(page).click();
    await expect(principle).toBeHidden();
    await page.goto("/?slide=choose&step=3");
    await expect(suggestion(page)).toBeVisible();
    await expect(explanation(page)).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Give a reason" })).toHaveValue("");
  }
});

test("matching hints and reference feedback preserve answers until an explicit matching redo", async ({
  page,
}) => {
  await page.goto("/?slide=match&step=0");
  const first = page.getByRole("combobox", { name: "Match clue 1", exact: true });
  const second = page.getByRole("combobox", { name: "Match clue 2", exact: true });
  const reference = page.getByText("Reference matches:", { exact: true });
  await expect(reference).toBeHidden();
  expect(await page.locator("#app").ariaSnapshot()).not.toContain("Reference matches");
  await first.evaluate((element) => {
    element.addEventListener(
      "keydown",
      (event) => {
        queueMicrotask(() =>
          element.setAttribute("data-test-key-prevented", String(event.defaultPrevented)),
        );
      },
      { once: true },
    );
  });
  await first.focus();
  await first.press("ArrowRight");
  await expect(first).toHaveAttribute("data-test-key-prevented", "false");
  await expect(directory(page)).toHaveValue("match");
  await expect(reference).toBeHidden();
  await first.press("Escape");
  await first.selectOption("blind");
  await second.selectOption("blind");
  await expect(reference).toBeHidden();
  await next(page).click();
  await expect(page.getByText("Hint:", { exact: false })).toBeVisible();
  await expect(reference).toBeHidden();
  await next(page).click();
  await expect(reference).toBeVisible();
  await expect(
    page.getByText("1 of 2 entered selections fit these clues.", { exact: false }),
  ).toBeVisible();
  await previous(page).click();
  await expect(reference).toBeHidden();
  await page.getByRole("button", { name: "Revisit the words", exact: true }).click();
  await directory(page).selectOption("match");
  await expect(first).toHaveValue("blind");
  await expect(second).toHaveValue("blind");
  await expect(reference).toBeHidden();
  await next(page).click();
  await next(page).click();
  await page.getByRole("button", { name: "Redo matching", exact: true }).click();
  for (let index = 1; index <= 6; index++)
    await expect(
      page.getByRole("combobox", { name: `Match clue ${index}`, exact: true }),
    ).toHaveValue("");
  await expect(reference).toBeHidden();
  await next(page).click();
  await next(page).click();
  await expect(page.getByText("No selections entered.", { exact: false })).toBeVisible();
});

test("reading checkboxes keep student choices while teacher hints and feedback stay separate", async ({
  page,
}) => {
  await page.goto("/?slide=read-talk&step=0");
  const food = page.getByRole("checkbox", { name: "Food and clothes", exact: true });
  const shelter = page.getByRole("checkbox", {
    name: "Help finding a safe place to stay",
    exact: true,
  });
  const gifts = page.getByRole("checkbox", { name: "Expensive gifts", exact: true });
  const reference = page.getByText("Suggested answers:", { exact: true });
  await food.focus();
  await food.press("Space");
  await shelter.check();
  await expect(food).toBeChecked();
  await expect(shelter).toBeChecked();
  await expect(gifts).not.toBeChecked();
  await expect(reference).toBeHidden();
  await next(page).click();
  await expect(page.getByText("Look for things people need now", { exact: false })).toBeVisible();
  await expect(reference).toBeHidden();
  await next(page).click();
  await expect(reference).toBeVisible();
  await previous(page).click();
  await expect(reference).toBeHidden();
  await directory(page).selectOption("pair-talk");
  await directory(page).selectOption("read-talk");
  await expect(food).toBeChecked();
  await expect(shelter).toBeChecked();
  await expect(gifts).not.toBeChecked();
  await expect(reference).toBeHidden();
});

test("pair and exit writing survive visits and exit redo leaves earlier classroom work intact", async ({
  page,
}) => {
  await page.goto("/?slide=choose&step=0");
  await page.getByRole("button", { name: "Choose B:", exact: false }).click();
  await page
    .getByRole("textbox", { name: "Give a reason", exact: true })
    .fill("Ask before acting.");
  await directory(page).selectOption("pair-talk");
  const situation = page.getByRole("combobox", { name: "Choose who to talk about", exact: true });
  const idea = page.getByRole("textbox", { name: "Our idea and reason", exact: true });
  await situation.selectOption("homeless");
  await idea.fill("We could ask a local service which clothes are useful.");
  await expect(page.getByText("Example: people without a home", { exact: true })).toBeHidden();
  await idea.press("Home");
  await idea.press("ArrowRight");
  await expect(page.getByText("Example: people without a home", { exact: true })).toBeHidden();
  await next(page).click();
  await expect(page.getByText("Example: people without a home", { exact: true })).toBeVisible();
  await directory(page).selectOption("take-action");
  const word = page.getByRole("combobox", { name: "One word I can use", exact: true });
  const action = page.getByRole("textbox", { name: "One action I could offer", exact: true });
  await expect(page.getByText("Option B", { exact: true })).toBeVisible();
  await expect(page.getByText("Ask before acting.", { exact: false })).toBeVisible();
  await word.selectOption("deaf");
  await action.fill("I could ask which way to communicate works best.");
  await directory(page).selectOption("pair-talk");
  await expect(situation).toHaveValue("homeless");
  await expect(idea).toHaveValue("We could ask a local service which clothes are useful.");
  await expect(page.getByText("Example: people without a home", { exact: true })).toBeHidden();
  await directory(page).selectOption("take-action");
  await expect(word).toHaveValue("deaf");
  await expect(action).toHaveValue("I could ask which way to communicate works best.");
  await next(page).click();
  await page.getByRole("button", { name: "Redo exit ticket", exact: true }).click();
  await expect(word).toHaveValue("");
  await expect(action).toHaveValue("");
  await expect(page.getByText("Can you name the people,", { exact: false })).toBeHidden();
  await expect(page.getByText("Option B", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revisit my choice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Choose B:", exact: false })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("textbox", { name: "Give a reason", exact: true })).toHaveValue(
    "Ask before acting.",
  );
});

test("the delivered lesson cold-starts and visits every page without outside resources", async ({
  page,
}) => {
  const external: string[] = [];
  const failures: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => failures.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== "http://127.0.0.1:13032") {
      external.push(url.href);
      await route.abort("internetdisconnected");
    } else await route.continue();
  });
  await page.goto("/");
  await ready(page);
  const ids = await directory(page)
    .locator("option")
    .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  expect(ids).toEqual(expect.arrayContaining(["welcome", "notice", "choose"]));
  for (const id of ids) {
    await directory(page).selectOption(id);
    await ready(page);
    for (const image of await page.locator("img").all()) {
      expect(await image.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(
        0,
      );
      await expect(image).toHaveAttribute("alt");
    }
  }
  await page.reload();
  await ready(page);
  await expect(directory(page)).toHaveValue("welcome");
  expect(external).toEqual([]);
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});

test("wide and narrow hosts keep classroom inputs and player controls reachable", async ({
  page,
}, testInfo) => {
  for (const size of [
    { width: 1440, height: 960 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/?slide=choose&step=0");
    await ready(page);
    for (const name of ["Previous", "Next", "Pause effects", "Actual size"])
      await reachable(navigation(page).getByRole("button", { name, exact: true }));
    await reachable(directory(page));
    await page.getByRole("button", { name: "Choose B:", exact: false }).click();
    await page.getByRole("textbox", { name: "Give a reason" }).fill("Ask first.");
    await next(page).click();
    await next(page).click();
    await expect(suggestion(page)).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath(`choose-feedback-${size.width}.png`),
      animations: "disabled",
    });
  }
});

test("lesson form rules leave the public player directory styling untouched", async ({ page }) => {
  await page.goto("/?slide=choose&step=0");
  await ready(page);
  const styles = () => {
    const read = (element: Element) => {
      const css = getComputedStyle(element);
      return {
        fontSize: css.fontSize,
        fontFamily: css.fontFamily,
        background: css.backgroundColor,
        borderWidth: css.borderWidth,
        borderStyle: css.borderStyle,
        padding: css.padding,
      };
    };
    return {
      directory: read(document.querySelector('[aria-label="Choose slide"]')!),
      reason: read(document.querySelector('[aria-label="Give a reason"]')!),
    };
  };
  const authored = await page.evaluate(styles);
  const removed = await page.evaluate(() => {
    let count = 0;
    for (const sheet of Array.from(document.styleSheets)) {
      for (let index = sheet.cssRules.length - 1; index >= 0; index--) {
        const rule = sheet.cssRules[index]!;
        if (rule instanceof CSSStyleRule && rule.selectorText.includes(".sunshine-lesson")) {
          sheet.deleteRule(index);
          count++;
        }
      }
    }
    return count;
  });
  expect(removed).toBeGreaterThan(0);
  const publicTheme = await page.evaluate(styles);
  expect(authored.directory).toEqual(publicTheme.directory);
  expect(authored.reason).not.toEqual(publicTheme.reason);
});

test("all classroom scenes retain visible content and input bounds at their final teacher step", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const [id, step] of [
    ["welcome", 1],
    ["notice", 2],
    ["words-people", 2],
    ["words-life", 2],
    ["match", 2],
    ["read-talk", 2],
    ["choose", 3],
    ["pair-talk", 1],
    ["take-action", 1],
  ] as const) {
    await page.goto(`/?slide=${id}&step=${step}`);
    await ready(page);
    const clipped = await page.evaluate(() => {
      const slide = document.querySelector('[data-meowui-part="presentation/slide"]')!;
      const bounds = slide.getBoundingClientRect();
      return Array.from(slide.querySelectorAll("h1,h2,h3,p,img,button,input,textarea,select"))
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
          label: element.getAttribute("aria-label") ?? element.textContent?.trim(),
        }));
    });
    expect(clipped, `${id} contains clipped classroom content`).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`${id}-step-${step}-wide.png`),
      animations: "disabled",
    });
  }
});
