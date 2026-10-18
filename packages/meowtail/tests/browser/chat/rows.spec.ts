import { expect, test, type Locator, type Page } from "@playwright/test";

const toolCallPart = '[data-meowui-part="chat-tool-call/root"]';
const part = (name: string) => `[data-meowui-part="${name}"]`;

/** The composition story, with its process group open so its tool rows are laid out. */
async function openComposition(page: Page): Promise<void> {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-message-composition");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator(part("chat-process/summary")).first().click();
  await expect(page.locator(part("chat-tool-call/root")).first()).toBeVisible();
}

/** The tool story folds its first process group; open it so its rows are laid out and measurable. */
async function openFirstProcess(page: Page): Promise<void> {
  await page.locator(part("chat-process/summary")).first().click();
  await expect(page.locator(toolCallPart).first()).toBeVisible();
}

/** The row metrics every disclosure row shares, read from the painted boxes and line boxes. */
async function readRow(page: Page) {
  return page.evaluate(() => {
    const query = (name: string) => document.querySelector(`[data-meowui-part="${name}"]`)!;
    const round = (value: number) => Math.round(value * 100) / 100;
    const centre = (element: Element) => {
      const box = element.getBoundingClientRect();
      return round(box.top + box.height / 2);
    };
    const row = (name: string) => {
      const element = query(name);
      const style = getComputedStyle(element);
      return {
        minHeight: style.minHeight,
        lineHeight: style.lineHeight,
        fontSize: style.fontSize,
        gap: style.gap,
        boxHeight: round(element.getBoundingClientRect().height),
      };
    };
    const leading = (rootName: string, iconName: string) => {
      const icon = query(rootName).querySelector(`[data-meowui-part="${iconName}"]`)!;
      // Layout metrics from the CSS edge: an opening group rotates its glyph, and a painted
      // box mid-transition would report the rotation rather than the size the row reserves.
      return {
        box: Number.parseFloat(getComputedStyle(icon).width),
        glyph: Number.parseFloat(getComputedStyle(icon.querySelector("svg")!).width),
      };
    };
    const call = query("chat-tool-call/root");
    const callLeft = call.getBoundingClientRect().left;
    return {
      process: row("chat-process/summary"),
      toolCall: row("chat-tool-call/header"),
      sources: row("chat-sources/summary"),
      leading: {
        process: leading("chat-process/summary", "chat-process/icon"),
        toolCall: leading("chat-tool-call/root", "chat-tool-call/icon"),
        sources: leading("chat-sources/summary", "chat-sources/icon"),
      },
      alignment: {
        labelOffset: round(
          call.querySelector('[data-meowui-part="chat-tool-call/label"]')!.getBoundingClientRect()
            .left - callLeft,
        ),
        detailIndent: (() => {
          const detail = call.querySelector('[data-meowui-part="chat-tool-call/detail"]')!;
          return round(
            detail.getBoundingClientRect().left -
              callLeft +
              Number.parseFloat(getComputedStyle(detail).paddingLeft),
          );
        })(),
        centres: [
          centre(call.querySelector('[data-meowui-part="chat-tool-call/header"]')!),
          centre(call.querySelector('[data-meowui-part="chat-tool-call/icon"]')!),
          centre(call.querySelector('[data-meowui-part="chat-tool-call/chevron"]')!),
        ],
      },
    };
  });
}

/** Distance between each pair of neighbouring rows, read from the painted boxes. */
async function rowPitch(list: Locator): Promise<number[]> {
  const boxes = await list.evaluate((root) =>
    Array.from(root.querySelectorAll('[data-meowui-part="chat-message-list/item"]'), (item) => {
      const box = item.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom };
    }),
  );
  return boxes
    .slice(1)
    .map((box, index) => Math.round((box.top - boxes[index]!.bottom) * 100) / 100);
}

test("list rows keep their own pitch whether or not the host wraps them", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-message-rows");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const direct = await rowPitch(page.getByRole("log", { name: "直接子项的消息列表" }));
  const wrapped = await rowPitch(page.getByRole("log", { name: "逐条挂载的消息列表" }));
  expect(wrapped).toEqual(direct);
  // A new turn, a continued reply, and the work a row reports on keep distinct spacing.
  expect(direct[0]).toBeGreaterThan(direct[1]!);
  expect(direct[1]).toBeGreaterThan(direct[2]!);
  expect(direct[2]).toBeGreaterThan(0);
});

test("the first row takes the list inset instead of a row pitch", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-message-rows");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const list = page.getByRole("log", { name: "逐条挂载的消息列表" });
  const offset = await list.evaluate((root) => {
    const content = root.querySelector('[data-meowui-part="chat-message-list/content"]')!;
    const item = root.querySelector('[data-meowui-part="chat-message-list/item"]')!;
    return item.getBoundingClientRect().top - content.getBoundingClientRect().top;
  });
  expect(offset).toBe(0);
});

test("every disclosure row is measured by the same numbers", async ({ page }) => {
  await openComposition(page);
  // Compared off the default scale, where a row that kept its own fixed numbers would diverge.
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.setProperty("--chat-font-body", "17px");
  });
  const row = await readRow(page);
  for (const name of ["toolCall", "sources"] as const) {
    expect(row[name].minHeight).toBe(row.process.minHeight);
    expect(row[name].lineHeight).toBe(row.process.lineHeight);
    expect(row[name].fontSize).toBe(row.process.fontSize);
    expect(row[name].gap).toBe(row.process.gap);
    expect(row[name].boxHeight).toBe(row.process.boxHeight);
  }
  for (const name of ["toolCall", "sources"] as const) {
    expect(row.leading[name].box).toBe(row.leading.process.box);
    expect(row.leading[name].glyph).toBe(row.leading.process.glyph);
  }
  expect(row.leading.toolCall.glyph).toBeLessThan(row.leading.toolCall.box);
});

test("a group's rows hang under its label, at any chat type scale", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-sequence");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.locator(part("chat-process/summary")).first().click();
  await expect(page.locator(part("chat-tool-call/root")).first()).toBeVisible();
  const read = () =>
    page.evaluate(() => {
      const query = (name: string) => document.querySelector(`[data-meowui-part="${name}"]`)!;
      const group = query("chat-process/root");
      const body = group.querySelector('[data-meowui-part="chat-process/body"]')!;
      const row = body.querySelector('[data-meowui-part="chat-tool-call/root"]')!;
      const left = group.getBoundingClientRect().left;
      const offset = (element: Element) =>
        Math.round((element.getBoundingClientRect().left - left) * 100) / 100;
      return {
        label: offset(group.querySelector('[data-meowui-part="chat-process/label"]')!),
        indent: Number.parseFloat(getComputedStyle(body).paddingInlineStart),
        childIcon: offset(row.querySelector('[data-meowui-part="chat-tool-call/icon"]')!),
      };
    });
  const before = await read();
  expect(before.indent).toBeCloseTo(before.label, 0);
  expect(before.childIcon).toBeCloseTo(before.label, 0);
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.setProperty("--chat-font-body", "17px");
  });
  const after = await read();
  expect(after.indent).toBeGreaterThan(before.indent);
  expect(after.childIcon).toBeCloseTo(after.label, 0);
});

test("a group keeps the same step before its rows as a row keeps before its body", async ({
  page,
}) => {
  await openComposition(page);
  const call = page
    .locator(`${toolCallPart}:has([data-meowui-part="chat-tool-call/detail"])`)
    .first();
  await call.locator("summary").click();
  await expect(call).toHaveAttribute("open", "");
  const steps = await page.evaluate(() => {
    const query = (name: string) => document.querySelector(`[data-meowui-part="${name}"]`)!;
    const group = query("chat-process/body");
    const call = query("chat-tool-call/root");
    return {
      groupBeforeRows: Number.parseFloat(getComputedStyle(group).paddingTop),
      rowBeforeBody: Number.parseFloat(
        getComputedStyle(call.querySelector('[data-meowui-part="chat-tool-call/body"]')!).marginTop,
      ),
    };
  });
  expect(steps.groupBeforeRows).toBeGreaterThan(0);
  expect(steps.groupBeforeRows).toBe(steps.rowBeforeBody);
});

test("the row boxes ride the chat type scale", async ({ page }) => {
  await openComposition(page);
  const expanded = page
    .locator(`${toolCallPart}:has([data-meowui-part="chat-tool-call/detail"])`)
    .first();
  await expanded.locator("summary").click();
  await expect(expanded).toHaveAttribute("open", "");
  const before = await readRow(page);
  expect(before.alignment.detailIndent).toBeCloseTo(before.alignment.labelOffset, 0);
  expect(before.alignment.centres[1]).toBeCloseTo(before.alignment.centres[0], 0);
  expect(before.alignment.centres[2]).toBeCloseTo(before.alignment.centres[0], 0);
  await page.locator("#story-root").evaluate((root) => {
    (root as HTMLElement).style.setProperty("--chat-font-body", "17px");
  });
  const after = await readRow(page);
  for (const name of ["process", "toolCall", "sources"] as const) {
    expect(Number.parseFloat(after[name].lineHeight)).toBeGreaterThan(
      Number.parseFloat(before[name].lineHeight),
    );
  }
  expect(after.toolCall.fontSize).not.toBe(before.toolCall.fontSize);
  // The leading box, the glyph and the indent move with the text instead of staying behind.
  expect(after.leading.toolCall.box - before.leading.toolCall.box).toBeCloseTo(
    after.leading.toolCall.glyph - before.leading.toolCall.glyph,
    0,
  );
  expect(after.alignment.detailIndent).toBeCloseTo(after.alignment.labelOffset, 0);
  expect(after.alignment.centres[1]).toBeCloseTo(after.alignment.centres[0], 0);
  expect(after.alignment.centres[2]).toBeCloseTo(after.alignment.centres[0], 0);
});

test.describe("a coarse pointer raises the row", () => {
  // Pixel 7 geometry without its defaultBrowserType, which a describe group cannot set.
  test.use({
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.625,
    hasTouch: true,
    isMobile: true,
  });

  test("the raised multiline row aligns its glyph and chevron with the first text line", async ({
    page,
  }) => {
    await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-sequence");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    await openFirstProcess(page);
    const row = page.locator(toolCallPart).first();
    expect(
      await row.evaluate((root) => root.querySelector("summary")!.clientHeight),
    ).toBeGreaterThan(24);
    const centres = await row.evaluate((root) => {
      const centre = (part: string) => {
        const box = root.querySelector(part)!.getBoundingClientRect();
        return box.top + box.height / 2;
      };
      const header = root.querySelector('[data-meowui-part="chat-tool-call/header"]')!;
      const label = root.querySelector('[data-meowui-part="chat-tool-call/label"]')!;
      const target = root.querySelector('[data-meowui-part="chat-tool-call/summary"]')!;
      const labelBox = label.getBoundingClientRect();
      return {
        // A narrow row stacks its target below the action; the leading glyph still identifies
        // the first action line, rather than the centre of the whole multiline header.
        firstLine: labelBox.top + Number.parseFloat(getComputedStyle(label).lineHeight) / 2,
        labelBottom: labelBox.bottom,
        targetTop: target.getBoundingClientRect().top,
        targetBottom: target.getBoundingClientRect().bottom,
        headerBottom: header.getBoundingClientRect().bottom,
        icon: centre('[data-meowui-part="chat-tool-call/icon"]'),
        chevron: centre('[data-meowui-part="chat-tool-call/chevron"]'),
      };
    });
    expect(centres.icon).toBeCloseTo(centres.firstLine, 0);
    expect(centres.chevron).toBeCloseTo(centres.icon, 0);
    expect(centres.targetTop).toBeGreaterThanOrEqual(centres.labelBottom - 1);
    expect(centres.targetBottom).toBeLessThanOrEqual(centres.headerBottom + 1);
  });
});

test("a process row centres its glyph in the leading box, as a tool row does", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-sequence");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const centres = await page
    .locator('[data-meowui-part="chat-process/summary"]')
    .first()
    .evaluate((summary) => {
      const icon = summary.querySelector('[data-meowui-part="chat-process/icon"]')!;
      const glyph = icon.querySelector("svg")!;
      const box = icon.getBoundingClientRect();
      const svg = glyph.getBoundingClientRect();
      return { box: box.top + box.height / 2, glyph: svg.top + svg.height / 2 };
    });
  expect(centres.glyph).toBeCloseTo(centres.box, 0);
});

test("a completed row keeps its default outcome out of the reading column", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-sequence");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await openFirstProcess(page);
  const row = page.locator(toolCallPart).first();
  const geometry = await row.evaluate((root) => {
    const summary = root.querySelector('[data-meowui-part="chat-tool-call/summary"]')!;
    const status = root.querySelector('[data-meowui-part="chat-tool-call/status"]')!;
    return {
      quiet: root.getAttribute("data-tool-default-complete"),
      placed: getComputedStyle(status).position,
      summaryRight: summary.getBoundingClientRect().right,
      rowRight: root.getBoundingClientRect().right,
    };
  });
  expect(geometry.quiet).toBe("true");
  expect(geometry.placed).toBe("absolute");
  expect(geometry.summaryRight).toBeCloseTo(geometry.rowRight, 0);
});

test("an activating row is one focus stop with the same row geometry", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-call-action");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const buttons = page.locator(
    `${toolCallPart} > button[data-meowui-part="chat-tool-call/header"]`,
  );
  await expect(buttons).toHaveCount(1);
  const geometry = await page.evaluate(() => {
    const measure = (root: Element) => {
      const header = root.querySelector('[data-meowui-part="chat-tool-call/header"]')!;
      const icon = root.querySelector('[data-meowui-part="chat-tool-call/icon"]')!;
      const style = getComputedStyle(header);
      return {
        line: style.lineHeight,
        font: style.fontSize,
        gap: style.gap,
        box: getComputedStyle(icon).width,
        glyph: getComputedStyle(icon.querySelector("svg")!).width,
        labelOffset:
          Math.round(
            (root
              .querySelector('[data-meowui-part="chat-tool-call/label"]')!
              .getBoundingClientRect().left -
              root.getBoundingClientRect().left) *
              100,
          ) / 100,
      };
    };
    const rows = Array.from(document.querySelectorAll('[data-meowui-part="chat-tool-call/root"]'));
    return { action: measure(rows[0]!), reveal: measure(rows[1]!) };
  });
  expect(geometry.action).toEqual(geometry.reveal);
  // The activating row holds no body of its own, and the host's action runs instead.
  await expect(page.locator(`${toolCallPart}[data-tool-action="demo"] details`)).toHaveCount(0);
  const feedback = page.locator("[data-tool-action-result]");
  await expect(feedback).toHaveText("尚未激活");
  await buttons.click();
  await expect(feedback).toHaveText("已激活：由宿主打开这次命令的记录。");
});

test("a row carries its state in the leading glyph as well as its status", async ({ page }) => {
  await page.goto("http://127.0.0.1:13007/canvas.html?story=chat-tool-call-action");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  const colours = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-meowui-part="chat-tool-call/root"]'));
    const read = (root: Element) => {
      const icon = root.querySelector('[data-meowui-part="chat-tool-call/icon"] svg')!;
      const status = root.querySelector('[data-meowui-part="chat-tool-call/status"]')!;
      return {
        state: root.getAttribute("data-tool-state"),
        glyph: getComputedStyle(icon).color,
        status: getComputedStyle(status).color,
      };
    };
    return rows.map(read);
  });
  const complete = colours.find((row) => row.state === "complete")!;
  const failed = colours.find((row) => row.state === "error")!;
  expect(failed.glyph).not.toBe(complete.glyph);
  expect(failed.glyph).toBe(failed.status);
});
