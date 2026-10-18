import { expect, test } from "@playwright/test";

test("child DOM Escape consumption precedes the Popover callback and native Dialog cancel", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover-escape");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("button", { name: "Open popover dialog", exact: true }).click();
  await page.getByRole("button", { name: "Open parent popover", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Local draft", exact: true });
  await draft.fill("Keep this draft");
  await draft.evaluate((node) =>
    node.addEventListener(
      "keydown",
      (event) => {
        if ((event as KeyboardEvent).key === "Escape") event.preventDefault();
      },
      { once: true },
    ),
  );
  await draft.press("Escape");
  await expect(page.locator("#escape-parent")).toBeVisible();
  await expect(page.locator("#escape-dialog")).toBeVisible();
  await expect(draft).toHaveValue("Keep this draft");
  await expect(draft).toBeFocused();
  await expect(page.locator("#escape-callbacks")).toHaveText("Parent 0 · Child 0");
  await draft.press("Escape");
  await expect(page.locator("#escape-parent")).toBeHidden();
  await expect(page.locator("#escape-dialog")).toBeVisible();
  await expect(page.locator("#escape-callbacks")).toHaveText("Parent 1 · Child 0");
  await page.keyboard.press("Escape");
  await expect(page.locator("#escape-dialog")).toBeHidden();
});

test("child stopPropagation leaves native Dialog cancellation distinct from Popover dismissal", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover-escape");
  await page.getByRole("button", { name: "Open popover dialog", exact: true }).click();
  await page.getByRole("button", { name: "Open parent popover", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Local draft", exact: true });
  await draft.evaluate((node) =>
    node.addEventListener("keydown", (event) => event.stopPropagation(), { once: true }),
  );
  await draft.press("Escape");
  await expect(page.locator("#escape-dialog")).toBeHidden();
  await expect(page.locator("#escape-callbacks")).toHaveText("Parent 0 · Child 0");
});

test("open shadow DOM children consume Escape before their original Popover layer", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator("#display-popover").evaluate((panel) => {
    const host = document.createElement("div");
    const root = panel.parentElement!;
    root.before(host);
    const shadow = host.attachShadow({ mode: "open" });
    for (const style of document.querySelectorAll("style, link[rel=stylesheet]"))
      shadow.append(style.cloneNode(true));
    shadow.append(root);
  });
  const trigger = page.getByRole("button", { name: "Display settings", exact: true });
  await trigger.click();
  const draft = page.getByRole("textbox", { name: "Display name" });
  await draft.fill("Shadow draft");
  await draft.evaluate((node) =>
    node.addEventListener("keydown", (event) => event.preventDefault(), { once: true }),
  );
  await draft.press("Escape");
  await expect(page.locator("#display-popover")).toBeVisible();
  await expect(draft).toBeFocused();
  await expect(draft).toHaveValue("Shadow draft");
  await draft.press("Escape");
  await expect(page.locator("#display-popover")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Escape safely closes after its connected trigger is removed by a child handler", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover");
  await page.getByRole("button", { name: "Display settings", exact: true }).click();
  const draft = page.getByRole("textbox", { name: "Display name" });
  await draft.evaluate((node) =>
    node.addEventListener(
      "keydown",
      () => document.getElementById("display-popover-trigger")!.remove(),
      { once: true },
    ),
  );
  await draft.press("Escape");
  await expect(page.locator("#display-popover")).toBeHidden();
  await expect(page.locator("#display-popover-trigger")).toHaveCount(0);
  await page.getByRole("button", { name: "Layered settings", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#pane-popover")).toBeHidden();
});

for (const [action, label] of [
  ["close", "Close child popover"],
  ["unmount", "Remove child popover"],
]) {
  test(`child DOM ${action} consumes only the original layer even when it unmounts`, async ({
    page,
  }) => {
    await page.goto("/canvas.html?story=popover-escape");
    await page.getByRole("button", { name: "Open popover dialog", exact: true }).click();
    await page.getByRole("button", { name: "Open parent popover", exact: true }).click();
    await page.getByRole("button", { name: "Open child popover", exact: true }).click();
    const button = page.getByRole("button", { name: label, exact: true });
    await button.evaluate((node) =>
      node.addEventListener(
        "keydown",
        (event) => {
          if ((event as KeyboardEvent).key === "Escape") (node as HTMLButtonElement).click();
        },
        { once: true },
      ),
    );
    await button.press("Escape");
    await expect(page.locator("#escape-child")).not.toBeVisible();
    if (action === "unmount") await expect(page.locator("#escape-child")).toHaveCount(0);
    await expect(page.locator("#escape-parent")).toBeVisible();
    await expect(page.locator("#escape-dialog")).toBeVisible();
    await expect(page.locator("#escape-callbacks")).toHaveText("Parent 0 · Child 0");
    await page.keyboard.press("Escape");
    await expect(page.locator("#escape-parent")).toBeHidden();
    await expect(page.locator("#escape-dialog")).toBeVisible();
  });
}

test("Escape returns its trigger after an unfocused pointer activation", async ({ page }) => {
  await page.goto("/canvas.html?story=popover");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Display settings", exact: true });
  await trigger.evaluate((node) => {
    node.addEventListener("mousedown", (event) => event.preventDefault());
  });
  await trigger.click();
  const panel = page.locator("#display-popover");
  await expect(panel).toBeVisible();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(panel).toBeVisible();
});

test("a callback that closes its original layer runs once and never dismisses its parent", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover-escape");
  await page.getByRole("button", { name: "Open popover dialog", exact: true }).click();
  await page.getByRole("button", { name: "Open parent popover", exact: true }).click();
  await page.getByRole("button", { name: "Open child popover", exact: true }).click();
  const action = page.getByRole("button", {
    name: "Close child popover via callback",
    exact: true,
  });
  await action.click();
  await action.press("Escape");
  await expect(page.locator("#escape-child")).toBeHidden();
  await expect(page.locator("#escape-parent")).toBeVisible();
  await expect(page.locator("#escape-dialog")).toBeVisible();
  await expect(page.locator("#escape-callbacks")).toHaveText("Parent 0 · Child 1");
});

test("Escape preserves controlled refusal and a close callback's external focus", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=popover");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const retained = page.getByRole("button", { name: "Keep controlled panel", exact: true });
  await retained.click();
  const input = page.getByRole("textbox", { name: "Retained panel draft", exact: true });
  await input.focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#retained-popover")).toBeVisible();
  await expect(input).toBeFocused();

  const redirected = page.getByRole("button", {
    name: "Continue external action after closing",
    exact: true,
  });
  await redirected.evaluate((node) => {
    node.addEventListener("mousedown", (event) => event.preventDefault());
  });
  await input.evaluate((node) => node.blur());
  await redirected.click();
  await expect(page.locator("#redirected-popover")).toBeVisible();
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#redirected-popover")).toBeHidden();
  await expect(page.getByRole("button", { name: "External action", exact: true })).toBeFocused();
});

test("short choices retain exact trigger matching without splitting short option names", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto("/canvas.html?story=choice-select-width");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.locator("#short-choice");
  await trigger.click();
  const panel = page.locator("#short-choice-panel");
  await expect(panel).toBeVisible();
  await expect
    .poll(async () => {
      const input = await trigger.boundingBox(),
        menu = await panel.boundingBox();
      return Math.abs(input!.width - menu!.width) < 1;
    })
    .toBe(true);
  const option = page.getByRole("option", { name: "First option", exact: true });
  expect(
    await option.evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node.firstChild!);
      return range.getClientRects().length;
    }),
  ).toBe(1);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const natural = page.locator("#natural-choice");
  await natural.click();
  const naturalWidth = (await page.locator("#natural-choice-panel").boundingBox())!.width;
  expect(naturalWidth).toBeGreaterThan((await natural.boundingBox())!.width);
  await page.keyboard.press("Escape");
  await expect(natural).toBeFocused();
});

test("choice sizing keeps a quickly focused last option visible after opening and viewport changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 330 });
  await page.goto("/canvas.html?story=choice-select");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.locator("#custom-delivery");
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  const last = page.getByRole("option", { name: "File into the project archive", exact: true });
  await expect(last).toBeFocused();
  const panel = page.locator("#custom-delivery-panel");
  const visible = async () => {
    const surface = await panel.boundingBox(),
      item = await last.boundingBox();
    return item!.y >= surface!.y - 1 && item!.y + item!.height <= surface!.y + surface!.height + 1;
  };
  await expect.poll(visible).toBe(true);
  await page.setViewportSize({ width: 390, height: 300 });
  await expect.poll(visible).toBe(true);
  await expect(last).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("File into the project archive");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("popover lets an inner pane handle Escape before dismissing", async ({ page }) => {
  await page.goto("/canvas.html?story=popover");
  const trigger = page.getByRole("button", { name: "Layered settings", exact: true });
  const panel = page.locator("#pane-popover");
  await trigger.click();
  await page.getByRole("button", { name: "Open details" }).click();
  await expect(panel.getByRole("heading")).toHaveText("Settings details");
  await page.keyboard.press("Escape");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading")).toHaveText("Choose settings");
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("searchable choice filters without changing selection and supports empty and keyboard paths", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=choice-select");
  const trigger = page.locator("#searchable-model");
  const panel = page.locator("#searchable-model-panel");
  const search = panel.getByRole("searchbox");
  await trigger.click();
  await expect(search).toBeFocused();
  await search.fill("sol");
  await expect(panel.getByRole("option")).toHaveCount(1);
  await expect(trigger).toHaveText("Follow the runner default");
  await search.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveText("Follow the runner default");
  await search.press("Enter");
  await expect(trigger).toContainText("gpt-6-sol");
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(search).toBeFocused();
  await search.fill("missing-model");
  await expect(panel.getByRole("status")).toHaveText("No matching options");
  await search.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(search).toHaveValue("");
  await search.fill("astra");
  await search.press("ArrowDown");
  await expect(panel.getByRole("option")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toContainText("gpt-6-astra");
});

test("popover dismisses the active layer and preserves normal keyboard focus", async ({ page }) => {
  await page.goto("/canvas.html?story=popover");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.getByRole("button", { name: "Display settings", exact: true });
  const panel = page.locator("#display-popover");
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("textbox", { name: "Display name" }).fill("Keep this name");
  const nestedTrigger = page.getByRole("button", { name: "More settings", exact: true });
  await nestedTrigger.click();
  await expect(page.locator("#nested-popover")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#nested-popover")).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(nestedTrigger).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole("textbox", { name: "Display name" })).toHaveValue("Keep this name");
  const outside = page.getByRole("button", { name: "External action", exact: true });
  await outside.click();
  await expect(panel).toBeHidden();
  await expect(outside).toBeFocused();
  await page.getByRole("button", { name: "Open controlled panel", exact: true }).click();
  await expect(page.locator("#controlled-popover")).toBeVisible();
  await page.getByRole("button", { name: "Close controlled panel", exact: true }).click();
  await expect(page.locator("#controlled-popover")).toBeHidden();
});

test("choice select supports keyboard selection, validation, form data and reset", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=choice-select");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const delivery = page.locator("#custom-delivery");
  const environment = page.locator("#custom-environment");
  const deliveryPanel = page.locator("#custom-delivery-panel");
  const environmentPanel = page.locator("#custom-environment-panel");
  await expect(page.locator("#custom-delivery-native")).toHaveValue("review");
  await expect(delivery).toContainText(
    "Hand to the project owner to review all changes and the verification record",
  );
  await delivery.focus();
  await page.keyboard.press("ArrowDown");
  await expect(deliveryPanel.getByRole("option").nth(1)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(deliveryPanel.getByRole("option").nth(3)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(deliveryPanel).toBeHidden();
  await expect(delivery).toBeFocused();
  await expect(page.locator("#custom-delivery-native")).toHaveValue("archived");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Home");
  await expect(deliveryPanel.getByRole("option").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(delivery).toBeFocused();
  await expect(page.locator("#custom-delivery-native")).toHaveValue("archived");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Tab");
  await expect(deliveryPanel).toBeHidden();
  await expect(environment).toBeFocused();

  const form = page.locator("form").filter({ has: delivery });
  await form.evaluate((element) => {
    element.addEventListener("submit", (event) => {
      event.preventDefault();
      element.setAttribute(
        "data-submitted",
        JSON.stringify(Object.fromEntries(new FormData(element as HTMLFormElement))),
      );
    });
  });
  await page.getByRole("button", { name: "Submit configuration", exact: true }).click();
  await expect(form).not.toHaveAttribute("data-submitted");
  await expect(environment).toBeFocused();
  await expect(environment).toHaveAttribute("aria-invalid", "true");
  await environment.click();
  await environmentPanel.getByRole("option").first().click();
  await expect(environment).toBeFocused();
  await page.getByRole("button", { name: "Submit configuration", exact: true }).click();
  expect(JSON.parse((await form.getAttribute("data-submitted"))!)).toEqual(
    await form.evaluate((element) => Object.fromEntries(new FormData(element as HTMLFormElement))),
  );
  const fields = JSON.parse((await form.getAttribute("data-submitted"))!);
  expect(Object.values(fields)).toEqual(expect.arrayContaining(["archived", "local"]));
  await page.getByRole("button", { name: "Restore defaults", exact: true }).click();
  await expect(page.locator("#custom-delivery-native")).toHaveValue("review");
  await expect(delivery).toContainText(
    "Hand to the project owner to review all changes and the verification record",
  );
  await expect(page.locator("#custom-environment-native")).toHaveValue("");
  await expect(environment).not.toHaveAttribute("aria-invalid", "true");
});

test("controlled choice retains the caller's current value across native form reset", async ({
  page,
}) => {
  await page.goto("/canvas.html?story=choice-select");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const control = page.locator("#custom-controlled");
  const native = page.locator("#custom-controlled-native");
  await expect(native).toHaveValue("draft");
  await control.click();
  await page.locator("#custom-controlled-panel").getByRole("option").nth(1).click();
  await expect(native).toHaveValue("review");
  const caption = await control.textContent();
  await page.getByRole("button", { name: "Restore defaults", exact: true }).click();
  await expect(native).toHaveValue("review");
  await expect(control).toHaveText(caption!);
  // Read after the native reset default action and the component's reconciliation.
  expect(
    await native.evaluate((element) =>
      new FormData((element as HTMLSelectElement).form!).get("controlled"),
    ),
  ).toBe("review");
});

test("choice popup remains within a narrow viewport and follows its trigger during scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 460 });
  await page.goto("/canvas.html?story=choice-select");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const trigger = page.locator("#custom-delivery");
  const panel = page.locator("#custom-delivery-panel");
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect
    .poll(async () =>
      panel.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return (
          bounds.left >= 0 &&
          bounds.right <= innerWidth + 1 &&
          bounds.top >= 0 &&
          bounds.bottom <= innerHeight + 1
        );
      }),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollBy(0, 60));
  await expect
    .poll(async () =>
      panel.evaluate((element) => {
        const anchor = document.getElementById("custom-delivery")!.getBoundingClientRect();
        const bounds = element.getBoundingClientRect();
        const gap = Math.min(
          Math.abs(bounds.top - anchor.bottom),
          Math.abs(anchor.top - bounds.bottom),
        );
        return gap < 24 && bounds.left >= 0 && bounds.right <= innerWidth + 1;
      }),
    )
    .toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
