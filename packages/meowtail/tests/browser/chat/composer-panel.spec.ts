import { expect, test } from "@playwright/test";

test("ComposerPanel keeps one surface, the editor actions and the meta row without horizontal overflow", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=composer-panel");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const panel = page.locator('[data-meowui-part="composer-panel/root"]');
    expect(await panel.count()).toBe(1);
    const first = panel;
    const geometry = await first.evaluate((element) => {
      const box = (part: string) => {
        const target = element.querySelector<HTMLElement>(`[data-meowui-part="${part}"]`)!;
        const bounds = target.getBoundingClientRect();
        return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right };
      };
      const root = element.getBoundingClientRect();
      return {
        root: { top: root.top, bottom: root.bottom, left: root.left, right: root.right },
        wrapper: box("composer-panel/surface"),
        surface: box("chat-composer/surface"),
        hint: box("chat-composer/hint"),
        externalHint: !element
          .querySelector('[data-meowui-part="chat-composer/surface"]')!
          .contains(element.querySelector('[data-meowui-part="chat-composer/hint"]')),
        meta: box("composer-panel/meta"),
        input: box("chat-composer/input"),
        trailing: box("chat-composer/trailing"),
        submit: box("chat-composer/submit"),
      };
    });
    expect(geometry.surface.top).toBeGreaterThanOrEqual(geometry.root.top);
    expect(geometry.externalHint).toBe(true);
    expect(geometry.hint.top).toBeGreaterThanOrEqual(geometry.surface.bottom);
    expect(geometry.meta.top).toBeGreaterThanOrEqual(geometry.wrapper.bottom);
    expect(geometry.meta.top).toBeGreaterThanOrEqual(geometry.hint.bottom);
    expect(geometry.input.top).toBeGreaterThan(geometry.surface.top);
    expect(geometry.submit.right).toBeLessThanOrEqual(geometry.surface.right + 1);
    const form = panel.locator('[data-meowui-part="chat-composer/root"]');
    const surface = panel.locator('[data-meowui-part="chat-composer/surface"]');
    const wrapper = panel.locator('[data-meowui-part="composer-panel/surface"]');
    await expect(wrapper).toHaveCSS("box-shadow", "none");
    await expect(wrapper).toHaveCSS("border-top-width", "0px");
    await expect(wrapper).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await panel.getByRole("textbox", { name: "Message", exact: true }).focus();
    await expect(form).toHaveCSS("outline-style", "none");
    await expect(surface).toHaveCSS("outline-style", "solid");
    if (viewport.width >= 768)
      expect(geometry.trailing.right).toBeLessThanOrEqual(geometry.submit.left + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});

test("ComposerPanel keeps keyboard focus paint inside a clipping form with an external hint", async ({
  page,
}) => {
  for (const width of [390, 1000]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/canvas.html?story=composer-panel");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const form = page.locator('[data-meowui-part="chat-composer/root"]');
    await form.evaluate((element) => {
      element.style.overflow = "hidden";
      element.style.padding = "0";
    });
    const input = form.getByRole("textbox", { name: "Message", exact: true });
    await input.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();
    const geometry = await form.evaluate((element) => {
      const surface = element.querySelector<HTMLElement>(
        '[data-meowui-part="chat-composer/surface"]',
      )!;
      const hint = element.querySelector('[data-meowui-part="chat-composer/hint"]')!;
      const bounds = surface.getBoundingClientRect();
      const style = getComputedStyle(surface);
      const outlineWidth = parseFloat(style.outlineWidth);
      const outlineOffset = parseFloat(style.outlineOffset);
      const outset = Math.max(0, outlineWidth + outlineOffset);
      const context = document.createElement("canvas").getContext("2d")!;
      context.fillStyle = style.outlineColor;
      context.fillRect(0, 0, 1, 1);
      const clips = [];
      for (let ancestor = surface.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const css = getComputedStyle(ancestor);
        const containsPaint = /\b(paint|strict|content)\b/.test(css.contain);
        const clipX = containsPaint || /^(hidden|clip|auto|scroll)$/.test(css.overflowX);
        const clipY = containsPaint || /^(hidden|clip|auto|scroll)$/.test(css.overflowY);
        if (!clipX && !clipY) continue;
        const rect = ancestor.getBoundingClientRect();
        clips.push({
          part: ancestor.getAttribute("data-meowui-part"),
          clipX,
          clipY,
          left: rect.left + ancestor.clientLeft,
          right: rect.left + ancestor.clientLeft + ancestor.clientWidth,
          top: rect.top + ancestor.clientTop,
          bottom: rect.top + ancestor.clientTop + ancestor.clientHeight,
        });
      }
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth,
        outlineColor: style.outlineColor,
        outlineAlpha: context.getImageData(0, 0, 1, 1).data[3],
        keyboardFocus: element.querySelector("textarea")!.matches(":focus-visible"),
        paint: {
          left: bounds.left - outset,
          right: bounds.right + outset,
          top: bounds.top - outset,
          bottom: bounds.bottom + outset,
        },
        externalHint: !surface.contains(hint) && hint.parentElement === element,
        hintTop: hint.getBoundingClientRect().top,
        surfaceBottom: bounds.bottom,
        clips,
      };
    });
    expect(geometry.keyboardFocus).toBe(true);
    expect(geometry.outlineStyle).not.toBe("none");
    expect(geometry.outlineStyle).not.toBe("hidden");
    expect(geometry.outlineWidth).toBeGreaterThan(0);
    expect(geometry.outlineColor).not.toBe("transparent");
    expect(geometry.outlineAlpha).toBeGreaterThan(0);
    expect(geometry.clips.some((clip) => clip.part === "chat-composer/root")).toBe(true);
    for (const clip of geometry.clips) {
      if (clip.clipX) {
        expect(geometry.paint.left).toBeGreaterThanOrEqual(clip.left - 0.5);
        expect(geometry.paint.right).toBeLessThanOrEqual(clip.right + 0.5);
      }
      if (clip.clipY) {
        expect(geometry.paint.top).toBeGreaterThanOrEqual(clip.top - 0.5);
        expect(geometry.paint.bottom).toBeLessThanOrEqual(clip.bottom + 0.5);
      }
    }
    expect(geometry.externalHint).toBe(true);
    expect(geometry.hintTop).toBeGreaterThanOrEqual(geometry.surfaceBottom);
    await expect(form).toHaveCSS("outline-style", "none");
    await expect(form).toHaveCSS("box-shadow", "none");
    await expect(form).toHaveCSS("border-top-width", "0px");
    await expect(form).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  }
});
