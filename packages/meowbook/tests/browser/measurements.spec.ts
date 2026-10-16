import { expect, test } from "@playwright/test";

test("category inspection reads arbitrary CSS outside the canvas without remounting", async ({
  page,
}) => {
  await page.goto("/?story=runtime/input");
  const canvas = page.frameLocator("#canvas");
  const input = canvas.getByRole("textbox", { name: "草稿" });
  const mode = page.getByLabel("标注类别", { exact: true });
  const measurements = canvas.locator("#story-measurements");
  await expect(mode).toHaveValue("off");
  await expect(measurements).toHaveCount(0);
  await input.fill("保留输入");
  const before = await input.boundingBox();
  await input.evaluate((element) => {
    element.addEventListener("click", () => {
      (element as HTMLElement).dataset.clicked = "true";
    });
  });
  await mode.selectOption("controls");
  await expect(measurements).toHaveAttribute("data-mode", "controls");
  await expect(measurements.locator('.measurement-box[data-kind="controls"]')).toHaveCount(1);
  await expect(measurements.locator('.measurement-box:not([data-kind="controls"])')).toHaveCount(0);
  expect(await input.boundingBox()).toEqual(before);
  await input.click();
  await expect(input).not.toHaveAttribute("data-clicked", "true");
  const detail = page.locator("#measurement-detail");
  await expect(detail).toContainText("草稿");
  await expect(canvas.locator("#measurement-detail")).toHaveCount(0);
  // Deliberately unrelated to MeowUI's sizes; no theme or component classes are installed.
  await input.evaluate((element) =>
    Object.assign((element as HTMLElement).style, {
      width: "173px",
      height: "37px",
      boxSizing: "border-box",
      fontSize: "15px",
      lineHeight: "21px",
      padding: "3px 7px",
      margin: "5px",
    }),
  );
  await expect(detail).toContainText("173 × 37");
  await expect(detail).toContainText("15px");
  await expect(detail).toContainText("21px");
  await expect(detail).toContainText("3px 7px 3px 7px");
  await expect(detail).toContainText("5px 5px 5px 5px");
  await mode.selectOption("spacing");
  await input.click();
  await expect(measurements).toHaveAttribute("data-mode", "spacing");
  await expect(
    measurements.locator('.measurement-box[data-kind="spacing"]').first(),
  ).toBeAttached();
  await expect(measurements.locator('.measurement-box:not([data-kind="spacing"])')).toHaveCount(0);
  await mode.selectOption("off");
  await expect(measurements).toHaveCount(0);
  await expect(input).toHaveValue("保留输入");
  await input.click();
  await expect(input).toHaveAttribute("data-clicked", "true");
  await mode.selectOption("controls");
  await page.getByRole("button", { name: "重置样例", exact: true }).click();
  await expect(measurements).toHaveAttribute("data-mode", "controls");
  await expect(input).toHaveValue("");
});

test("text and structure categories isolate their annotations", async ({ page }) => {
  await page.goto("/?story=runtime/full");
  const canvas = page.frameLocator("#canvas");
  const mode = page.getByLabel("标注类别", { exact: true });
  const measurements = canvas.locator("#story-measurements");
  for (const category of ["text", "structure"]) {
    await mode.selectOption(category);
    await expect(measurements).toHaveAttribute("data-mode", category);
    await expect(
      measurements.locator(`.measurement-box[data-kind="${category}"]`).first(),
    ).toBeAttached();
    await expect(
      measurements.locator(`.measurement-box:not([data-kind="${category}"])`),
    ).toHaveCount(0);
  }
  await mode.selectOption("controls");
  await expect(measurements.locator(".measurement-box")).toHaveCount(0);
});

test("text placeholders preserve content, geometry and values and restore independently", async ({
  page,
}) => {
  await page.goto("/?story=runtime/full");
  const canvas = page.frameLocator("#canvas");
  const heading = canvas.getByRole("heading", { name: "复杂组件" });
  const toggle = page.getByRole("button", { name: "文字占位", exact: true });
  const mode = page.getByLabel("标注类别", { exact: true });
  const measurements = canvas.locator("#story-measurements");
  await expect(heading).toBeVisible();
  const before = await heading.boundingBox();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(measurements).toHaveAttribute("data-mode", "off");
  const placeholder = measurements.locator(".measurement-placeholder").first();
  await expect(placeholder).toBeAttached();
  await expect(placeholder).toHaveCSS("pointer-events", "none");
  await expect(heading).toHaveText("复杂组件");
  expect(await heading.boundingBox()).toEqual(before);
  await mode.selectOption("text");
  await toggle.click();
  await expect(measurements.locator(".measurement-placeholder")).toHaveCount(0);
  await expect(measurements).toHaveAttribute("data-mode", "text");
  await expect(heading).toBeVisible();
  expect(await heading.boundingBox()).toEqual(before);
  await mode.selectOption("off");
  await expect(measurements).toHaveCount(0);

  await page.goto("/?story=runtime/input");
  const input = canvas.getByRole("textbox", { name: "草稿" });
  await input.fill("占位前的内容");
  const inputBefore = await input.boundingBox();
  await toggle.click();
  await expect(input).toHaveValue("占位前的内容");
  expect(await input.boundingBox()).toEqual(inputBefore);
  await input.fill("占位期间仍可编辑");
  await toggle.click();
  await expect(input).toHaveValue("占位期间仍可编辑");
  expect(await input.boundingBox()).toEqual(inputBefore);
});
