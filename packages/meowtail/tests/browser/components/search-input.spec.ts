import { expect, test } from "@playwright/test";

test("search supports filtering, clearing and native field states across appearances", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=search-input");
  const search = page.getByRole("searchbox", { name: "Search in the current project" });
  await search.fill("theme");
  await expect(page.locator("[data-search-title]:visible")).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: "1 local result" })).toBeVisible();
  for (const scheme of ["light", "dark"]) {
    await page.getByRole("combobox", { name: /^Appearance/ }).selectOption(scheme);
    await expect(search).toHaveValue("theme");
    await search.focus();
    await expect(search).toBeFocused();
  }
  await search.fill("missing");
  await expect(page.locator("[data-search-empty]")).toBeVisible();
  await search.fill("");
  await expect(page.locator("[data-search-title]:visible")).toHaveCount(3);
  await expect(page.getByRole("searchbox", { name: "Waiting for index" })).toBeDisabled();
  await expect(page.getByRole("searchbox", { name: "Scope locked" })).not.toBeEditable();
  await expect(page.getByRole("searchbox", { name: "Query format" })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByRole("searchbox", { name: "Query format" })).toHaveAttribute(
    "aria-describedby",
    "invalid-query-error",
  );
});
