import { expect, test } from "@playwright/test";

test("search supports filtering, clearing and native field states across appearances", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=search-input");
  const search = page.getByRole("searchbox", { name: "在当前项目中查找" });
  await search.fill("主题");
  await expect(page.locator("[data-search-title]:visible")).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: "1 条本地结果" })).toBeVisible();
  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: /^外观/ }).selectOption(scheme);
    await expect(search).toHaveValue("主题");
    await search.focus();
    await expect(search).toBeFocused();
  }
  await search.fill("不存在");
  await expect(page.locator("[data-search-empty]")).toBeVisible();
  await search.fill("");
  await expect(page.locator("[data-search-title]:visible")).toHaveCount(3);
  await expect(page.getByRole("searchbox", { name: "等待索引" })).toBeDisabled();
  await expect(page.getByRole("searchbox", { name: "范围已锁定" })).not.toBeEditable();
  await expect(page.getByRole("searchbox", { name: "查询格式" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByRole("searchbox", { name: "查询格式" })).toHaveAttribute(
    "aria-describedby",
    "invalid-query-error",
  );
});
