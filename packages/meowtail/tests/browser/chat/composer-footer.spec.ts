import { expect, test, type Locator } from "@playwright/test";

async function expectAllocated(composer: Locator) {
  const geometry = await composer.evaluate((element) => {
    const rect = (target: Element) => {
      const r = target.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      };
    };
    const part = (name: string) =>
      element.querySelector(`[data-meowui-part="chat-composer/${name}"]`)!;
    const hint = part("hint") as HTMLElement;
    return {
      root: rect(element),
      hint: rect(hint),
      hintFits: hint.scrollWidth <= hint.clientWidth + 1,
      controls: [
        part("input"),
        part("trailing").querySelector(
          '[data-meowui-part="chat-status/root"], [data-meowui-part="choice-select/trigger"]',
        )!,
        part("submit"),
        element.querySelector('[aria-label="Attach files"]')!,
      ].map(rect),
    };
  });
  expect(geometry.hint.width).toBeGreaterThan(0);
  expect(geometry.hint.height).toBeGreaterThan(0);
  expect(geometry.hintFits).toBe(true);
  for (const box of [geometry.hint, ...geometry.controls]) {
    expect(box.left).toBeGreaterThanOrEqual(geometry.root.left - 1);
    expect(box.right).toBeLessThanOrEqual(geometry.root.right + 1);
    expect(box.bottom).toBeLessThanOrEqual(geometry.root.bottom + 1);
  }
  for (const [index, control] of geometry.controls.entries()) {
    for (const other of geometry.controls.slice(index + 1)) {
      const x = Math.min(control.right, other.right) - Math.max(control.left, other.left);
      const y = Math.min(control.bottom, other.bottom) - Math.max(control.top, other.top);
      expect(x <= 1 || y <= 1).toBe(true);
    }
    const overlapX =
      Math.min(control.right, geometry.hint.right) - Math.max(control.left, geometry.hint.left);
    const overlapY =
      Math.min(control.bottom, geometry.hint.bottom) - Math.max(control.top, geometry.hint.top);
    expect(overlapX <= 1 || overlapY <= 1).toBe(true);
  }
  expect(geometry.hint.top).toBeGreaterThanOrEqual(
    Math.max(...geometry.controls.map((r) => r.bottom)) - 1,
  );
}

for (const viewport of [
  { width: 1000, height: 720 },
  { width: 375, height: 667 },
  { width: 720, height: 420 },
  { width: 1440, height: 900 },
]) {
  test(`stacked footer allocates hint, model and send at ${viewport.width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/canvas.html?story=composer-footer");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const composer = page.locator('[data-meowui-part="chat-composer/root"]');
    const input = page.getByRole("textbox", { name: "Footer draft" });
    const hint = composer.locator('[data-meowui-part="chat-composer/hint"]');
    await expect(input).toHaveAttribute("aria-describedby", "stacked-footer-hint");
    for (const model of ["Disconnected model", "Long status", "Long model name"]) {
      await page.getByRole("button", { name: model, exact: true }).click();
      for (const draft of [
        "",
        "A longer draft with model context and keyboard guidance. ".repeat(50),
      ]) {
        await input.fill(draft);
        for (const focused of [false, true]) {
          if (focused) await input.focus();
          else await input.evaluate((element) => element.blur());
          await expect(hint).toBeVisible();
          await expectAllocated(composer);
          await expect(input).toHaveValue(draft);
        }
      }
      await page.screenshot({
        path: info.outputPath(`${model.toLowerCase().replaceAll(" ", "-")}-long-draft.png`),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Toggle attachments", exact: true }).click();
      await expect(composer.getByRole("link", { name: "footer-notes.md" })).toBeVisible();
      await expectAllocated(composer);
      await page.getByRole("button", { name: "Toggle attachments", exact: true }).click();
      await expectAllocated(composer);
    }
    await input.fill("Keep this draft");
    await input.press("Enter");
    await expect(input).toHaveValue("Keep this draft\n");
    await input.fill("");
    await page.getByRole("button", { name: "Disconnected model", exact: true }).click();
    await page.screenshot({ path: info.outputPath("footer-empty.png"), fullPage: true });
    await input.focus();
    await page.screenshot({ path: info.outputPath("footer-focused.png"), fullPage: true });
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Keyboard help" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#footer-help")).toHaveText("Help opened: 1. Submissions: 0.");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Attach files", exact: true })).toBeFocused();
    await page.getByRole("button", { name: "Send draft", exact: true }).click();
    await expect(page.locator("#footer-help")).toHaveText("Help opened: 1. Submissions: 1.");
    await hint.evaluate((element) => {
      [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)!.textContent =
        "KeyboardInstructionsWithAnUnbrokenShortcutDescriptionThatMustWrapRatherThanOverlapTheModelOrSend ".repeat(
          4,
        );
    });
    await expectAllocated(composer);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath("footer-long-hint.png"), fullPage: true });
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("dark");
    await expectAllocated(composer);
    await page.screenshot({ path: info.outputPath("footer-dark.png"), fullPage: true });
  });
}
