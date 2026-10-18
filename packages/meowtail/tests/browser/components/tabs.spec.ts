import { expect, test } from "@playwright/test";

test("tabs keyboard navigation skips disabled items, wraps, preserves drafts and panel relationships", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=tabs");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const tabs = page.getByRole("tablist", { name: "Project views" });
  const overview = tabs.getByRole("tab", { name: "Overview", exact: true });
  const notes = tabs.getByRole("tab", { name: "Work notes", exact: true });
  const files = tabs.getByRole("tab", { name: "Files", exact: true });
  await overview.focus();
  await page.keyboard.press("ArrowRight");
  await expect(notes).toBeFocused();
  await expect(notes).toHaveAttribute("aria-selected", "true");
  await expect(tabs.getByRole("tab", { name: "Permissions" })).toBeDisabled();
  const draft = page.getByRole("textbox", { name: "Work draft" });
  await draft.fill("Keep this draft");
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
  await expect(draft).toHaveValue("Keep this draft");
  const panelId = await notes.getAttribute("aria-controls");
  await expect(page.locator(`#${panelId}`)).toHaveAttribute(
    "aria-labelledby",
    (await notes.getAttribute("id")) as string,
  );
  await expect(page.locator(`#${panelId}`)).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(`#${panelId}`)).toBeFocused();
  await page
    .getByRole("tablist", { name: "Controlled views" })
    .getByRole("tab", { name: "Details" })
    .click();
  await expect(page.getByRole("tabpanel", { name: "Details" })).toBeVisible();
});
