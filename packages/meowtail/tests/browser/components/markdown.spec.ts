import { expect, test } from "@playwright/test";

test("a selection in a finished block survives while the reply streams", async ({ page }) => {
  await page.goto("/canvas.html?story=markdown");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const root = page.locator('[data-meowui-part="markdown/root"]');
  await page.getByRole("button", { name: "Stream again" }).click();
  await expect(root).toHaveAttribute("aria-busy", "true");

  // The paragraph is finished once a later block has started; select a word inside it.
  const paragraph = root.locator("p").first();
  await expect(root.locator("ol")).toBeAttached();
  await paragraph.evaluate((element) => {
    const range = document.createRange();
    const text = element.firstChild!;
    range.setStart(text, 4);
    range.setEnd(text, 9);
    const selection = getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  const selected = await page.evaluate(() => getSelection()!.toString());
  expect(selected.length).toBe(5);

  await expect(page.getByText("Complete.")).toBeVisible({ timeout: 15_000 });
  await expect(root).not.toHaveAttribute("aria-busy", "true");
  // The same text is still selected after every later chunk.
  expect(await page.evaluate(() => getSelection()!.toString())).toBe(selected);
});

test("streamed text never shows raw markers and the finished reply keeps the content policy", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=markdown");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const root = page.locator('[data-meowui-part="markdown/root"]');
  await page.getByRole("button", { name: "Stream again" }).click();
  // Sample the rendered text while it streams: no paragraph shows a dangling ** or a link target.
  const samples: string[] = [];
  for (let index = 0; index < 40; index += 1) {
    samples.push(
      await root.evaluate((element) =>
        [...element.querySelectorAll(":scope > p, :scope > ul, :scope > ol, :scope > h2")]
          .map((block) => block.textContent ?? "")
          .join("\n"),
      ),
    );
    await page.waitForTimeout(60);
  }
  for (const sample of samples) {
    expect(sample).not.toContain("**");
    expect(sample).not.toMatch(/\]\(https?:/);
  }
  await expect(page.getByText("Complete.")).toBeVisible({ timeout: 15_000 });

  await expect(root.getByRole("heading", { name: "Moving the cache" })).toBeVisible();
  await expect(root.getByRole("table")).toBeVisible();
  const link = root.getByRole("link", { name: "the design notes" });
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noreferrer");
  await expect(root.getByText("Raw <b>HTML</b> stays text.")).toBeVisible();
  // The fence is drawn by CodeBlock, with its own copy action.
  await expect(root.locator('[data-meowui-part="code-block/root"]')).toBeVisible();
  await expect(root.getByRole("button", { name: /Copy/ })).toBeVisible();
});
