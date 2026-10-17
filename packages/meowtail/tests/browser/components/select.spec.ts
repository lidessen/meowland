import { expect, test } from "@playwright/test";

test("Select states recover from an empty choice and retain multi-selection across appearances", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/canvas.html?story=select-states");
  const environment = page.getByRole("combobox", { name: "发布环境", exact: true });
  const error = page.locator("#select-invalid-error");
  await expect(environment).toHaveAttribute("aria-invalid", "true");
  await environment.selectOption("local");
  await expect(environment).toHaveAttribute("aria-invalid", "false");
  await expect(environment).not.toHaveAttribute("aria-describedby", "select-invalid-error");
  await expect(error).toBeHidden();
  await environment.selectOption("");
  await expect(environment).toHaveAttribute("aria-describedby", "select-invalid-error");
  await expect(error).toBeVisible();
  const outputs = page.getByRole("listbox", { name: "包含的成果", exact: true });
  await outputs.selectOption(["source", "design"]);
  await expect(outputs).toHaveValues(["source", "design"]);
  await expect(page.getByRole("status")).toContainText("源代码修改、设计说明");
  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  await expect(outputs).toHaveValues(["source", "design"]);
  await expect(page.getByRole("combobox", { name: "被锁定的目标", exact: true })).toBeDisabled();
});

test("shared native Select keeps initial, reactive and user selection across appearances", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=fields");
  const delivery = page.getByRole("combobox", { name: "交付方式", exact: true });
  await expect(delivery).toHaveValue("review");
  await expect(delivery).toHaveAttribute("data-meowui-part", "select/root");
  await expect(delivery).toHaveAttribute("required", "");
  await delivery.selectOption("draft");
  await expect(delivery).toHaveValue("draft");
  await page.getByRole("button", { name: "使用推荐设置", exact: true }).click();
  await expect(delivery).toHaveValue("review");
  await delivery.selectOption("export");
  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  await expect(delivery).toHaveValue("export");
  const data = await delivery.evaluate((element) =>
    new FormData((element as HTMLSelectElement).form!).get("delivery"),
  );
  expect(data).toBe("export");
  await page.getByRole("button", { name: "恢复初始值", exact: true }).click();
  await expect(delivery).toHaveValue("review");
  await page.goto("/canvas.html?story=field-errors");
  await expect(page.getByRole("combobox", { name: "执行环境", exact: true })).toBeDisabled();
  await expect(page.getByRole("combobox", { name: "外观", exact: true })).toHaveValue("dark");
});
