import { expect, test } from "@playwright/test";

test("highlighted read window keeps file numbering, grammar context, focus and raw copy", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/canvas.html?story=read-highlight");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const read = page.locator('[data-meowui-part="read-block/root"]').first();
  const comment = read
    .locator('[data-meowui-part="read-block/text"]')
    .filter({ hasText: "const notCode" });
  await expect(comment.locator('span[style*="token-comment"]').first()).toBeVisible();
  await expect
    .poll(() =>
      comment
        .locator('span[style*="token-comment"]')
        .first()
        .evaluate(
          (element) =>
            getComputedStyle(element).color !== getComputedStyle(element.parentElement!).color,
        ),
    )
    .toBe(true);
  await expect(read.locator('[data-meowui-part="read-block/number"]').first()).toHaveText("41");
  await expect(read.locator('[data-meowui-part="read-block/number"]').last()).toHaveText("49");
  const fold = read.locator("details");
  await fold.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(fold).toHaveJSProperty("open", true);
  await expect(
    read
      .locator('[data-meowui-part="read-block/text"]')
      .filter({ hasText: "const result" })
      .locator('span[style*="token-keyword"]')
      .first(),
  ).toBeVisible();
  await read.locator('[data-meowui-part="output-block/body"]').focus();
  await expect(read.locator('[data-meowui-part="output-block/body"]')).toBeFocused();
  await read.getByRole("button", { name: "复制", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "/* comment starts\n  still a comment\n  const notCode = 'comment';\n  comment continues\n  whitespace is preserved  \n  comment closes */\nconst result: number = 42;\n\nexport { result };",
  );
  const fallback = page.locator('[data-meowui-part="read-block/root"]').last();
  await expect(fallback.locator('[data-meowui-part="read-block/text"]')).toHaveText(
    "  <script> plain text  ",
  );
  await expect(fallback.locator("script")).toHaveCount(0);
});
