import { expect, test } from "@playwright/test";

test("component directory deduplicates Button while variants retain deep links and history", async ({
  page,
}) => {
  await page.goto("/?story=button-sizes");
  const ready = () =>
    expect(page.frameLocator("#canvas").locator("#story-state")).toHaveAttribute(
      "data-status",
      "ready",
    );
  await ready();
  const buttonEntry = page.locator("#catalog").getByRole("link", { name: "Button", exact: true });
  await expect(buttonEntry).toHaveCount(1);
  await expect(buttonEntry).toHaveAttribute("aria-current", "page");
  await expect(page.locator("#title")).toHaveText("Button");
  const variants = page.getByRole("navigation", { name: "组件场景" });
  await expect(variants.getByRole("link", { name: "尺寸与长文本", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await variants.getByRole("link", { name: "操作层级", exact: true }).click();
  await expect(page).toHaveURL(/story=buttons(?:&|$)/);
  await ready();
  await expect(variants.getByRole("link", { name: "操作层级", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  // Canvas metadata arrives after navigation; it must preserve the directory identity.
  await expect(page.locator("#title")).toHaveText("Button");
  await expect(buttonEntry).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/story=button-sizes(?:&|$)/);
  await expect(variants.getByRole("link", { name: "尺寸与长文本", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.goForward();
  await expect(page).toHaveURL(/story=buttons(?:&|$)/);
  await expect(variants.getByRole("link", { name: "操作层级", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Chinese scenario search routes an unvisited component directly to its matching variant", async ({
  page,
}) => {
  await page.goto("/?story=icons");
  await expect(page.frameLocator("#canvas").locator("#story-state")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.getByRole("searchbox", { name: "查找组件" }).fill("尺寸与长文本");
  const result = page.locator("#catalog").getByRole("link", { name: "Button", exact: true });
  await expect(result).toHaveCount(1);
  await expect(result).toHaveAttribute("href", /story=button-sizes(?:&|$)/);
  await result.click();
  await expect(page).toHaveURL(/story=button-sizes(?:&|$)/);
  await expect(page.frameLocator("#canvas").locator("#story-state")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(page.locator('#variants a[aria-current="page"]')).toHaveText("尺寸与长文本");
  await expect(page.locator("#catalog a")).toHaveCount(1);
  await expect(result).toHaveAttribute("aria-current", "page");
});

test("component names find unvisited stories and remain stable after visits and reload", async ({
  page,
}) => {
  await page.goto("/?story=icons");
  const search = page.getByRole("searchbox", { name: "查找组件" });
  await search.fill("ChatProcess");
  const links = page.locator("#catalog a");
  await expect(links).not.toHaveCount(0);
  const before = await links.allTextContents();
  await links.first().click();
  await expect(page.frameLocator("#canvas").locator("#story-state")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await expect(links).toHaveText(before);
  await page.reload();
  await search.fill("ChatProcess");
  await expect(links).toHaveText(before);
  await search.fill("does-not-exist");
  await expect(page.locator("#catalog")).toContainText("没有找到");
});
