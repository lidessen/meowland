import { expect, test } from "@playwright/test";

test("tabs keyboard navigation skips disabled items, wraps, preserves drafts and panel relationships", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=tabs");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tabs = page.getByRole("tablist", { name: "项目视图" });
  const overview = tabs.getByRole("tab", { name: "概览", exact: true });
  const notes = tabs.getByRole("tab", { name: "工作笔记", exact: true });
  const files = tabs.getByRole("tab", { name: "文件", exact: true });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(notes).toBeFocused();
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await expect(tabs.getByRole("tab", { name: "权限管理" })).toBeDisabled();
  const draft = page.getByRole("textbox", { name: "工作草稿" });
  await draft.fill("保留这段草稿");
  await notes.focus();
  await page.keyboard.press("End");
  await expect(files).toBeFocused();
  await expect(draft).toBeHidden();
  await page.keyboard.press("ArrowRight");
  await expect(overview).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(files).toBeFocused();
  await page.keyboard.press("Home");
  await expect(overview).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(draft).toHaveValue("保留这段草稿");
  const panelId = await notes.getAttribute("aria-controls");
  await expect(page.locator(`#${panelId}`)).toHaveAttribute(
    "aria-labelledby",
    (await notes.getAttribute("id")) as string,
  );
  await expect(page.locator(`#${panelId}`)).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(`#${panelId}`)).toBeFocused();
  await page.getByRole("tablist", { name: "受控视图" }).getByRole("tab", { name: "详情" }).click();
  await expect(page.getByRole("tabpanel", { name: "详情" })).toBeVisible();
});
