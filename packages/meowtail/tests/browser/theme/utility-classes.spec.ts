import { expect, test } from "@playwright/test";

async function settleAnimations(element: import("@playwright/test").Locator) {
  await element.evaluate(async (node) => {
    await Promise.allSettled(node.getAnimations().map((animation) => animation.finished));
  });
}

test("utility class values compose on Buttons and retain state rules", async ({ page }) => {
  await page.goto("/canvas.html?story=utility-classes");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page
    .getByRole("navigation", { name: "Theme preview", exact: true })
    .getByRole("combobox", { name: "Appearance", exact: true })
    .selectOption("light");

  const arrayButton = page.locator("[data-utility-classes-array]");
  const composedButton = page.locator("[data-utility-classes-cx]");
  const activeButton = composedButton;
  const outlineButton = page.getByRole("button", { name: "Outline variant override", exact: true });
  await expect(arrayButton).toHaveClass(/ui-p-group/);
  await expect(arrayButton).toHaveClass(/ui-bg-fill/);
  await expect(arrayButton).toHaveClass(/ui-radius-lg/);
  await expect(composedButton).toHaveClass(
    /ui-p-group ui-radius-lg ui-color-primary ui-interactive-flat-shadow ui-bg-fill/,
  );
  await expect(arrayButton).toHaveAttribute("data-option-button-variant", "primary");
  await expect(activeButton).toHaveAttribute("aria-pressed", "false");
  await expect(outlineButton).toHaveAttribute("data-option-button-variant", "outline");

  const background = (element: import("@playwright/test").Locator) =>
    element.evaluate((node) => getComputedStyle(node).backgroundColor);
  const initialFill = await background(arrayButton);
  await expect(composedButton).toHaveCSS("background-color", initialFill);
  await expect(outlineButton).toHaveCSS("background-color", initialFill);
  const radius = await arrayButton.evaluate((element) => getComputedStyle(element).borderRadius);
  expect(radius).not.toBe("0px");

  await activeButton.click();
  await page.mouse.move(0, 0);
  await expect(activeButton).toHaveAttribute("aria-pressed", "true");
  await expect(activeButton).toHaveClass(/ui-bg-raised/);
  await expect.poll(() => background(activeButton)).not.toBe(initialFill);
  await activeButton.click();
  await page.mouse.move(0, 0);
  await expect(activeButton).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => background(activeButton)).toBe(initialFill);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const probeId = await page.evaluate(() => {
    const button = document.createElement("button");
    button.id = "utility-interaction-regression";
    button.textContent = "Interaction state probe";
    button.className = "ui-interactive-flat-shadow ui-p-group";
    document.querySelector("#story-root")?.append(button);
    return button.id;
  });
  const probe = page.locator(`#${probeId}`);
  await expect(probe).toHaveCSS("transition-duration", "0s");
  await page.mouse.move(0, 0);
  await settleAnimations(probe);
  const resting = await background(probe);
  await probe.hover();
  await expect.poll(() => background(probe)).not.toBe(resting);
  await arrayButton.focus();
  await page.keyboard.press("Tab");
  await expect(activeButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(outlineButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(probe).toBeFocused();
  await expect(probe).toHaveCSS("outline-style", "solid");
  await probe.evaluate((element: HTMLButtonElement) => {
    element.disabled = true;
  });
  await expect(probe).toHaveCSS("cursor", "not-allowed");
  await expect(probe).toHaveCSS("box-shadow", "none");
});
