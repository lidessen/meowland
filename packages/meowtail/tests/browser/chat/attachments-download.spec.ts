import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  for (const theme of ["light", "dark"]) {
    test(`file downloads retain native behavior or delegate to the host at ${width}px ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/canvas.html?story=attachment-scales");
      await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
      await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption(theme);
      const hooked = page.locator('a[download="protected-document.txt"]');
      const regular = page.locator('a[download="empty.txt"]');
      await expect(hooked).toHaveAttribute("href", "data:text/plain,Host%20download%20example");
      await expect(regular).toHaveAttribute("href", "data:text/plain,");
      await page.evaluate(() => {
        document.addEventListener("click", (event) => {
          const link = (event.target as Element).closest<HTMLAnchorElement>("a[download]");
          if (link) link.dataset.defaultPrevented = String(event.defaultPrevented);
        });
      });
      let downloads = 0;
      page.on("download", () => downloads++);
      await hooked.click();
      await expect(hooked).toHaveAttribute("data-default-prevented", "true");
      await expect(page.locator("[data-attachment-download-feedback]")).toHaveText(
        "The host took over the download; local sample only.",
      );
      expect(downloads).toBe(0);
      await hooked.focus();
      await hooked.evaluate((element) => element.removeAttribute("data-default-prevented"));
      await page.keyboard.press("Enter");
      await expect(hooked).toHaveAttribute("data-default-prevented", "true");
      const [download] = await Promise.all([page.waitForEvent("download"), regular.click()]);
      expect(download.suggestedFilename()).toBe("empty.txt");
      await expect(regular).toHaveAttribute("data-default-prevented", "false");
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      await page.screenshot({
        path: test.info().outputPath(`attachments-${width}-${theme}.png`),
        fullPage: true,
      });
    });
  }
}

test("a composer image tile shows its image and a file's preview joins its card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto("/canvas.html?story=composer-attachments");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const geometry = await page
    .locator('[data-meowui-part="chat-composer/attachments"]')
    .evaluate((rail) => {
      const box = (selector: string) => rail.querySelector(selector)!.getBoundingClientRect();
      const tile = box('[data-meowui-part="chat-attachments/image"]');
      const image = box('[data-meowui-part="image-preview/image"]');
      const file = box('[data-meowui-part="chat-attachments/file"]');
      const preview = box('[data-meowui-part="chat-attachments/previewButton"]');
      return { tile, image, file, preview };
    });
  // The image fills the 64px tile instead of centering a 220px frame inside it.
  expect(geometry.image.left).toBeGreaterThanOrEqual(geometry.tile.left - 1);
  expect(geometry.image.right).toBeLessThanOrEqual(geometry.tile.right + 1);
  expect(geometry.image.height).toBeGreaterThan(geometry.tile.height - 4);
  // The preview action is the card's joined end segment, not a loose label beside it.
  expect(Math.abs(geometry.preview.left - geometry.file.right)).toBeLessThan(1);
  expect(Math.abs(geometry.preview.top - geometry.file.top)).toBeLessThan(1);
  expect(Math.abs(geometry.preview.bottom - geometry.file.bottom)).toBeLessThan(1);
});
