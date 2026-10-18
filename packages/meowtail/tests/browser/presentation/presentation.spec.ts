import { expect, test, type Page } from "@playwright/test";

async function facts(page: Page, instance = 0) {
  return page.evaluate((index) => window.presentationTest.facts(index), instance);
}

async function jump(page: Page, slideId: string, step = 0, instance = 0) {
  await page.evaluate(({ index, position }) => window.presentationTest.jump(index, position), {
    index: instance,
    position: { slideId, step },
  });
}

async function stableTickCount(page: Page, nested = false) {
  return page.evaluate(async (inner) => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const before = window.presentationTest.facts(0)[inner ? "nestedTicks" : "ticks"];
    // This interval checks absence of recurring work, rather than waiting for UI readiness.
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { before, after: window.presentationTest.facts(0)[inner ? "nestedTicks" : "ticks"] };
  }, nested);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "First test deck", exact: true })).toBeVisible();
});

test("navigation keeps host experiments, direct steps and separate instances coherent", async ({
  page,
}) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  const second = page.getByRole("region", { name: "Second test deck", exact: true });
  const slider = first.getByRole("slider", { name: "Network speed" });
  await slider.fill("71");
  await expect(first.getByLabel("Experiment result")).toHaveText("Speed 71");
  await expect(second.getByLabel("Experiment result")).toHaveText("Speed 30");
  await first.getByRole("button", { name: "Next", exact: true }).click();
  await first.getByRole("button", { name: "Next", exact: true }).click();
  expect((await facts(page)).renders.experiment).toBe(1);
  await expect(first.getByRole("button", { name: "Revealed action", exact: true })).toBeVisible();
  await first.getByRole("button", { name: "Visit discussion" }).click();
  await expect(first.getByLabel("Shared result")).toHaveText("Speed 71");
  await first.getByRole("button", { name: "Return to experiment" }).click();
  await expect(slider).toHaveValue("71");
  expect((await facts(page)).renders.experiment).toBe(2);
  await jump(page, "experiment", 3);
  await expect(first.getByRole("button", { name: "Nested action" })).toBeVisible();
  await expect(first.getByLabel("Current step")).toHaveText("3");
  await first.getByRole("button", { name: "Next", exact: true }).click();
  await expect(first.locator('[data-fixture-slide="media"]')).toBeVisible();
  await first.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(first.getByLabel("Current step")).toHaveText("3");
  await expect(second.getByLabel("Current step")).toHaveText("0");
  await expect(second.getByRole("button", { name: "Previous", exact: true })).toBeDisabled();
});

test("range and consumed keys stay local while stage navigation changes steps", async ({
  page,
}) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  const slider = first.getByRole("slider", { name: "Network speed" });
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("31");
  expect((await facts(page)).position.step).toBe(0);
  await first.focus();
  await first.press("ArrowRight");
  await expect(first.getByLabel("Current step")).toHaveText("1");
});

test("nested Reveal respects ancestor visibility, accessibility, focus and activity", async ({
  page,
}) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  await jump(page, "experiment", 1);
  await expect(first.getByRole("button", { name: "Nested action" })).toHaveCount(0);
  await expect(
    first.getByRole("button", { name: "Nested action", includeHidden: true }),
  ).toBeHidden();
  const hiddenTicks = await stableTickCount(page, true);
  expect(hiddenTicks.after).toBe(hiddenTicks.before);
  await jump(page, "experiment", 3);
  const action = first.getByRole("button", { name: "Nested action" });
  await expect(action).toBeVisible();
  await expect.poll(async () => (await facts(page)).nestedTicks).toBeGreaterThan(0);
  await action.focus();
  await jump(page, "experiment", 1);
  await expect(first.getByRole("heading", { name: "First test deck", exact: true })).toBeFocused();
  await expect(first.getByRole("button", { name: "Nested action" })).toHaveCount(0);
  const stoppedTicks = await stableTickCount(page, true);
  expect(stoppedTicks.after).toBe(stoppedTicks.before);
});

test("host permission and user pause stop recurring work without unmounting or changing experiments", async ({
  page,
}) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  await expect.poll(async () => (await facts(page)).ticks).toBeGreaterThan(1);
  await page.evaluate(() => window.presentationTest.allow(0, false));
  let stopped = await stableTickCount(page);
  expect(stopped.after).toBe(stopped.before);
  expect((await facts(page)).renders.experiment).toBe(1);
  await page.evaluate(() => window.presentationTest.allow(0, true));
  await expect.poll(async () => (await facts(page)).ticks).toBeGreaterThan(stopped.after);
  await first.getByRole("button", { name: "Presentation options", exact: true }).click();
  await first.getByRole("button", { name: "Pause effects", exact: true }).click();
  stopped = await stableTickCount(page);
  expect(stopped.after).toBe(stopped.before);
  await first.getByRole("button", { name: "Resume effects", exact: true }).click();
  await expect.poll(async () => (await facts(page)).ticks).toBeGreaterThan(stopped.after);
  await jump(page, "discussion");
  stopped = await stableTickCount(page);
  expect(stopped.after).toBe(stopped.before);
  expect((await facts(page)).disposed).toBeGreaterThan(0);
});

test("a background review starts stopped, and disposal releases live callbacks", async ({
  page,
}) => {
  await page.goto("/?active=false");
  const stopped = await stableTickCount(page);
  expect(stopped).toEqual({ before: 0, after: 0 });
  await page.evaluate(() => window.presentationTest.allow(0, true));
  await expect.poll(async () => (await facts(page)).ticks).toBeGreaterThan(0);
  await page.evaluate(() => window.presentationTest.dispose());
  await expect(page.getByRole("region")).toHaveCount(0);
  const released = await stableTickCount(page);
  expect(released.after).toBe(released.before);
});

test("native media refs and events preserve time without replaying on return or ended navigation", async ({
  page,
}) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  await jump(page, "media");
  const video = first.locator("video");
  await expect
    .poll(async () => video.evaluate((element: HTMLMediaElement) => element.readyState))
    .toBeGreaterThan(0);
  expect((await facts(page)).refs).toContain("VIDEO");
  expect((await facts(page)).events).toContain("metadata:VIDEO");
  await video.evaluate(async (element: HTMLMediaElement) => {
    element.muted = true;
    element.currentTime = 1;
    await element.play();
  });
  await expect
    .poll(async () => video.evaluate((element: HTMLMediaElement) => element.currentTime))
    .toBeGreaterThan(1.05);
  await first.getByRole("button", { name: "Visit discussion" }).click();
  expect((await facts(page)).refs).toContain("released");
  const saved = (await facts(page)).nativeTime;
  expect(saved).toBeGreaterThan(1);
  await first.getByRole("button", { name: "Return to media" }).click();
  await expect
    .poll(async () => video.evaluate((element: HTMLMediaElement) => element.currentTime))
    .toBeCloseTo(saved, 1);
  expect(await video.evaluate((element: HTMLMediaElement) => element.paused)).toBe(true);
  await video.evaluate(async (element: HTMLMediaElement) => {
    element.muted = true;
    element.currentTime = element.duration - 0.08;
    await element.play();
  });
  await expect
    .poll(async () => video.evaluate((element: HTMLMediaElement) => element.ended))
    .toBe(true);
  expect((await facts(page)).position.slideId).toBe("media");
  expect((await facts(page)).events).toContain("ended");
});

test("real audio stops on host and document hiding and never resumes itself", async ({ page }) => {
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  const audio = first.locator("audio");
  await audio.evaluate(async (element: HTMLMediaElement) => {
    element.muted = true;
    await element.play();
  });
  await expect
    .poll(async () => audio.evaluate((element: HTMLMediaElement) => element.currentTime))
    .toBeGreaterThan(0);
  await page.evaluate(() => window.presentationTest.allow(0, false));
  await expect
    .poll(async () => audio.evaluate((element: HTMLMediaElement) => element.paused))
    .toBe(true);
  await page.evaluate(() => window.presentationTest.allow(0, true));
  expect(await audio.evaluate((element: HTMLMediaElement) => element.paused)).toBe(true);
  await audio.evaluate((element: HTMLMediaElement) => element.play());
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(async () => audio.evaluate((element: HTMLMediaElement) => element.paused))
    .toBe(true);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(await audio.evaluate((element: HTMLMediaElement) => element.paused)).toBe(true);
});

test("late play resolution after fast navigation cannot reactivate detached media", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const pending: Array<{ element: HTMLMediaElement; resolve: () => void }> = [];
    const state = new WeakMap<HTMLMediaElement, boolean>();
    Object.defineProperty(HTMLMediaElement.prototype, "paused", {
      get() {
        return state.get(this) ?? true;
      },
    });
    HTMLMediaElement.prototype.play = function () {
      return new Promise<void>((resolve) =>
        pending.push({
          element: this,
          resolve: () => {
            state.set(this, false);
            this.dispatchEvent(new Event("playing"));
            resolve();
          },
        }),
      );
    };
    HTMLMediaElement.prototype.pause = function () {
      state.set(this, true);
    };
    Object.assign(window, {
      resolvePendingMedia: () => {
        for (const request of pending.splice(0)) request.resolve();
      },
      pendingMedia: pending,
    });
  });
  await page.reload();
  await jump(page, "media");
  const video = page.getByRole("region", { name: "First test deck", exact: true }).locator("video");
  const oldVideo = await video.elementHandle();
  await video.locator("..").getByRole("button", { name: "Play / continue", exact: true }).click();
  await jump(page, "discussion");
  await expect(video).toHaveCount(0);
  await page.evaluate(() => {
    (window as unknown as { resolvePendingMedia(): void }).resolvePendingMedia();
  });
  await expect
    .poll(async () => oldVideo!.evaluate((element: HTMLMediaElement) => element.paused))
    .toBe(true);
  expect((await facts(page)).position.slideId).toBe("discussion");
});

test("a rejected wrapper play reports failure and permits a real retry", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let rejected = false;
    HTMLMediaElement.prototype.play = function () {
      if (!rejected) {
        rejected = true;
        return Promise.reject(new DOMException("Test permission denied", "NotAllowedError"));
      }
      return original.call(this);
    };
  });
  await page.reload();
  await jump(page, "media");
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  const video = first.locator("video");
  const figure = video.locator("..");
  await figure.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect(figure.getByRole("status")).toContainText("Unable to play: Test permission denied");
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await figure.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0);
  await expect(figure.getByRole("status")).not.toContainText("Unable to play");
});

test("native loading retry is visible only after failure and hides throughout recovery", async ({
  page,
}) => {
  await jump(page, "media");
  const video = page.getByRole("region", { name: "First test deck", exact: true }).locator("video");
  const figure = video.locator("..");
  const retry = figure.getByRole("button", {
    name: "Retry loading",
    exact: true,
    includeHidden: true,
  });
  await expect(figure).toHaveAttribute("data-media-state", "ready");
  await expect(retry).toBeHidden();
  await video.evaluate((element: HTMLVideoElement) => {
    element.src = `/recovering.wav?resource=${crypto.randomUUID()}`;
    element.load();
  });
  await expect(figure).toHaveAttribute("data-media-state", "failed");
  await expect(retry).toBeVisible();
  await retry.click();
  await expect(figure).toHaveAttribute("data-media-state", "loading");
  await expect(retry).toBeHidden();
  await expect(figure).toHaveAttribute("data-media-state", "ready");
  await expect(retry).toBeHidden();
  expect(await video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThan(
    0,
  );
});

test("an inert background iframe needs explicit host denial before any clocks can run", async ({
  page,
}) => {
  await page.evaluate(() => {
    const background = document.createElement("iframe");
    background.title = "Background contract review";
    background.inert = true;
    background.setAttribute("aria-hidden", "true");
    background.src = "/?active=false&step=3";
    document.body.append(background);
  });
  const frame = page.frameLocator('iframe[title="Background contract review"]');
  await expect(frame.getByRole("region", { name: "First test deck", exact: true })).toBeVisible();
  const samples = await frame.locator("body").evaluate(async () => {
    const before = window.presentationTest.facts(0);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      before,
      after: window.presentationTest.facts(0),
      visibility: document.visibilityState,
    };
  });
  expect(samples.visibility).toBe("visible");
  expect(samples.before.ticks).toBe(0);
  expect(samples.after.ticks).toBe(0);
  expect(samples.after.nestedTicks).toBe(0);
});

test("contain mode does not leave the unscaled canvas as empty horizontal scroll space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const first = page.getByRole("region", { name: "First test deck", exact: true });
  const viewport = first.locator('[data-meowui-part="presentation/viewport"]');
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeLessThanOrEqual(1);
  await first.getByRole("button", { name: "Presentation options", exact: true }).click();
  await first.getByRole("button", { name: "Actual size", exact: true }).click();
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeGreaterThan(100);
  await first.getByRole("button", { name: "Fit to window", exact: true }).click();
  await expect
    .poll(() => viewport.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeLessThanOrEqual(1);
});

test("reordering the real authored talk preserves stable ids, direct step and experiment state", async ({
  page,
}) => {
  await page.goto("/?sample=reordered");
  await expect(
    page.getByRole("heading", { name: "Give the connection a speed.", exact: true }),
  ).toBeVisible();
  const slider = page.getByRole("slider", { name: "Network speed (Mbit/s)", exact: true });
  await expect(slider).toHaveValue("71");
  await expect(
    page.getByText("Transfer-only estimate for an uncached response", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Choose slide" }).locator("option").first(),
  ).toHaveAttribute("value", "experiment");
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("summary");
  await expect(page.getByText("71 Mbit/s", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revisit your experiment", exact: true }).click();
  await expect(slider).toHaveValue("71");
  await expect(page.getByRole("button", { name: "Replay estimate", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("opening");
  await expect(
    page.getByRole("heading", { name: /The same image\.\s*A different wait\./ }),
  ).toBeVisible();
});
