import { expect, test } from "@playwright/test";

test("image previews distinguish pending, ready and failed without activation targets", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/image-preview-delayed.svg", async (route) => {
    await pending;
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"><rect width="40" height="20" fill="blue"/></svg>',
    });
  });
  await page.goto("/canvas.html?story=image-preview", { waitUntil: "domcontentloaded" });
  const previews = page.locator('[data-meowui-part="image-preview/root"]');
  await expect(previews.nth(0)).toHaveAttribute("data-image-state", "ready");
  await expect(previews.nth(0).getByRole("status")).toBeHidden();
  await expect(previews.nth(1).getByRole("status")).toHaveText("正在加载图片");
  await expect(previews.nth(2)).toHaveAttribute("data-image-state", "failed");
  await expect(previews.nth(2).getByRole("status")).toHaveText("图片加载失败");
  await expect(previews.locator("button,a")).toHaveCount(0);
  release();
  await expect(previews.nth(1)).toHaveAttribute("data-image-state", "ready");
  await expect(previews.nth(1).getByRole("img", { name: "延迟加载图片" })).toBeVisible();
});
