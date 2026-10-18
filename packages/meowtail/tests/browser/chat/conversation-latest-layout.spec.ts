import { expect, test, type Locator } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const phase = process.env.LATEST_REVIEW_PHASE === "before" ? "before" : "after";
const directory = resolve(import.meta.dir, "../../../../../artifacts/chat-latest-review");

async function overlapsText(viewport: Locator, latest: Locator) {
  const button = await latest.elementHandle();
  return viewport.evaluate((element, button) => {
    if (!button) throw new Error("Latest action is missing");
    const viewport = element.getBoundingClientRect();
    const action = button.getBoundingClientRect();
    const intersections = [];
    for (const paragraph of element.querySelectorAll("p")) {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const line of range.getClientRects()) {
          const left = Math.max(line.left, viewport.left, action.left);
          const right = Math.min(line.right, viewport.right, action.right);
          const top = Math.max(line.top, viewport.top, action.top);
          const bottom = Math.min(line.bottom, viewport.bottom, action.bottom);
          if (right - left > 1 && bottom - top > 1)
            intersections.push({ width: right - left, height: bottom - top });
        }
      }
    }
    return {
      intersections,
      viewport: { x: viewport.x, y: viewport.y, width: viewport.width, height: viewport.height },
      button: { x: action.x, y: action.y, width: action.width, height: action.height },
    };
  }, button);
}

async function stableVisibility(action: Locator, hidden: boolean) {
  const states = await action.evaluate(async (element) => {
    const states = [];
    for (let frame = 0; frame < 12; frame++) {
      await new Promise<void>((done) => requestAnimationFrame(() => done()));
      states.push(element.closest("[hidden]") !== null);
    }
    return states;
  });
  expect(states.every((state) => state === hidden)).toBe(true);
}

for (const width of [375, 900]) {
  for (const mode of ["fragment", "complete"]) {
    test(`${mode} latest keeps visible text readable and returns by keyboard at ${width}px`, async ({
      page,
    }) => {
      await mkdir(directory, { recursive: true });
      await page.setViewportSize({ width, height: 667 });
      await page.goto(`/canvas.html?story=conversation-latest-${mode}`);
      await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
      const viewport = page.getByRole("region", { name: "Latest reading viewport", exact: true });
      const latest = page.getByRole("button", {
        name: "Return to latest",
        exact: true,
        includeHidden: true,
      });
      const distance = () =>
        viewport.evaluate(
          (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
        );
      await expect.poll(distance).toBeLessThan(2);
      await viewport.evaluate((element) => {
        element.scrollTop = 220;
      });
      await expect(latest).toBeVisible();
      await stableVisibility(latest, false);
      const geometry = await overlapsText(viewport, latest);
      await page.screenshot({
        path: resolve(directory, `${phase}-${mode}-${width}.png`),
        animations: "disabled",
      });
      await writeFile(
        resolve(directory, `${phase}-${mode}-${width}.json`),
        JSON.stringify(geometry, null, 2),
      );
      expect(geometry.intersections).toEqual([]);
      for (const key of ["Enter", "Space"]) {
        await latest.focus();
        await latest.press(key);
        await expect.poll(distance).toBeLessThan(2);
        await expect(viewport).toBeFocused();
        await expect(latest).toBeHidden();
        await stableVisibility(latest, true);
        if (key === "Enter") {
          await viewport.evaluate((element) => {
            element.scrollTop = 220;
          });
          await expect(latest).toBeVisible();
        }
      }
      if (mode === "complete") {
        for (const gap of [20, 28]) {
          await viewport.evaluate((element, gap) => {
            element.scrollTop = element.scrollHeight - element.clientHeight - gap;
          }, gap);
          if (gap <= 24) await expect(latest).toBeHidden();
          else await expect(latest).toBeVisible();
          await stableVisibility(latest, gap <= 24);
        }
        await latest.click();
        await page.getByRole("button", { name: "Append output", exact: true }).click();
        await expect.poll(distance).toBeLessThan(2);
        await viewport.evaluate((element) => {
          element.scrollTop = 220;
        });
        await expect(latest).toBeVisible();
        const top = await viewport.evaluate((element) => element.scrollTop);
        await page.getByRole("button", { name: "Append output", exact: true }).click();
        await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBe(top);
        await page.locator("[data-latest-frame]").evaluate((element) => {
          (element as HTMLElement).style.height = "260px";
        });
        await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBe(top);
        await stableVisibility(latest, false);
        expect((await overlapsText(viewport, latest)).intersections).toEqual([]);
      }
      await page.locator("[data-latest-frame]").evaluate((element) => {
        (element as HTMLElement).style.height = "260px";
      });
      await page.setViewportSize({ width, height: 500 });
      await viewport.evaluate((element) => {
        element.scrollTop = 220;
      });
      await expect(latest).toBeInViewport();
      await stableVisibility(latest, false);
      const shortGeometry = await overlapsText(viewport, latest);
      expect(shortGeometry.intersections).toEqual([]);
      await page.screenshot({
        path: resolve(directory, `${phase}-${mode}-${width}-short.png`),
        animations: "disabled",
      });
      await writeFile(
        resolve(directory, `${phase}-${mode}-${width}-short.json`),
        JSON.stringify(shortGeometry, null, 2),
      );
    });
  }
}

for (const width of [375, 900]) {
  test(`Assistant latest keeps real text readable, preserves history and returns by keyboard at ${width}px`, async ({
    page,
  }) => {
    await mkdir(directory, { recursive: true });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/canvas.html?story=assistant-complete");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const viewport = page.locator('[data-meowui-part="assistant-view/viewport"]');
    const latest = page.getByRole("button", {
      name: "Back to latest",
      exact: true,
      includeHidden: true,
    });
    const distance = () =>
      viewport.evaluate(
        (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
      );
    await expect.poll(distance).toBeLessThan(2);
    await viewport.evaluate((element) => {
      element.scrollTop = 220;
    });
    await expect(latest).toBeVisible();
    await stableVisibility(latest, false);
    const samples = [];
    for (const readingTop of [80, 140, 220, 300]) {
      await viewport.evaluate((element, top) => {
        element.scrollTop = top;
      }, readingTop);
      await stableVisibility(latest, false);
      samples.push(await overlapsText(viewport, latest));
    }
    const geometry = samples.find((sample) => sample.intersections.length > 0) ?? samples.at(-1)!;
    if (geometry.intersections.length > 0) {
      await viewport.evaluate((element, top) => {
        element.scrollTop = top;
      }, [80, 140, 220, 300][samples.indexOf(geometry)]!);
    }
    await page.screenshot({
      path: resolve(directory, `${phase}-assistant-${width}.png`),
      animations: "disabled",
    });
    await writeFile(
      resolve(directory, `${phase}-assistant-${width}.json`),
      JSON.stringify(geometry, null, 2),
    );
    expect(geometry.intersections).toEqual([]);
    const top = await viewport.evaluate((element) => element.scrollTop);
    const draft = page.getByRole("textbox", { name: "Message", exact: true });
    const draftValue = await draft.inputValue();
    await draft.focus();
    // A host update can arrive while the user is editing; it must not move focus.
    await page
      .getByRole("button", { name: "Append result", exact: true })
      .evaluate((button: HTMLButtonElement) => button.click());
    await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBe(top);
    await expect(draft).toBeFocused();
    await page.setViewportSize({ width, height: 500 });
    await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBe(top);
    await stableVisibility(latest, false);
    await expect(draft).toBeFocused();
    await expect(draft).toHaveValue(draftValue);
    await expect(latest).toBeInViewport();
    await page.screenshot({
      path: resolve(directory, `${phase}-assistant-${width}-short.png`),
      animations: "disabled",
    });
    const shortGeometry = await overlapsText(viewport, latest);
    await writeFile(
      resolve(directory, `${phase}-assistant-${width}-short.json`),
      JSON.stringify(shortGeometry, null, 2),
    );
    expect(shortGeometry.intersections).toEqual([]);
    for (const key of ["Enter", "Space"]) {
      await latest.focus();
      await latest.press(key);
      await expect.poll(distance).toBeLessThan(2);
      await expect(viewport).toBeFocused();
      await expect(latest).toBeHidden();
      await stableVisibility(latest, true);
      if (key === "Enter") {
        await viewport.evaluate((element) => {
          element.scrollTop = 220;
        });
        await expect(latest).toBeVisible();
      }
    }
    await page.getByRole("button", { name: "Append result", exact: true }).click();
    await expect.poll(distance).toBeLessThan(2);
  });
}

for (const width of [375, 900]) {
  test(`Latest label wraps inside its public container at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 667 });
    await page.goto("/canvas.html?story=conversation-latest-long-label");
    await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
    const viewport = page.getByRole("region", { name: "Latest reading viewport", exact: true });
    await viewport.evaluate((element) => {
      element.scrollTop = 220;
    });
    const latest = page.getByRole("button", {
      name: "Return to the latest confirmed response and continue reading",
      exact: true,
    });
    await expect(latest).toBeVisible();
    const bounds = await page.locator("[data-latest-frame]").evaluate((frame) => {
      const root = frame.getBoundingClientRect();
      const action = frame.querySelector("button")!.getBoundingClientRect();
      return {
        left: action.left - root.left,
        right: root.right - action.right,
        overflow: frame.scrollWidth - frame.clientWidth,
      };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(-1);
    expect(bounds.right).toBeGreaterThanOrEqual(-1);
    expect(bounds.overflow).toBeLessThanOrEqual(1);
  });
}
