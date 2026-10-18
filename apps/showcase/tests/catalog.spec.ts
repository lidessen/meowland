import { expect, test } from "@playwright/test";
import type { StoryEntry } from "meowbook";

test("gallery batch waits for each isolated canvas", async ({ page, request }) => {
  const entries = (await (await request.get("/manifest.json")).json()) as StoryEntry[];
  test.setTimeout(30_000 + entries.length * 5_000);
  await page.goto("/?story=composer-inline&width=390");
  await expect(page.frameLocator("#canvas").locator("#story-state")).toHaveAttribute(
    "data-status",
    "ready",
  );
  await page.locator("#inspection-panel > summary").click();
  await page.getByRole("button", { name: "Check all samples", exact: true }).click();
  await expect(page.locator("#batch-status")).toContainText(
    `${entries.length}/${entries.length} checked`,
    { timeout: entries.length * 5_000 },
  );
  await expect(page.locator("#batch-results")).toHaveText("");
  await expect(page.locator("#batch-status")).toContainText("0 items with notes");
});

test("shared gallery serves the UI library and no product scenes", async ({ page, request }) => {
  const entries = (await (await request.get("/manifest.json")).json()) as StoryEntry[];
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(entry.file).toContain("packages/meowtail/");
    expect(entry.file).not.toContain("apps/meowland/");
  }

  await page.goto("/?story=icon-button");
  await expect(
    page.locator("#catalog").getByRole("link", { name: "IconButton", exact: true }),
  ).toHaveCount(1);
  for (const productComponent of [
    "DashboardMessage",
    "DashboardWork",
    "KnowledgeEntry",
    "KnowledgeControls",
    "SourceExcerpt",
  ]) {
    await expect(
      page.locator("#catalog").getByRole("link", { name: productComponent, exact: true }),
    ).toHaveCount(0);
  }
});
