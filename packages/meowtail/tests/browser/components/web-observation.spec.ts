import { expect, test, type Page } from "@playwright/test";

type Fixture = {
  read(): {
    a: number;
    b: number;
    host: number;
    emptySourceSize: number;
    sameA: boolean;
    sameB: boolean;
    nodesA: string[];
    nodesB: string[];
  };
  remember(): void;
  append(): void;
  changeNeighbor(): void;
  removeA(): void;
  stopHost(): void;
};
async function action(page: Page, method: Exclude<keyof Fixture, "read">) {
  await page.evaluate(
    (method) =>
      (window as unknown as { skeletonObservationFixture: Fixture }).skeletonObservationFixture[
        method
      ](),
    method,
  );
}
async function read(page: Page) {
  return page.evaluate(() =>
    (
      window as unknown as { skeletonObservationFixture: Fixture }
    ).skeletonObservationFixture.read(),
  );
}
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}
async function open(page: Page) {
  await page.goto("/canvas.html?story=web-observation");
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await settle(page);
}

test("observation Provider belongs to its renderer even when runtime is shared", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator("#panel-a")).toHaveAttribute("data-source", "a");
  await expect(page.locator("#panel-b")).toHaveAttribute("data-source", "b");
  await expect(page.locator("#panel-plain")).toHaveAttribute("data-source", "none");
  const state = await read(page);
  expect(state.nodesA).toContain("panel-a");
  expect(state.nodesA).not.toContain("panel-b");
  expect(state.nodesB).toContain("panel-b");
  expect(state.nodesB).not.toContain("panel-a");
  await action(page, "remember");
  await action(page, "removeA");
  await settle(page);
  expect((await read(page)).nodesA).toEqual([]);
  expect((await read(page)).sameB).toBe(true);
  await expect(page.locator("#panel-b")).toBeVisible();
});

test("renderer notifications refresh skeletons without MutationObserver or ResizeObserver fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class DisabledObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, "MutationObserver", { value: DisabledObserver });
    Object.defineProperty(window, "ResizeObserver", { value: DisabledObserver });
  });
  await open(page);
  const before = await read(page);
  await action(page, "remember");
  await action(page, "append");
  await expect(page.locator("#source-added")).toHaveText("New signal content");
  await expect.poll(async () => (await read(page)).a).toBe(before.a + 1);
  expect((await read(page)).sameA).toBe(false);
  expect((await read(page)).sameB).toBe(true);
  await action(page, "remember");
  await action(page, "changeNeighbor");
  await expect(page.locator("#neighbor")).toHaveText("Updated unrelated branch");
  await settle(page);
  expect((await read(page)).sameA).toBe(true);
});

test("external DOM and surface changes still refresh only their relevant skeleton scope", async ({
  page,
}) => {
  await open(page);
  await action(page, "remember");
  await action(page, "changeNeighbor");
  await settle(page);
  expect((await read(page)).sameA).toBe(true);
  const before = await read(page);
  await page.locator("#panel-a").evaluate((element) => {
    const text = document.createElement("p");
    text.textContent = "External DOM content";
    element.append(text);
    (element as HTMLElement).style.backgroundColor = "#222";
    (element as HTMLElement).style.color = "#eee";
  });
  await expect.poll(async () => (await read(page)).a).toBe(before.a + 1);
  expect((await read(page)).sameA).toBe(false);
  expect((await read(page)).sameB).toBe(true);
});

test("an empty observation source preserves pure host scope discovery", async ({ page }) => {
  await open(page);
  expect((await read(page)).emptySourceSize).toBe(0);
  expect((await read(page)).host).toBeGreaterThan(0);
  const skeleton = await page.locator("#host-text").screenshot();
  await action(page, "stopHost");
  expect((await page.locator("#host-text").screenshot()).equals(skeleton)).toBe(false);
  await expect(page.locator("#host-text")).toHaveText("Pure host text without component ownership");
});
