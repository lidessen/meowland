import { expect, test } from "@playwright/test";

test("action rails anchor groups and keep submit visible; meta rows keep facts and progress reachable", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=pattern-containers");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

    const rails = page.locator('[data-meowui-part="action-rail/root"]');
    expect(await rails.count()).toBe(2);
    for (const rail of await rails.all()) {
      const geometry = await rail.evaluate((element) => {
        const box = (part: string) => {
          const target = element.querySelector<HTMLElement>(
            `[data-meowui-part="action-rail/${part}"]`,
          )!;
          const bounds = target.getBoundingClientRect();
          return { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom };
        };
        const root = element.getBoundingClientRect();
        return {
          root: { left: root.left, right: root.right },
          leading: box("leading"),
          trailing: box("trailing"),
          submit: box("submit"),
        };
      });
      expect(geometry.leading.left).toBeLessThanOrEqual(geometry.trailing.left + 1);
      expect(geometry.leading.right).toBeLessThanOrEqual(geometry.trailing.left + 1);
      expect(geometry.trailing.right).toBeLessThanOrEqual(geometry.submit.left + 1);
      expect(geometry.submit.right).toBeLessThanOrEqual(geometry.root.right + 1);
    }

    const metaRows = page.locator('[data-meowui-part="meta-row/root"]');
    expect(await metaRows.count()).toBe(3);
    const values = await metaRows
      .locator('[role="progressbar"]')
      .evaluateAll((elements) => elements.map((element) => element.getAttribute("aria-valuenow")));
    expect(values).toEqual(["45", "72", "72"]);
    const separators = await metaRows.evaluateAll((elements) =>
      elements.map(
        (element) => element.querySelectorAll('[data-meowui-part="meta-row/separator"]').length,
      ),
    );
    expect(separators).toEqual([3, 2, 0]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});

test("narrow action rails keep long labels and fixed icon actions visible and operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 500 });
  await page.goto("/canvas.html?story=pattern-containers");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");

  const rails = page.locator('[data-meowui-part="action-rail/root"]');
  for (const scenario of ["long trailing", "unbroken trailing", "unbroken leading"]) {
    const rail = scenario === "unbroken leading" ? rails.nth(0) : rails.nth(1);
    await rail.evaluate((element, current) => {
      const root = element as HTMLElement;
      root.style.width = "280px";
      const slot = current === "unbroken leading" ? "leading" : "trailing";
      const button = root.querySelector<HTMLElement>(
        `[data-meowui-part="action-rail/${slot}"] > [data-meowui-part="button/root"]`,
      )!;
      button.textContent = current.startsWith("unbroken")
        ? "AnUnbrokenProviderOrAttachmentSelectionThatMustRemainReachable"
        : "A long provider or model selection to inspect";
      for (const action of root.querySelectorAll("button")) {
        action.dataset.activations = "0";
        action.onclick = () => {
          action.dataset.activations = String(Number(action.dataset.activations) + 1);
        };
      }
    }, scenario);

    const geometry = await rail.evaluate((element) => {
      const root = element.getBoundingClientRect();
      return [...element.querySelectorAll("button")].map((action) => {
        const rect = action.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return {
          left: rect.left - root.left,
          right: rect.right - root.left,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          rootWidth: root.width,
          contentFits: action.scrollWidth <= action.clientWidth + 1,
          centerHitsAction: hit === action || (!!hit && action.contains(hit)),
        };
      });
    });
    for (const [index, action] of geometry.entries()) {
      expect(action.left, scenario).toBeGreaterThanOrEqual(-1);
      expect(action.right, scenario).toBeLessThanOrEqual(action.rootWidth + 1);
      expect(action.width, scenario).toBeGreaterThan(0);
      expect(action.contentFits, scenario).toBe(true);
      expect(action.centerHitsAction, scenario).toBe(true);
      for (const other of geometry.slice(index + 1)) {
        const overlapX = Math.min(action.right, other.right) - Math.max(action.left, other.left);
        const overlapY = Math.min(action.bottom, other.bottom) - Math.max(action.top, other.top);
        expect(overlapX <= 1 || overlapY <= 1, scenario).toBe(true);
      }
    }

    const actions = rail.locator("button");
    await actions.first().focus();
    for (const action of await actions.all()) {
      await expect(action).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(action).toHaveAttribute("data-activations", "1");
      await page.keyboard.press("Tab");
      await action.click();
      await expect(action).toHaveAttribute("data-activations", "2");
      await page.keyboard.press("Tab");
    }
  }
});
