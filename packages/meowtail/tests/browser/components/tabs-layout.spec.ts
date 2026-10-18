import { expect, test } from "@playwright/test";

test("one tab indicator follows selection and layout, including RTL and reduced motion", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=tabs");
  const list = page.getByRole("tablist", { name: "Project views" });
  const indicator = list.locator('[data-meowui-part="tabs/indicator"]');
  const overview = list.getByRole("tab", { name: "Overview", exact: true });
  const notes = list.getByRole("tab", { name: "Work notes", exact: true });
  await expect(indicator).toHaveCount(1);
  const aligns = async () => {
    const selected = list.getByRole("tab", { selected: true });
    const [tab, marker] = await Promise.all([selected.boundingBox(), indicator.boundingBox()]);
    return Boolean(
      tab && marker && Math.abs(tab.x - marker.x) < 1 && Math.abs(tab.width - marker.width) < 1,
    );
  };
  await expect.poll(aligns).toBe(true);
  await notes.click();
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await expect.poll(aligns).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(aligns).toBe(true);
  await list.evaluate((element) => element.setAttribute("dir", "rtl"));
  await overview.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(notes).toBeFocused();
  await expect.poll(aligns).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(indicator).toHaveCSS("transition-duration", "0s");
  await page.keyboard.press("Home");
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect.poll(aligns).toBe(true);
});
