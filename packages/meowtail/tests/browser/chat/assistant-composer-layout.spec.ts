import { expect, test } from "@playwright/test";

test("the complete Assistant keeps attachment, short draft and send on one mobile writing row", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/canvas.html?story=assistant-complete");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.getByRole("textbox", { name: "Message", exact: true }).fill("Short draft");
    const composer = page.locator('[data-meowui-part="chat-composer/root"]');
    const geometry = await composer.evaluate((element) => {
      const measure = (target: Element) => {
        const bounds = target.getBoundingClientRect();
        return {
          left: bounds.left,
          right: bounds.right,
          top: bounds.top,
          bottom: bounds.bottom,
          center: bounds.y + bounds.height / 2,
        };
      };
      return {
        composer: measure(element),
        attach: measure(element.querySelector('[aria-label="Attach files"]')!),
        input: measure(element.querySelector("textarea")!),
        send: measure(element.querySelector('[aria-label="Send message"]')!),
        choices: measure(element.querySelector('[data-meowui-part="chat-composer/trailing"]')!),
      };
    });
    // One writing row at every width: attach, short draft and send share a center line.
    expect(geometry.attach.left).toBeGreaterThanOrEqual(geometry.composer.left);
    expect(geometry.send.right).toBeLessThanOrEqual(geometry.composer.right);
    expect(Math.abs(geometry.attach.center - geometry.input.center)).toBeLessThan(1);
    expect(Math.abs(geometry.send.center - geometry.input.center)).toBeLessThan(1);
    expect(geometry.attach.right).toBeLessThanOrEqual(geometry.input.left);
    if (viewport.width === 390) {
      // A narrow container gives the model choices a quiet row under the text.
      expect(geometry.input.right).toBeLessThanOrEqual(geometry.send.left);
      expect(geometry.choices.top).toBeGreaterThanOrEqual(geometry.input.bottom);
    } else {
      // A wide one keeps them on the row, between the draft and send.
      expect(geometry.input.right).toBeLessThanOrEqual(geometry.choices.left);
      expect(geometry.choices.right).toBeLessThanOrEqual(geometry.send.left);
    }
  }
});

test("the attachment action retains keyboard activation, draft and disabled semantics", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=assistant-complete");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  const attach = page.getByRole("button", { name: "Attach files", exact: true });
  const composer = page.locator('[data-meowui-part="assistant-composer/root"]');
  const messages = page.locator("[data-assistant-message-id]");
  await input.fill("Keep this draft");
  const before = await messages.count();
  for (const key of ["Enter", "Space"]) {
    await attach.focus();
    const chosen = page.waitForEvent("filechooser");
    await attach.press(key);
    await (
      await chosen
    ).setFiles({
      name: `${key}-attachment.txt`,
      mimeType: "text/plain",
      buffer: Buffer.from("Local fixture attachment"),
    });
    await expect(
      composer.getByRole("link", { name: new RegExp(`${key}-attachment.txt`) }),
    ).toBeVisible();
  }
  await expect(input).toHaveValue("Keep this draft");
  await expect(messages).toHaveCount(before);
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click();
  await expect(attach).toBeDisabled();
  await page.getByRole("button", { name: "Toggle disabled", exact: true }).click();
  await expect(attach).toBeEnabled();
});
