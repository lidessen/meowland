import { expect, test } from "@playwright/test";

test("MeowUI appearance changes presentation without replacing content or interaction state", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=design-language");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(page.getByRole("combobox", { name: "设计", exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("light");
  const input = page.getByLabel("项目名称", { exact: true });
  await input.fill("保留正在编辑的项目");
  const originalInput = await input.elementHandle();
  expect(originalInput).not.toBeNull();
  const process = page.locator("details").filter({ hasText: "已检查 3 类组件" });
  await process.locator("summary").click();
  await expect(process).toHaveJSProperty("open", true);
  const button = page.getByRole("button", { name: "保存修改", exact: true });
  const light = await button.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.backgroundColor, style.borderRadius, style.boxShadow];
  });

  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.backgroundColor, style.borderRadius, style.boxShadow];
      }),
    )
    .not.toEqual(light);
  expect(await input.evaluate((element, original) => element === original, originalInput)).toBe(
    true,
  );
  await expect(input).toHaveValue("保留正在编辑的项目");
  await expect(process).toHaveJSProperty("open", true);

  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("light");
  expect(await input.evaluate((element, original) => element === original, originalInput)).toBe(
    true,
  );
  await expect(input).toHaveValue("保留正在编辑的项目");
  await expect(process).toHaveJSProperty("open", true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).transitionDuration))
    .toBe("0s");
  await originalInput?.dispose();
});

test("MeowUI appearance persists across story navigation and gallery reset clears only story state", async ({
  page,
}) => {
  await page.goto("/?story=fields");
  const canvas = page.frameLocator("#canvas");
  await expect(canvas.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await canvas.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  await canvas.getByLabel("项目名称", { exact: true }).fill("未保存的改名");
  await page.locator("#reset").click();
  await expect(canvas.getByLabel("项目名称", { exact: true })).toHaveValue("Meowland");
  await expect(canvas.getByRole("combobox", { name: "外观", exact: true })).toHaveValue("dark");
  await page.goto("/?story=dialog");
  await expect(canvas.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(canvas.locator("html")).toHaveAttribute("data-meowui-color-scheme", "dark");
});

test("MeowUI local form validation, composer callback and attachment preview work", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=fields");
  const name = page.getByLabel("项目名称", { exact: true });
  await name.fill("  ");
  await page.getByRole("button", { name: "保存项目", exact: true }).click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await name.fill("重新设计");
  await page.getByRole("button", { name: "保存项目", exact: true }).click();
  await expect(page.locator("#project-feedback")).toContainText("已保存「重新设计」");
  await page.getByRole("button", { name: "恢复初始值", exact: true }).click();
  await expect(name).toHaveValue("Meowland");
  await expect(name).not.toHaveAttribute("aria-invalid");
  await page.goto("/canvas.html?story=design-language");
  await page.getByRole("textbox", { name: "消息", exact: true }).fill("让输入留在原处");
  await page.getByRole("button", { name: "发送", exact: true }).click();
  await expect(page.locator("[data-feedback]")).toContainText("组件提交回调：让输入留在原处");
  await expect(page.getByRole("textbox", { name: "消息", exact: true })).toHaveValue(
    "让输入留在原处",
  );
  await page.goto("/canvas.html?story=content-carriers");
  const preview = page.getByRole("button", {
    name: "预览 组件设计语言与交互状态说明.md",
    exact: true,
  });
  await preview.click();
  await expect(page.getByRole("dialog")).toContainText("内置 Markdown 示例");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(preview).toBeFocused();
});

test("MeowUI dialog fits a narrow viewport and restores keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/canvas.html?story=dialog");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "打开确认弹窗", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "取消", exact: true })).toBeFocused();
  expect(
    await dialog.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        bounds.left >= 0 &&
        bounds.right <= innerWidth &&
        element.scrollWidth <= element.clientWidth + 1
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
