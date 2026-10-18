import { expect, test } from "@playwright/test";

test("nested layout gives the scroll owner the remaining height and retains fixed actions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto("/canvas.html?story=layout-nested-scroll");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const draft = page.getByRole("textbox", { name: "Review draft", exact: true });
  const original = await draft.elementHandle();
  await draft.fill("Draft survives nested layout resizing");
  const layout = page.locator("[data-nested-layout]");
  const scroll = page.getByRole("region", { name: "Nested layout reading area", exact: true });
  const footer = page.locator('[data-nested-fixed="footer"]');
  await expect(page.locator("[data-numeric-basis]")).toHaveCSS("flex-basis", "120px");
  await expect(page.locator("[data-percent-basis]")).toHaveCSS("flex-basis", "0%");
  await expect(page.locator("[data-nested-body]")).toHaveCSS("flex-basis", "0px");
  for (const viewport of [
    { width: 1100, height: 800 },
    { width: 390, height: 640 },
    { width: 900, height: 330 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() =>
        layout.evaluate((node) => {
          const root = node.getBoundingClientRect();
          const fixed = [...node.querySelectorAll<HTMLElement>("[data-nested-fixed]")];
          const viewport = node.querySelector<HTMLElement>("[data-nested-scroll]")!;
          return {
            bounded: node.scrollHeight <= node.clientHeight + 1,
            fixedReachable: fixed.every((item) => {
              const box = item.getBoundingClientRect();
              return box.top >= root.top - 1 && box.bottom <= root.bottom + 1;
            }),
            readingScrolls:
              viewport.clientHeight > 0 && viewport.scrollHeight > viewport.clientHeight,
            noHorizontalOverflow: node.scrollWidth <= node.clientWidth + 1,
          };
        }),
      )
      .toEqual({
        bounded: true,
        fixedReachable: true,
        readingScrolls: true,
        noHorizontalOverflow: true,
      });
    await expect(draft).toHaveValue("Draft survives nested layout resizing");
    expect(await original!.evaluate((node) => node.isConnected)).toBe(true);
  }
  const fixedHeight = await footer.evaluate((node) => node.getBoundingClientRect().height);
  const previousScrollHeight = await scroll.evaluate((node) => node.scrollHeight);
  await page.getByRole("button", { name: "Append content", exact: true }).click();
  await expect
    .poll(() => scroll.evaluate((node) => node.scrollHeight))
    .toBeGreaterThan(previousScrollHeight);
  expect(await footer.evaluate((node) => node.getBoundingClientRect().height)).toBe(fixedHeight);
  await scroll.focus();
  await page.keyboard.press("End");
  await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "Finish check", exact: true })).toBeInViewport();
  expect(await layout.evaluate((node) => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
});

test("unbounded stacks retain natural content height", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 330 });
  await page.goto("/canvas.html?story=layout-container-page");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const container = page.locator("[data-container-page]");
  expect(await container.evaluate((node) => node.clientHeight > innerHeight)).toBe(true);
  expect(await container.evaluate((node) => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
  const last = page.getByRole("button", { name: "Check trailing actions", exact: true });
  await last.focus();
  await expect(last).toBeInViewport();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
