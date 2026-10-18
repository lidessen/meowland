import { expect, test } from "@playwright/test";

test("native checkbox and switch preserve labels, keyboard, form values and reset ownership", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=toggles");
  const remember = page.getByRole("checkbox", { name: "Save this choice", exact: true });
  const confirm = page.getByRole("checkbox", { name: "Required before submitting", exact: true });
  const tools = page.getByRole("switch", { name: "Show tool process", exact: true });
  const notifications = page.getByRole("switch", {
    name: "Notifications (controlled)",
    exact: true,
  });
  const fixed = page.getByRole("switch", { name: "Always on (rejects changes)", exact: true });
  await expect(remember).toBeChecked();
  await page.getByText("Save this choice", { exact: true }).click();
  await expect(remember).not.toBeChecked();
  await tools.focus();
  await page.keyboard.press("Space");
  await expect(tools).not.toBeChecked();
  await notifications.click();
  await expect(notifications).not.toBeChecked();
  // click, rather than setChecked: a controlled caller can reject the proposal.
  await fixed.click();
  await expect(fixed).toBeChecked();
  expect(await confirm.evaluate((input) => (input as HTMLInputElement).validity.valueMissing)).toBe(
    true,
  );
  await confirm.check();
  const values = await confirm.evaluate((input) => [
    ...new FormData((input as HTMLInputElement).form!).keys(),
  ]);
  expect(values).toEqual(["confirm"]);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(remember).toBeChecked();
  await expect(tools).toBeChecked();
  await expect(confirm).not.toBeChecked();
  await expect(notifications).not.toBeChecked();
  await expect(fixed).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Currently unavailable", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("switch", { name: "Unavailable", exact: true })).toBeDisabled();
});

test("controlled reset follows a reassigned native form owner", async ({ page }) => {
  await page.goto("/canvas.html?story=toggles");
  const fixed = page.getByRole("switch", { name: "Always on (rejects changes)", exact: true });
  await fixed.evaluate((element) => {
    const form = document.createElement("form");
    form.id = "alternate-toggle-form";
    document.body.append(form);
    element.setAttribute("form", form.id);
    form.reset();
  });
  await expect(fixed).toBeChecked();
});
