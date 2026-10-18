import { expect, test, type Page } from "@playwright/test";

const canvas = (page: Page) => page.locator('[data-meowui-part="presentation/slide"]');
const video = (page: Page) => canvas(page).getByLabel("Panda observation clip", { exact: true });
const media = (page: Page) => canvas(page).locator('[data-meowui-part="presentation-video/root"]');
const directory = (page: Page) => page.getByRole("combobox", { name: "Choose slide", exact: true });
const description = (page: Page) => canvas(page).locator("[data-observation-description=true]");

async function ready(page: Page) {
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

async function decodedImages(page: Page) {
  await canvas(page)
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
    );
}

async function loadedVideo(page: Page) {
  await expect
    .poll(() => video(page).evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThan(0);
  await expect(media(page)).toHaveAttribute("data-media-state", "ready");
}

test("real observation media is bundled, named and distinguished from the reading story", async ({
  page,
}) => {
  const outside: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "http://127.0.0.1:13034") return route.continue();
    outside.push(url.href);
    return route.abort();
  });
  await page.goto("/?slide=observe");
  await ready(page);
  await decodedImages(page);
  await expect(canvas(page).getByRole("img")).toHaveCount(2);
  for (const image of await canvas(page).getByRole("img").all()) {
    await expect(image).toHaveAttribute("alt", /\S/);
    expect(
      await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
    ).toBeGreaterThan(0);
  }
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(canvas(page)).toContainText("Photos show different pandas, not Xiwang’s timeline.");
  await expect(directory(page)).toHaveValue("observe");

  await directory(page).selectOption("watch");
  await loadedVideo(page);
  await decodedImages(page);
  const facts = await video(page).evaluate((element: HTMLVideoElement) => ({
    src: element.currentSrc,
    poster: element.poster,
    width: element.videoWidth,
    duration: element.duration,
    paused: element.paused,
    autoplay: element.autoplay,
    controls: element.controls,
    loop: element.loop,
  }));
  expect(new URL(facts.src).origin).toBe("http://127.0.0.1:13034");
  expect(new URL(facts.poster).origin).toBe("http://127.0.0.1:13034");
  expect(facts.width).toBeGreaterThan(0);
  expect(facts.duration).toBeGreaterThanOrEqual(10);
  expect(facts.duration).toBeLessThanOrEqual(25);
  expect(facts.paused).toBe(true);
  expect(facts.autoplay).toBe(false);
  expect(facts.loop).toBe(false);
  expect(facts.controls).toBe(true);
  const captions = video(page).locator('track[kind="captions"]');
  await expect(captions).toHaveAttribute("srclang", "en");
  await expect(captions).toHaveAttribute("default", "");
  await expect.poll(() => captions.evaluate((track: HTMLTrackElement) => track.readyState)).toBe(2);
  expect(
    await captions.evaluate((track: HTMLTrackElement) => track.track.cues?.length),
  ).toBeGreaterThan(0);
  await expect(description(page)).toBeVisible();
  await expect(description(page)).toContainText("Text alternative:");
  await expect(canvas(page)).toContainText("not Xiwang’s life");
  expect(outside).toEqual([]);
  expect(errors).toEqual([]);
});

test("projected playback controls pause, return to the start and never advance the lesson", async ({
  page,
}) => {
  await page.goto("/?slide=watch");
  await ready(page);
  await loadedVideo(page);
  const play = media(page).getByRole("button", { name: "Play / continue", exact: true });
  const pause = media(page).getByRole("button", { name: "Pause", exact: true });
  const start = media(page).getByRole("button", { name: "Back to start", exact: true });
  await play.focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() => video(page).evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.15);
  await pause.focus();
  await page.keyboard.press("Space");
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  const stopped = await video(page).evaluate((element: HTMLVideoElement) => element.currentTime);
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 120)));
  expect(
    await video(page).evaluate((element: HTMLVideoElement) => element.currentTime),
  ).toBeCloseTo(stopped, 2);
  await start.click();
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(0);
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await video(page).focus();
  await page.keyboard.press("ArrowRight");
  await expect(directory(page)).toHaveValue("watch");
  await expect(description(page)).toBeVisible();
  await video(page).evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration - 0.15;
  });
  await play.click();
  await expect
    .poll(() => video(page).evaluate((element: HTMLVideoElement) => element.ended))
    .toBe(true);
  await expect(directory(page)).toHaveValue("watch");
  await expect(canvas(page).getByRole("button", { name: "Hint", exact: true })).toHaveCount(0);
  await start.click();
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(0);
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test("leaving a playing clip releases it and revisiting remains silent without clearing writing", async ({
  page,
}) => {
  await page.goto("/?slide=act");
  await ready(page);
  const draft = "I could share reliable information because panda habitats need care.";
  await page.getByRole("textbox", { name: "My action and reason", exact: true }).fill(draft);
  await canvas(page).getByRole("button", { name: "Hint", exact: true }).click();
  await directory(page).selectOption("watch");
  await loadedVideo(page);
  const old = await video(page).elementHandle();
  await media(page).getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => video(page).evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.15);
  await directory(page).selectOption("problems");
  await expect(video(page)).toHaveCount(0);
  expect(await old!.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(await old!.getAttribute("src")).toBeNull();
  await directory(page).selectOption("watch");
  await loadedVideo(page);
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(0);
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await directory(page).selectOption("act");
  await expect(
    page.getByRole("textbox", { name: "My action and reason", exact: true }),
  ).toHaveValue(draft);
  await expect(canvas(page).getByRole("button", { name: "Hint", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
});

test("unavailable photographs and video retain descriptions and native retry recovers the clip", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/?slide=observe");
  await ready(page);
  await decodedImages(page);
  const firstImage = canvas(page).getByRole("img").first();
  const source = await firstImage.getAttribute("src");
  const imageUrl = new URL(source!, page.url()).href;
  await page.route(imageUrl, (route) => route.abort("failed"));
  await page.reload();
  await ready(page);
  const failedImage = canvas(page).locator('[data-meowui-part="image-preview/root"]').first();
  await expect(failedImage).toHaveAttribute("data-image-state", "failed");
  await expect(failedImage.getByRole("status")).toHaveText(
    "Photo unavailable. Use the description below.",
  );
  await expect(canvas(page).locator("figcaption").first()).toBeVisible();
  await expect(canvas(page).locator("figcaption").first()).toContainText("rests");
  await page.unroute(imageUrl);
  await page.reload();
  await ready(page);
  await decodedImages(page);

  await directory(page).selectOption("watch");
  await loadedVideo(page);
  const videoUrl = await video(page).evaluate((element: HTMLVideoElement) => element.currentSrc);
  await page.route(videoUrl, (route) => route.abort("failed"));
  await page.goto("/?slide=watch");
  await ready(page);
  await expect(media(page)).toHaveAttribute("data-media-state", "failed");
  await expect(media(page).getByRole("status")).toContainText("Media could not load.");
  expect(await media(page).getByRole("status").innerText()).toMatch(
    /Panda observation clip\s+Media could not load\./,
  );
  await expect(description(page)).toBeVisible();
  await expect(description(page)).toContainText("holds bamboo");
  await expect(canvas(page)).toContainText("not Xiwang’s life");
  const retry = media(page).getByRole("button", { name: "Retry loading", exact: true });
  await expect(retry).toBeVisible();
  await media(page).getByRole("button", { name: "Back to start", exact: true }).click();
  await page.unroute(videoUrl);
  await retry.click();
  await loadedVideo(page);
  await expect(retry).toBeHidden();
  expect(await video(page).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await media(page).getByRole("button", { name: "Play / continue", exact: true }).click();
  await expect
    .poll(() => video(page).evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.15);
  expect(errors).toEqual([]);
});

test("a4 observation scenes preserve media, descriptions and controls in wide, narrow and short windows", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1280, height: 330 },
  ]) {
    await page.setViewportSize(size);
    for (const id of ["observe", "watch"]) {
      await page.goto(`/?slide=${id}`);
      await ready(page);
      await expect(page.getByRole("heading", { name: /Protecting pandas · a4/ })).toBeVisible();
      await decodedImages(page);
      if (id === "observe") await page.getByRole("button", { name: "Next", exact: true }).click();
      else await loadedVideo(page);
      const overflow = await canvas(page).evaluate((slide) => {
        const body = slide.querySelector('[data-meowui-part="presentation-layout/body"]')!;
        const footer = slide.querySelector('[data-meowui-part="presentation-layout/footer"]')!;
        const footerTop = footer.getBoundingClientRect().top;
        return {
          height: body.clientHeight,
          scrollHeight: body.scrollHeight,
          width: body.clientWidth,
          scrollWidth: body.scrollWidth,
          crossing: Array.from(body.querySelectorAll("img,video,p,li,figcaption,button"))
            .filter((element) => element.checkVisibility({ visibilityProperty: true }))
            .filter((element) => element.getBoundingClientRect().bottom > footerTop + 1)
            .map((element) => element.tagName),
        };
      });
      expect(overflow.scrollHeight, `${id}: finite body height`).toBeLessThanOrEqual(
        overflow.height + 1,
      );
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.width + 1);
      expect(overflow.crossing, `${id}: body content must not cross footer`).toEqual([]);
      await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
      if (id === "watch") {
        await expect(video(page)).toBeVisible();
        await expect(description(page)).toBeVisible();
        for (const name of ["Play / continue", "Pause", "Back to start"]) {
          const button = media(page).getByRole("button", { name, exact: true });
          await expect(button).toBeVisible();
          await button.focus();
          await expect(button).toBeInViewport();
        }
      }
      await page.screenshot({
        path: testInfo.outputPath(`a4-${id}-${size.width}x${size.height}.png`),
        animations: "disabled",
      });
    }
  }
});
