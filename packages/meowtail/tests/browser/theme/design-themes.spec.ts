import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, story: string, theme: string) {
  await page.goto(`/canvas.html?story=${story}&theme=${theme}`);
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
}

test("Doodle keeps the ink stroke while the pressed action loses its lift", async ({
  page,
}, info) => {
  await open(page, "theme-workbench", "doodle");
  const first = page.getByRole("button", { name: "Save draft" });
  const actions = [
    first,
    page.getByRole("button", { name: "Preview" }),
    page.getByRole("button", { name: "Discard" }),
  ];
  const card = page.locator('[data-meowui-part="card/root"]').first();
  await expect(card).toHaveCSS("border-top-width", "2px");
  await expect(page.locator("html")).toHaveCSS("background-image", /radial-gradient/);
  for (const action of actions) {
    await expect(action).toHaveCSS("min-height", "44px");
    await expect(action).toHaveCSS("border-top-width", "2px");
    await expect(action).not.toHaveCSS("box-shadow", "none");
    await action.hover();
    await page.mouse.down();
    try {
      await expect(action).toHaveCSS("box-shadow", "none");
      await expect(action).toHaveCSS("border-top-width", "2px");
      await expect(action).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 2)");
    } finally {
      await page.mouse.up();
    }
  }
  await page.screenshot({ path: info.outputPath("doodle-workbench.png"), animations: "disabled" });

  await open(page, "theme-workbench", "standard");
  await expect(first).toHaveCSS("min-height", "36px");
  await expect(first).toHaveCSS("border-top-width", "0px");
  await expect(card).toHaveCSS("border-top-width", "1px");
  await expect(page.locator("body")).toHaveCSS("background-image", "none");
});

test("Pine keeps a dark TerminalBlock, recognizable ANSI, and exit status in either appearance", async ({
  page,
}, info) => {
  await open(page, "developer-terminal-theme", "pine");
  const terminal = page.locator('[data-meowui-part="output-block/root"]').last();
  const command = terminal.locator('[data-meowui-part="terminal-block/command"]');
  const reference = terminal.getByText("project-config", { exact: true });
  const appearance = page.getByRole("combobox", { name: "Appearance", exact: true });
  for (const scheme of ["light", "dark"]) {
    await appearance.selectOption(scheme);
    await expect(terminal).toHaveCSS("background-color", "rgb(17, 23, 28)");
    await expect(command).toHaveCSS("color", "rgb(166, 228, 189)");
    await expect(reference).toHaveCSS("color", "rgb(190, 203, 255)");
    await expect(terminal.getByText("Exit code 1", { exact: true }).last()).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`pine-terminal-${scheme}.png`),
      animations: "disabled",
    });
  }
});
