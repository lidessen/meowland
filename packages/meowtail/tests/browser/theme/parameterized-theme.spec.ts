import { expect, test } from "@playwright/test";

test("region configuration updates in place, restores inheritance, and resolves auto", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/canvas.html?story=parameterized-theme-prototype");
  const draft = page.getByRole("textbox", { name: "草稿", exact: true });
  await draft.fill("keep this draft");
  await page.locator("#details summary").click();
  await expect(page.locator("#dynamic-button")).toHaveCSS("min-height", "36px");
  await page.getByRole("button", { name: "局部紧凑", exact: true }).click();
  await expect(page.locator("#local-button")).toHaveCSS("min-height", "28px");
  await expect(page.locator("#dynamic-button")).toHaveCSS("min-height", "36px");
  await page.getByRole("button", { name: "撤销局部", exact: true }).click();
  await expect(page.locator("#local-button")).toHaveCSS("min-height", "36px");
  await page.getByRole("button", { name: "全局深色", exact: true }).click();
  await expect(page.locator("#scope-local")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await expect(page.locator("#inner-pane > h3")).toHaveCSS("color", "rgb(237, 237, 238)");
  await page.getByRole("button", { name: "局部浅色", exact: true }).click();
  await expect(page.locator("#scope-local")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.getByRole("button", { name: "局部跟随系统", exact: true }).click();
  await expect(page.locator("#scope-local")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("#scope-local")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator("#scope-root")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await draft.focus();
  const before = await draft.elementHandle();
  await page
    .getByRole("button", { name: "深色紧凑", exact: true })
    .evaluate((element: HTMLButtonElement) => element.click());
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue("keep this draft");
  expect(await draft.evaluate((element, original) => element === original, before)).toBe(true);
  await expect(page.locator("#details")).toHaveAttribute("open", "");
});

test("variant rules, native behavior and nested part isolation", async ({ page }) => {
  await page.goto("/canvas.html?story=parameterized-theme-prototype");
  const button = page.locator("#dynamic-button");
  await expect(button).not.toHaveAttribute("variant");
  await expect(button).not.toHaveAttribute("size");
  await expect(button).toHaveCSS("border-top-width", "1px");
  await button.click();
  await expect(page.locator("#click-count")).toHaveText("1");
  await page.getByRole("button", { name: "切换 quiet", exact: true }).click();
  await expect(button).toHaveCSS("border-top-width", "0px");
  await page.getByRole("button", { name: "恢复默认", exact: true }).click();
  await expect(button).toHaveAttribute("data-option-prototype-button-variant", "quiet");
  await expect(page.locator("#small-button")).toHaveCSS("min-height", "28px");
  await expect(page.locator("#outer-pane > h3")).toHaveCSS("color", "rgb(179, 54, 54)");
  await expect(page.locator("#inner-pane > h3")).toHaveCSS("color", "rgb(37, 37, 39)");
  await expect(page.getByRole("listbox", { name: "原生行数" })).toHaveAttribute("size", "2");
  await expect(page.locator("#override-parent")).toHaveCSS(
    "background-color",
    "rgb(244, 233, 205)",
  );
  await expect(page.locator("#override-child")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toHaveCSS("outline-style", "solid");
});

test("desktop and narrow preview remain usable", async ({ page }) => {
  await page.goto("/canvas.html?story=parameterized-theme-prototype");
  await page.screenshot({ path: "/tmp/meowtail-theme-prototype-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "深色紧凑", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: "/tmp/meowtail-theme-prototype-mobile.png", fullPage: true });
});

test("real Button/Alert use inferred bindings, root defaults and native form semantics", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=real-controls-theme");
  const button = page.locator("#real-button");
  await expect(button).toHaveCSS("min-height", "36px");
  await expect(button).not.toHaveAttribute("variant");
  expect(await button.evaluate((element) => element.classList.length)).toBe(0);
  await expect(page.locator("#real-root")).toHaveAttribute(
    "data-option-controls-trial-density",
    "normal",
  );
  await page.getByRole("textbox", { name: "真实草稿" }).fill("preserved");
  await button.click();
  await expect(page.locator("#real-submitted")).toHaveText("1");
  await expect(page.locator("#real-disabled")).toBeDisabled();
  const border = await button.evaluate((element) => getComputedStyle(element).borderTopColor);
  await page.getByRole("button", { name: "使用 quiet", exact: true }).click();
  await expect(button).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  expect(border).not.toBe("rgba(0, 0, 0, 0)");
  await page.getByRole("button", { name: "恢复 Button 默认", exact: true }).click();
  await expect(button).toHaveAttribute("data-option-button-variant", "primary");
  await expect(page.locator("#real-reset")).toHaveCSS("border-top-width", "1px");
  await page.getByRole("button", { name: "局部 compact", exact: true }).click();
  await expect(page.locator("#real-local-button")).toHaveCSS("min-height", "28px");
  await expect(button).toHaveCSS("min-height", "36px");
  await page.getByRole("button", { name: "撤销局部配置", exact: true }).click();
  await expect(page.locator("#real-local-button")).toHaveCSS("min-height", "36px");
  await page.getByRole("button", { name: "切换紧凑", exact: true }).click();
  await expect(button).toHaveCSS("min-height", "28px");
  await expect(page.locator("#real-local-button")).toHaveCSS("min-height", "28px");
  await page.getByRole("button", { name: "切换深色", exact: true }).click();
  await expect(page.locator("#real-root")).toHaveCSS("background-color", "rgb(36, 36, 38)");
  await expect(page.locator("#real-outer > strong")).toHaveCSS("color", "rgb(243, 157, 157)");
  await expect(page.locator("#real-inner > strong")).toHaveCSS("color", "rgb(140, 188, 240)");
  await expect(page.locator("#real-outer")).toHaveAttribute("role", "alert");
  await expect(page.locator("#real-inner")).toHaveAttribute("role", "status");
  await page.getByRole("button", { name: "恢复 Alert 默认", exact: true }).click();
  await expect(page.locator("#real-outer > strong")).toHaveAttribute(
    "data-option-alert-tone",
    "info",
  );
  await page.getByRole("button", { name: "恢复主题默认", exact: true }).click();
  await expect(page.locator("#real-root")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.getByRole("textbox", { name: "真实草稿" })).toHaveValue("preserved");
  await page.screenshot({ path: "/tmp/meowtail-real-controls-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "切换深色", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: "/tmp/meowtail-real-controls-mobile.png", fullPage: true });
});
