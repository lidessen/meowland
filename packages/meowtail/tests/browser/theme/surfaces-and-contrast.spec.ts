import { standardOptions, uiTokens } from "meowtail/theme";
import { themeAttributes } from "meowcss";
import { expect, test } from "@playwright/test";

test(`Studio dark attachments and dialog retain their theme surfaces`, async ({ page }, info) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=content-carriers");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  const image = page.locator('[data-meowui-part="chat-attachments/image"]');
  const file = page.locator('[data-meowui-part="chat-attachments/file"]');
  await expect(image).toBeVisible();
  await expect(file).toBeVisible();
  const surface = await image.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(surface).not.toBe("rgba(0, 0, 0, 0)");
  // Image seats may be translucent; file cards have their own opaque fill.
  const fileSurface = await file.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(fileSurface).toMatch(/^rgb\(/);
  await expect(image.locator("img")).toHaveCSS("object-fit", "contain");
  await page
    .getByRole("button", { name: "预览 组件设计语言与交互状态说明.md", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const dialogSurface = await dialog.evaluate((element, surface) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = surface;
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, String(uiTokens.surface));
  // Chat attachments inherit the chat palette; dialogs use the general UI
  // surface. Both must be opaque, but the two palettes need not be identical.
  expect(dialogSurface).toMatch(/^rgb\(/);
  await expect(dialog).toHaveCSS("background-color", dialogSurface);
  const backdrop = await dialog.evaluate(
    (element) => getComputedStyle(element, "::backdrop").backgroundColor,
  );
  expect(backdrop).not.toBe("rgba(0, 0, 0, 0)");
  await page.screenshot({ path: info.outputPath(`Studio-dark-dialog.png`) });
});

for (const scheme of ["light", "dark"]) {
  test(`DeepSeek ${scheme} reading text and action labels keep readable contrast`, async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=design-language");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await page.getByRole("combobox", { name: "外观", exact: true }).selectOption(scheme);
    const actions = page.locator('[data-meowui-part="chat-message-actions/root"] button');
    expect(await actions.count()).toBeGreaterThan(0);
    for (const action of await actions.all()) {
      // Actions are deliberately quiet until hover or keyboard focus. Check
      // their fully revealed state, including the ancestor opacity.
      await action.focus();
      await expect(
        action.locator("xpath=ancestor::*[@data-meowui-part='chat-message/actions']"),
      ).toHaveCSS("opacity", "1");
      const checks = await page.evaluate(
        (tokens) => {
          const rgb = (color: string) =>
            color
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number);
          const luminance = (color: number[]) =>
            color
              .map((c) => {
                const s = c / 255;
                return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
              })
              .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i]!, 0);
          const contrast = (a: number[], b: number[]) => {
            const x = luminance(a),
              y = luminance(b);
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
          };
          const probe = document.createElement("span");
          document.body.append(probe);
          const token = (name: string) => {
            probe.style.color = name;
            return rgb(getComputedStyle(probe).color);
          };
          const results: { role: string; ratio: number }[] = [];
          // Verify the standard reading surfaces and their text roles. Tertiary
          // icon/disabled ink is not a text role on every possible selected fill.
          for (const surface of [tokens.background, tokens.surface]) {
            for (const ink of [tokens.foreground, tokens.mutedForeground]) {
              results.push({
                role: `${ink} on ${surface}`,
                ratio: contrast(token(ink), token(surface)),
              });
            }
          }
          results.push({
            role: "primary button",
            ratio: contrast(token(tokens.onPrimary), token(tokens.primary)),
          });
          results.push({
            role: "danger button",
            ratio: contrast(token(tokens.onDanger), token(tokens.danger)),
          });
          for (const selector of [
            '[data-meowui-part="chat-message/time"]',
            '[data-meowui-part="chat-message-actions/root"] button:focus',
          ]) {
            for (const element of document.querySelectorAll<HTMLElement>(selector)) {
              const foreground = rgb(getComputedStyle(element).color);
              // Resolve the actual opaque ancestor surface, not a palette pair
              // inferred from the message role.
              let surface = token(tokens.background);
              for (
                let parent: HTMLElement | null = element;
                parent;
                parent = parent.parentElement
              ) {
                const fill = getComputedStyle(parent).backgroundColor;
                if (fill.startsWith("rgb(")) {
                  surface = rgb(fill);
                  break;
                }
              }
              let opacity = 1;
              for (
                let parent: HTMLElement | null = element;
                parent;
                parent = parent.parentElement
              ) {
                opacity *= Number(getComputedStyle(parent).opacity);
              }
              const displayed = foreground.map(
                (channel, i) => channel * opacity + surface[i]! * (1 - opacity),
              );
              results.push({ role: selector, ratio: contrast(displayed, surface) });
            }
          }
          probe.remove();
          return results;
        },
        {
          background: String(uiTokens.background),
          surface: String(uiTokens.surface),
          foreground: String(uiTokens.foreground),
          mutedForeground: String(uiTokens.mutedForeground),
          onPrimary: String(uiTokens.onPrimary),
          primary: String(uiTokens.primary),
          onDanger: String(uiTokens.onDanger),
          danger: String(uiTokens.dangerAction),
        },
      );
      for (const { role, ratio } of checks) expect(ratio, role).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test(`Studio nested design inherits dark appearance while explicit light islands resolve locally`, async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("http://127.0.0.1:13007/canvas.html?story=design-language");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("combobox", { name: "外观", exact: true }).selectOption("dark");
  const colors = await page.evaluate(
    ({ inherited, lightConfig, darkConfig }) => {
      const panel = document.createElement("section");
      for (const [key, value] of Object.entries(inherited)) panel.setAttribute(key, value);
      panel.setAttribute("data-meowui-part", "card/root");
      panel.setAttribute("data-option-card-variant", "surface");
      document.body.append(panel);
      const dark = getComputedStyle(panel).backgroundColor;
      const inheritedScheme = getComputedStyle(panel).colorScheme;
      for (const [key, value] of Object.entries(lightConfig)) panel.setAttribute(key, value);
      const light = getComputedStyle(panel).backgroundColor;
      for (const [key, value] of Object.entries(darkConfig)) panel.setAttribute(key, value);
      const restored = getComputedStyle(panel).backgroundColor;
      panel.remove();
      return { dark, light, restored, inheritedScheme };
    },
    {
      inherited: themeAttributes(),
      lightConfig: standardOptions.select({ scheme: "light" }).attributes,
      darkConfig: standardOptions.select({ scheme: "dark" }).attributes,
    },
  );
  expect(colors.inheritedScheme).toBe("dark");
  expect(colors.dark).not.toBe(colors.light);
  expect(colors.restored).toBe(colors.dark);
});
