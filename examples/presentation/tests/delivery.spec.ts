import { expect, test, type Page } from "@playwright/test";

async function mediaReady(page: Page) {
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThan(0);
  return video;
}

test("the experiment survives Q&A, keeps slider keys local and feeds the conclusion", async ({
  page,
}) => {
  await page.goto("/?slide=experiment");
  const slider = page.getByRole("slider", { name: "Network speed (Mbit/s)", exact: true });
  await slider.fill("71");
  await expect(page.getByLabel("Selected network speed", { exact: true })).toContainText("71");
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("72");
  await expect(page.getByRole("button", { name: "Replay estimate" })).toBeHidden();
  await page.getByRole("button", { name: "Open evidence", exact: true }).click();
  await expect(
    page.getByText("Your selected speed is still 72 Mbit/s.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return to experiment", exact: true }).click();
  await expect(slider).toHaveValue("72");
  await expect(page.getByRole("button", { name: "Replay estimate", exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("summary");
  await expect(page.getByText("72 Mbit/s", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Revisit your experiment", exact: true }).click();
  await expect(slider).toHaveValue("72");
  await page.getByRole("button", { name: "Reset experiment", exact: true }).click();
  await expect(slider).toHaveValue("8");
});

test("real video resumes its position silently and ending never navigates the talk", async ({
  page,
}) => {
  await page.goto("/?slide=evidence");
  const video = await mediaReady(page);
  expect(await video.evaluate((element: HTMLVideoElement) => element.duration)).toBeCloseTo(12, 1);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.videoWidth))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Play / continue", exact: true }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 4;
  });
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(4.05);
  const oldVideo = await video.elementHandle();
  await page.getByRole("button", { name: "Return to experiment", exact: true }).click();
  expect(await oldVideo!.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(await oldVideo!.evaluate((element: HTMLVideoElement) => element.isConnected)).toBe(false);
  await page.getByRole("button", { name: "Open evidence", exact: true }).click();
  await mediaReady(page);
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(4);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Play / continue", exact: true }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration - 0.08;
  });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.ended)).toBe(true);
  await expect(
    page.getByRole("heading", { name: "A controlled load, not a benchmark.", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeLessThan(2);
});

test("the built delivery cold-starts without external requests and decodes every local asset", async ({
  page,
}) => {
  const external: string[] = [];
  const failures: Array<{ url: string; reason: string }> = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    const reason = request.failure()?.errorText ?? "unknown";
    // Unmount deliberately cancels an already-decoded video request. Other failures matter.
    if (!(reason === "net::ERR_ABORTED" && request.url().endsWith(".webm")))
      failures.push({ url: request.url(), reason });
  });
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") {
      external.push(url.href);
      await route.abort("internetdisconnected");
    } else await route.continue();
  });
  await page.goto("/");
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
  for (const slideId of ["opening", "compare", "experiment", "evidence", "summary"]) {
    await page.getByRole("combobox", { name: "Choose slide" }).selectOption(slideId);
    for (const image of await page.locator("img").all()) {
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    if (slideId === "evidence") {
      const video = await mediaReady(page);
      await page.getByRole("button", { name: "Play / continue", exact: true }).click();
      await expect
        .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
        .toBeGreaterThan(0);
      await expect
        .poll(() =>
          page.locator("track").evaluate((element: HTMLTrackElement) => element.readyState),
        )
        .toBe(2);
      expect(await video.evaluate((element: HTMLVideoElement) => element.textTracks.length)).toBe(
        1,
      );
    }
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
  expect(failures).toEqual([]);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Choose slide" })).toHaveValue("opening");
});

test("direct step fixtures work in normal and reduced motion without replaying click history", async ({
  page,
}) => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/?slide=experiment&step=3&speed=71");
    await expect(
      page.getByRole("slider", { name: "Network speed (Mbit/s)", exact: true }),
    ).toHaveValue("71");
    await expect(
      page.getByText("Transfer-only estimate for an uncached response", { exact: false }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Replay estimate", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Previous", exact: true }).click();
    await expect(
      page.getByRole("slider", { name: "Network speed (Mbit/s)", exact: true }),
    ).toHaveValue("71");
    await expect(
      page.getByText("Transfer-only estimate for an uncached response", { exact: false }),
    ).toBeHidden();
  }
});

test("optional real music persists across pages and pauses without automatically resuming", async ({
  page,
}) => {
  await page.goto("/?demo=music");
  const audio = page.locator("audio");
  const original = await audio.elementHandle();
  await page.getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  expect(await original!.evaluate((element: HTMLAudioElement) => element.isConnected)).toBe(true);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await page.getByRole("button", { name: "Pause effects", exact: true }).click();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  await page.getByRole("button", { name: "Resume effects", exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});
