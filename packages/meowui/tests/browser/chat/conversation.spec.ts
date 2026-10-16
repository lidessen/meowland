import { expect, test } from "@playwright/test";

test("conversation preserves reading during output and resize, resumes latest, and remounts cleanly", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-conversation");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const viewport = page.getByRole("region", { name: "示例对话阅读区" });
  const latest = page.getByRole("button", { name: "回到最新消息" });
  const distance = () =>
    viewport.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop);
  await expect.poll(distance).toBeLessThan(2);
  await page.getByRole("button", { name: "增加一条回复" }).click();
  await expect.poll(distance).toBeLessThan(2);
  await viewport.evaluate((el) => {
    el.scrollTop = 120;
  });
  await expect(latest).toBeVisible();
  const top = await viewport.evaluate((el) => el.scrollTop);
  await page.getByRole("button", { name: "增加一条回复" }).click();
  await page.getByRole("button", { name: "继续当前回复" }).click();
  await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(top);
  await viewport.evaluate((el) => {
    (el.parentElement as HTMLElement).style.height = "260px";
  });
  await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(top);
  await latest.click();
  await expect.poll(distance).toBeLessThan(2);
  await expect(viewport).toBeFocused();
  await expect(latest).toBeHidden();
  await page.getByRole("button", { name: "继续当前回复" }).click();
  await expect.poll(distance).toBeLessThan(2);
  await page.getByRole("button", { name: "收起 / 展开阅读区" }).click();
  await expect(viewport).toHaveCount(0);
  await page.getByRole("button", { name: "增加一条回复" }).click();
  await page.getByRole("button", { name: "收起 / 展开阅读区" }).click();
  await expect.poll(distance).toBeLessThan(2);
});
