import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/canvas.html?story=toolbar");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
});

test("actions have one Tab entry and retain native activation", async ({ page }) => {
  const toolbar = page.getByRole("toolbar", { name: "Filter and preview", exact: true });
  const update = toolbar.getByRole("button", { name: "Update preview" });
  const help = toolbar.getByRole("link", { name: "View toolbar notes" });
  await update.focus();
  await page.keyboard.press("End");
  await expect(help).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(update).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(help).toBeFocused();
  await page.keyboard.press("Home");
  await expect(update).toBeFocused();
  await expect(toolbar.locator('button[tabindex="0"], a[tabindex="0"]')).toHaveCount(1);
  await update.evaluate((element) => {
    element.addEventListener("click", () => element.setAttribute("data-activated", "true"));
  });
  await page.keyboard.press("Space");
  await expect(update).toHaveAttribute("data-activated", "true");
  await update.evaluate((element) => element.removeAttribute("data-activated"));
  await page.keyboard.press("Enter");
  await expect(update).toHaveAttribute("data-activated", "true");
  await help.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#toolbar-help$/);
});

test("mixed editors and a choice selector retain their own keys and Tab stops", async ({
  page,
}) => {
  const toolbar = page.getByRole("toolbar", { name: "Filter and preview", exact: true });
  const update = toolbar.getByRole("button", { name: "Update preview" });
  const input = toolbar.getByRole("textbox", { name: "Filter preview" });
  const select = toolbar.getByRole("combobox", { name: "Preview annotations" });
  await update.focus();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await input.fill("preview");
  await page.keyboard.press("ArrowLeft");
  await expect(input).toBeFocused();
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionStart)).toBe(6);
  await page.keyboard.press("Tab");
  await expect(select).toBeFocused();
  await select.selectOption("off");
  // Inline native options avoid the OS popup, which headless Chromium cannot drive on macOS.
  await select.evaluate((element) => element.setAttribute("size", "3"));
  const options = toolbar.getByRole("listbox", { name: "Preview annotations" });
  await page.keyboard.press("ArrowDown");
  await expect(options).toBeFocused();
  await expect(options).toHaveValue("controls");
  const choice = toolbar.getByRole("button", { name: "Preview appearance" });
  await choice.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox", { name: "Preview appearance" })).toBeVisible();
  await page.keyboard.press("End");
  await expect(
    page
      .getByRole("listbox", { name: "Preview appearance" })
      .getByRole("option", { name: "Dark", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(choice).toBeFocused();
  await expect(choice).toContainText("Dark");
  await page.keyboard.press("Shift+Tab");
  await expect(options).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(choice).toBeFocused();
});

test("orientation, RTL and nested toolbars use distinct action collections", async ({ page }) => {
  const preview = page.getByRole("toolbar", { name: "Preview actions", exact: true });
  await preview.evaluate((element) => element.setAttribute("dir", "rtl"));
  const desktop = preview.getByRole("button", { name: "Desktop", exact: true });
  const reset = preview.getByRole("button", { name: "Reset preview" });
  await desktop.focus();
  await page.keyboard.press("ArrowRight");
  await expect(reset).toBeFocused();
  const vertical = page.getByRole("toolbar", { name: "Canvas actions", exact: true });
  await vertical.getByRole("button", { name: "Zoom out canvas" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(vertical.getByRole("button", { name: "Zoom in canvas" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(vertical.getByRole("button", { name: "Zoom out canvas" })).toBeFocused();
  const outer = page.getByRole("toolbar", { name: "Editing and canvas", exact: true });
  await outer.getByRole("button", { name: "Save layout" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(outer.getByRole("button", { name: "Cancel editing" })).toBeFocused();
  const nested = page.getByRole("toolbar", { name: "Canvas zoom", exact: true });
  await nested.getByRole("button", { name: "Zoom out preview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(nested.getByRole("button", { name: "Zoom in preview" })).toBeFocused();
  await expect(outer.getByRole("button", { name: "Programmatic entry point" })).toHaveAttribute(
    "tabindex",
    "-1",
  );
});

test("dynamic exclusion and caller opt-out leave a reachable entry without stealing focus", async ({
  page,
}) => {
  const toolbar = page.getByRole("toolbar", { name: "Preview actions", exact: true });
  const desktop = toolbar.getByRole("button", { name: "Desktop", exact: true });
  const mobile = toolbar.getByRole("button", { name: "Mobile", exact: true });
  const reset = toolbar.getByRole("button", { name: "Reset preview" });
  const outside = page.getByRole("textbox", { name: "Filter preview" });
  await reset.focus();
  await outside.focus();
  await reset.evaluate((element) => element.setAttribute("hidden", ""));
  await expect(desktop).toHaveAttribute("tabindex", "0");
  await expect(outside).toBeFocused();
  await desktop.evaluate((element) => element.setAttribute("disabled", ""));
  await expect(mobile).toHaveAttribute("tabindex", "0");
  await desktop.evaluate((element) => element.removeAttribute("disabled"));
  await reset.evaluate((element) => element.removeAttribute("hidden"));
  await expect(mobile).toHaveAttribute("tabindex", "0");
  await expect(outside).toBeFocused();
  // Desktop already has our -1: the same explicit caller write must still opt out.
  await desktop.evaluate((element) => element.setAttribute("tabindex", "-1"));
  await mobile.evaluate((element) => element.setAttribute("inert", ""));
  await expect(reset).toHaveAttribute("tabindex", "0");
  await expect(outside).toBeFocused();
  await mobile.evaluate((element) => element.removeAttribute("inert"));
  await reset.focus();
  await page.keyboard.press("ArrowRight");
  await expect(mobile).toBeFocused();
  await mobile.evaluate((element) => element.remove());
  await expect(reset).toHaveAttribute("tabindex", "0");
  await desktop.evaluate((element) => element.removeAttribute("tabindex"));
  await reset.focus();
  await page.keyboard.press("ArrowRight");
  await expect(desktop).toBeFocused();
});

test("a consumed action key is not handled again by Toolbar", async ({ page }) => {
  const toolbar = page.getByRole("toolbar", { name: "Preview actions", exact: true });
  const desktop = toolbar.getByRole("button", { name: "Desktop", exact: true });
  await desktop.evaluate((element) => {
    element.addEventListener("keydown", (event) => event.preventDefault());
  });
  await desktop.focus();
  await page.keyboard.press("End");
  await expect(desktop).toBeFocused();
});

test("unmount restores owned tabindex while preserving a pending caller change", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const toolbar = document.querySelector('[role="toolbar"][aria-label="Preview actions"]')!;
    const [desktop, mobile, reset] = [...toolbar.querySelectorAll("button")];
    mobile!.setAttribute("tabindex", "3");
    // pagehide invokes the actual canvas renderer's unmount, before the observer callback.
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
    return [desktop, mobile, reset].map((element) => element!.getAttribute("tabindex"));
  });
  expect(result).toEqual([null, "3", null]);
});

test("an open shadow root retains the last action as its return Tab entry", async ({ page }) => {
  await page.evaluate(() => {
    const toolbar = document.querySelector('[role="toolbar"][aria-label="Preview actions"]')!;
    const host = document.createElement("div");
    host.id = "toolbar-shadow-host";
    toolbar.before(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.append(toolbar);
    const after = document.createElement("input");
    after.setAttribute("aria-label", "After shadow toolbar");
    shadow.append(after);
  });
  const toolbar = page.getByRole("toolbar", { name: "Preview actions", exact: true });
  const desktop = toolbar.getByRole("button", { name: "Desktop", exact: true });
  const reset = toolbar.getByRole("button", { name: "Reset preview" });
  await desktop.focus();
  await page.keyboard.press("End");
  await expect(reset).toBeFocused();
  await expect(reset).toHaveAttribute("tabindex", "0");
  await expect(desktop).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("textbox", { name: "After shadow toolbar" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(reset).toBeFocused();
  const restored = await reset.evaluate((element) => {
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }));
    return element.getAttribute("tabindex");
  });
  expect(restored).toBeNull();
});

test("media-query hiding the current entry recomputes on resize and actions wrap", async ({
  page,
}) => {
  const toolbar = page.getByRole("toolbar", { name: "Preview actions", exact: true });
  const desktop = toolbar.getByRole("button", { name: "Desktop", exact: true });
  const mobile = toolbar.getByRole("button", { name: "Mobile", exact: true });
  await desktop.evaluate((element) => (element.id = "responsive-toolbar-action"));
  await page.addStyleTag({
    content: "@media (max-width: 500px) { #responsive-toolbar-action { display: none; } }",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(desktop).toBeHidden();
  await expect(mobile).toHaveAttribute("tabindex", "0");
  const mixed = page.getByRole("toolbar", { name: "Filter and preview", exact: true });
  const bounds = await mixed.evaluate((element) => ({
    width: element.clientWidth,
    scroll: element.scrollWidth,
    wrap: getComputedStyle(element).flexWrap,
  }));
  expect(bounds.wrap).toBe("wrap");
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.width + 1);
  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(desktop).toBeVisible();
  await expect(mobile).toHaveAttribute("tabindex", "0");
});

test("the actual Meowbook toolbar retains its native Select and action navigation", async ({
  page,
}) => {
  await page.goto("/?story=toolbar");
  const toolbar = page.getByRole("toolbar", { name: "Preview tools", exact: true });
  const desktop = toolbar.getByRole("button", { name: "Desktop", exact: true });
  await desktop.focus();
  await page.keyboard.press("End");
  await expect(toolbar.getByRole("button", { name: "Reset sample" })).toBeFocused();
  const select = toolbar.getByRole("combobox", { name: "Annotation category" });
  await select.focus();
  await select.evaluate((element) => {
    element.ownerDocument.addEventListener("keydown", (event) => {
      if (event.target === element && event.key === "ArrowDown")
        element.setAttribute("data-key-consumed", String(event.defaultPrevented));
    });
  });
  await page.keyboard.press("ArrowDown");
  await expect(select).toBeFocused();
  await expect(select).toHaveAttribute("data-key-consumed", "false");
  await page.keyboard.press("Escape");
  await select.selectOption("controls");
  await expect(select).toHaveValue("controls");
  // The actions keep one Tab entry: the last one reached with the arrow keys.
  await page.keyboard.press("Tab");
  await expect(toolbar.getByRole("button", { name: "Reset sample" })).toBeFocused();
});
