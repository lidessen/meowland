import { expect, test, type Page } from "@playwright/test";

async function expectContained(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
}

test("Journal routes keep readable content and contain wide tables and code", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/posts/",
    "/thoughts/",
    "/about/",
    "/skills/",
    "/posts/nested/first/",
    "/thoughts/note/",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toBeVisible();
    await expectContained(page);
  }
  await page.getByRole("link", { name: "the first post", exact: true }).click();
  await expect(page).toHaveURL(/\/posts\/nested\/first\/$/);
  await expect(page.locator("article table")).toBeVisible();
  await expect(page.locator("article pre")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("article.png"), fullPage: true });
  expect(errors).toEqual([]);
});

test("feed filters repeatedly update pressed state, items and empty date groups", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  for (const mode of ["all", "post", "thought", "all", "thought", "post", "all"]) {
    await page.locator(`button[data-filter="${mode}"]`).click();
    for (const value of ["all", "post", "thought"]) {
      await expect(page.locator(`button[data-filter="${value}"]`)).toHaveAttribute(
        "aria-pressed",
        String(value === mode),
      );
    }
    await expect(page.locator('.feed [data-kind="post"]:visible')).toHaveCount(
      mode === "thought" ? 0 : 1,
    );
    await expect(page.locator('.feed [data-kind="thought"]:visible')).toHaveCount(
      mode === "post" ? 0 : 1,
    );
    await expect(page.locator(".feed .day:visible")).toHaveCount(mode === "all" ? 2 : 1);
    await expectContained(page);
  }
  await page.screenshot({ path: testInfo.outputPath("home.png"), fullPage: true });
});

test("skill files, reference graph and deep links survive repeated switches", async ({
  page,
  context,
}, testInfo) => {
  await page.goto("/skills/writing/");
  // All Markdown documents nest under the page title, including initially hidden files.
  await expect(page.locator("h1")).toHaveCount(1);
  const files = page.getByRole("button", { name: "File browser", exact: true });
  const graph = page.getByRole("button", { name: "Reference graph", exact: true });
  await files.click();
  await page.getByRole("link", { name: "the reference", exact: true }).click();
  await expect(page.locator('[data-skill-panel="reference.md"]')).toBeVisible();
  await expect(page.locator("[data-current-file]")).toHaveText("reference.md");
  await expect(page).toHaveURL(/#reference.md$/);
  await expectContained(page);
  await page.reload();
  await expect(page.locator('[data-skill-panel="reference.md"]')).toBeVisible();
  await page.getByRole("link", { name: "the entry", exact: true }).click();
  await expect(page.locator('[data-skill-panel="SKILL.md"]')).toBeVisible();
  for (let index = 0; index < 2; index++) {
    await graph.click();
    await expect(graph).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-skill-view-panel="relations"]')).toBeVisible();
    await expectContained(page);
    await page.screenshot({ path: testInfo.outputPath(`graph-${index}.png`), fullPage: true });
    await files.click();
    await expect(files).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-skill-view-panel="relations"]')).toBeHidden();
    await page.locator('[data-skill-file="reference.md"]').click();
    await expect(page.locator('[data-skill-panel="reference.md"]')).toBeVisible();
    await page.locator('[data-skill-file="SKILL.md"]').click();
  }
  if (await page.evaluate(() => Boolean(navigator.clipboard?.writeText))) {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const copy = page.locator("[data-copy-command]");
    const command = await copy.getAttribute("data-copy-command");
    await copy.click();
    await expect(copy).toHaveText("Copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command);
  }
});

test("deep missing routes load their stylesheet and content works without JavaScript", async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
    colorScheme: testInfo.project.use.colorScheme,
  });
  const page = await context.newPage();
  try {
    const response = await page.goto("/missing/nested/page/");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    const stylesheet = await page
      .locator('link[rel="stylesheet"]')
      .evaluate((link: HTMLLinkElement) => link.href);
    expect((await context.request.get(stylesheet)).status()).toBe(200);
    await expectContained(page);
    await page.getByRole("link", { name: "Back to home", exact: true }).click();
    await expect(page.locator(".feed [data-kind]:visible")).toHaveCount(2);
    await page.goto("/posts/nested/first/");
    await expect(page.locator("h1")).toHaveText("First post");
    await expect(page.locator("article table")).toBeVisible();
    await expectContained(page);
    await page.goto("/skills/writing/");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('[data-skill-panel="SKILL.md"]')).toBeVisible();
  } finally {
    await context.close();
  }
});
