import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, story: string, theme: "standard" | "journal") {
  await page.goto(`/canvas.html?story=${story}&theme=${theme}`);
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
}

const partOutline = (page: Page) =>
  page.$$eval("[data-meowui-part]", (nodes) =>
    nodes.map((node) => `${node.tagName}:${node.getAttribute("data-meowui-part")}`),
  );

test("journal paints the same article markup with reading faces and sizes", async ({ page }) => {
  await open(page, "blog-article", "standard");
  const standardParts = await partOutline(page);
  await expect(page.locator("h1")).not.toHaveCSS("font-family", /Iowan/);

  await open(page, "blog-article", "journal");
  expect(await partOutline(page)).toEqual(standardParts);
  await expect(page.locator("h1")).toHaveCSS("font-family", /Iowan/);
  const paragraph = page.locator("[data-meowui-part='prose/root'] > p").first();
  await expect(paragraph).toHaveCSS("font-family", /Iowan/);
  await expect(paragraph).toHaveCSS("font-size", "18px");
  await expect(paragraph).toHaveCSS("line-height", "30px");
  // Controls stay on the UI face and the shared control ladder.
  const subscribe = page.getByRole("button", { name: "Subscribe" });
  await expect(subscribe).not.toHaveCSS("font-family", /Iowan/);
  await expect(subscribe).toHaveCSS("min-height", "36px");
});

test("journal keeps every single-line control on the standard height ladder", async ({ page }) => {
  const heights = async () =>
    page.$$eval("button, input, select", (nodes) =>
      nodes
        .filter((node) => node.closest(".workshop-theme-controls") === null)
        .map((node) => Math.round(node.getBoundingClientRect().height)),
    );
  await open(page, "basic-quality-controls", "standard");
  const standard = await heights();
  await open(page, "basic-quality-controls", "journal");
  expect(await heights()).toEqual(standard);
});
