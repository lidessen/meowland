import { expect, test } from "@playwright/test";
test("stories inherit, replace or skip the preview container", async ({ page }) => {
  await page.goto("/canvas.html?story=runtime/input");
  await expect(page.locator("[data-default-container] input")).toHaveCount(1);
  await page.goto("/canvas.html?story=runtime/custom-container");
  await expect(page.locator("[data-custom-container] input")).toHaveCount(1);
  await expect(page.locator("[data-default-container]")).toHaveCount(0);
  await page.goto("/canvas.html?story=runtime/bare-container");
  await expect(page.locator("#story-root > input")).toHaveCount(1);
  await expect(page.locator("[data-default-container]")).toHaveCount(0);
});
test("inline story, explicit ready, full and partial render", async ({ page }, info) => {
  for (const width of [1100, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/canvas.html?story=annotation/button");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await expect(page.getByRole("button", { name: "提交" })).toBeDisabled();
    await page.goto("/canvas.html?story=runtime/partial");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await expect(page.getByRole("img", { name: "子组件占位" })).toHaveCount(2);
    await expect(page.locator("body")).not.toHaveAttribute("data-child-executed", "true");
    await expect(page.locator("#story-replacements")).toContainText('"hits":2');
    await expect(page.locator("#story-replacement-details > summary")).toContainText("2 次命中");
    await expect(page.locator("#story-replacements")).not.toBeVisible();
    await page.locator("#story-replacement-details > summary").click();
    await expect(page.locator("#story-replacements")).toBeVisible();
    await page.screenshot({ path: info.outputPath(`partial-${width}.png`) });
    await page.goto("/canvas.html?story=runtime/full");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await expect(page.getByText("真实子组件")).toBeVisible();
    await expect(page.locator("body")).toHaveAttribute("data-child-executed", "true");
    await page.screenshot({ path: info.outputPath(`full-${width}.png`) });
  }
  await page.goto("/canvas.html?story=runtime/async");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await expect(page.getByText("异步已完成")).toBeVisible();
});
test("renderer errors stay errors after inspection", async ({ page }) => {
  await page.goto("/canvas.html?story=runtime/late-error");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "触发异步错误" }).click();
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "error");
  await expect(page.locator("#story-state")).toContainText("fixture late error");
  await page.getByRole("button", { name: "重新加载场景", exact: true }).click();
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "触发异步错误" }).click();
  await page.setViewportSize({ width: 390, height: 800 });
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "error");
  await page.goto("/canvas.html?story=runtime/render-error");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "error");
  await expect(page.locator("#story-state")).toContainText("fixture render error");
});
test("viewport preserves input; reset and navigation clean up", async ({ page }) => {
  await page.goto("/?story=runtime/input");
  const frame = page.frameLocator("#canvas");
  await expect(frame.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await frame.getByRole("textbox", { name: "草稿" }).fill("保留草稿");
  await page.getByRole("button", { name: "移动端", exact: true }).click();
  await expect(page.locator("#canvas")).toHaveCSS("width", "390px");
  await expect(frame.getByRole("textbox", { name: "草稿" })).toHaveValue("保留草稿");
  const oldWindow = await page.evaluateHandle(
    () => (document.querySelector("#canvas") as HTMLIFrameElement).contentWindow,
  );
  await page.getByRole("button", { name: "重置样例" }).click();
  await expect(frame.getByRole("textbox", { name: "草稿" })).toHaveValue("");
  await page.evaluate(
    (old) =>
      window.dispatchEvent(
        new MessageEvent("message", {
          source: old,
          origin: location.origin,
          data: {
            channel: "meowbook",
            story: "runtime/input",
            type: "error",
            message: "stale document",
          },
        }),
      ),
    oldWindow,
  );
  await expect(page.locator("#inspection")).toContainText("未发现基础检查问题");
  await oldWindow.dispose();
  expect(await page.evaluate(() => localStorage.getItem("meowbook-cleanups"))).toBe("1");
  await page.locator("#search").fill("注释按钮");
  await expect(page.locator("#catalog a")).toHaveCount(1);
  await page.locator("#catalog a").click();
  await expect(frame.getByRole("button", { name: "提交" })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("meowbook-cleanups"))).toBe("2");
});
