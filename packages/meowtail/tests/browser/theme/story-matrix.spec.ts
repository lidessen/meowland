import { expect, test } from "@playwright/test";
import type { StoryEntry } from "meowbook";

// Public visual variants live in the stories; this exercises each presentation
// without replacing their content. Screenshots are review material, not approval.
// Each scheme and width visits every story in CHUNKS interleaved slices, so the pass spreads
// across workers instead of running as one long test. The @story-matrix tag lets CI give the
// slices their own shards, since they sort together at the end of the suite.
const CHUNKS = 4;
for (const scheme of ["light", "dark"]) {
  for (const width of [1100, 390]) {
    for (let chunk = 0; chunk < CHUNKS; chunk++) {
      test(
        `Studio ${scheme} ${width}: component stories ${chunk + 1}/${CHUNKS}`,
        {
          tag: "@story-matrix",
        },
        async ({ page, request }, info) => {
          // A slice is about a quarter of a full pass; the budget leaves room for a loaded runner.
          test.setTimeout(90000);
          await page.setViewportSize({ width, height: 900 });
          await page.emulateMedia({ reducedMotion: "reduce" });
          const entries = (
            (await (await request.get("/manifest.json")).json()) as StoryEntry[]
          ).filter((_, index) => index % CHUNKS === chunk);
          const errors: string[] = [];
          page.on("pageerror", (error) => errors.push(error.message));
          for (const entry of entries) {
            await test.step(entry.id, async () => {
              await page.goto(`/canvas.html?story=${encodeURIComponent(entry.id)}`);
              await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
              await page
                .getByRole("navigation", { name: "Theme preview", exact: true })
                .getByRole("combobox", { name: "Appearance", exact: true })
                .selectOption(scheme);
              expect(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
                entry.id,
              ).toBe(true);
              await page.screenshot({ path: info.outputPath(`${entry.id}.png`), fullPage: true });
              if (entry.id === "popover" || entry.id === "choice-select") {
                const trigger =
                  entry.id === "popover" ? "#display-popover-trigger" : "#custom-delivery";
                const panel = page.locator(
                  entry.id === "popover" ? "#display-popover" : "#custom-delivery-panel",
                );
                await page.locator(trigger).click();
                await expect(panel).toBeVisible();
                await expect
                  .poll(() =>
                    panel.evaluate((element) => {
                      const bounds = element.getBoundingClientRect();
                      return (
                        bounds.left >= 0 &&
                        bounds.right <= innerWidth + 1 &&
                        bounds.top >= 0 &&
                        bounds.bottom <= innerHeight + 1
                      );
                    }),
                  )
                  .toBe(true);
                await page.screenshot({
                  path: info.outputPath(`${entry.id}-open.png`),
                  fullPage: true,
                });
                await page.keyboard.press("Escape");
              }
              if (entry.id === "dialog" || entry.id === "dialog-form") {
                await page.locator("#story-root button").first().click();
                await expect(page.getByRole("dialog")).toBeVisible();
                expect(
                  await page
                    .getByRole("dialog")
                    .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
                ).toBe(true);
                await page.screenshot({ path: info.outputPath(`${entry.id}-open.png`) });
                await page.keyboard.press("Escape");
              }
            });
          }
          expect(errors).toEqual([]);
        },
      );
    }
  }
}

test("icon catalog filters, names and selection remain coherent", async ({ page }) => {
  await page.goto("/canvas.html?story=icons");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("searchbox", { name: "Find an icon", exact: true }).fill("folder");
  await expect(page.locator("button[data-icon]:visible")).toHaveCount(2);
  await page.getByRole("button", { name: "folder", exact: true }).click();
  await expect(page.getByRole("button", { name: "folder", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("[data-icon-feedback]")).toContainText("Selected folder");
  await page.getByRole("searchbox", { name: "Find an icon", exact: true }).fill("not-a-real-icon");
  await expect(page.locator("button[data-icon]:visible")).toHaveCount(0);
  await expect(page.locator("[data-icon-empty]")).toBeVisible();
  await page.goto("/canvas.html?story=icon-sizes");
  await expect(page.getByRole("img", { name: "Project folder" })).toBeVisible();
});
