import { expect, test, type Locator, type Page } from "@playwright/test";

const root = (page: Page) => page.locator('[data-meowui-part="presentation-image/root"]');
const frame = (figure: Locator) => figure.locator('[data-meowui-part="presentation-image/frame"]');
const caption = (figure: Locator) =>
  figure.locator('[data-meowui-part="presentation-image/caption"]');

async function ready(page: Page, story = "presentation-images") {
  await page.goto(`/canvas.html?story=${story}`);
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
}

async function decoded(page: Page) {
  await root(page)
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
    );
}

async function expectFrameOwnsImage(page: Page) {
  for (const figure of await root(page).all()) {
    const boxes = await figure.evaluate((element) => {
      const frame = element.querySelector('[data-meowui-part="presentation-image/frame"]')!;
      const image = element.querySelector("img")!;
      return {
        frame: frame.getBoundingClientRect().toJSON(),
        image: image.getBoundingClientRect().toJSON(),
      };
    });
    expect(boxes.image.width).toBeCloseTo(boxes.frame.width, 1);
    expect(boxes.image.height).toBeCloseTo(boxes.frame.height, 1);
    expect(boxes.image.x).toBeCloseTo(boxes.frame.x, 1);
    expect(boxes.image.y).toBeCloseTo(boxes.frame.y, 1);
  }
}

test("numeric ratios size the image frame in natural flow and a stretching grid", async ({
  page,
}) => {
  await ready(page, "presentation-image-natural");
  await decoded(page);
  await expectFrameOwnsImage(page);
  const figure = root(page);
  const bounds = await frame(figure).boundingBox();
  expect(bounds!.width / bounds!.height).toBeCloseTo(3 / 2, 2);
  expect((await caption(figure).boundingBox())!.y).toBeGreaterThanOrEqual(
    bounds!.y + bounds!.height,
  );
  await expect(figure.getByRole("button")).toHaveCount(0);

  await ready(page);
  await decoded(page);
  await expectFrameOwnsImage(page);
  for (const image of await root(page).all()) {
    const box = await frame(image).boundingBox();
    expect(box!.width / box!.height).toBeCloseTo(16 / 9, 2);
  }
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
});

test("contain keeps portrait, landscape and square sources complete in finite columns", async ({
  page,
}, testInfo) => {
  await ready(page);
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("contain");
  await decoded(page);
  await expectFrameOwnsImage(page);
  const dimensions = await root(page)
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => [
        (image as HTMLImageElement).naturalWidth,
        (image as HTMLImageElement).naturalHeight,
      ]),
    );
  expect(dimensions).toEqual([
    [300, 600],
    [600, 300],
    [400, 400],
  ]);
  for (const image of await root(page).locator("img").all()) {
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect(image).toHaveCSS("object-position", "50% 50%");
  }
  for (const size of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1280, height: 330 },
  ]) {
    await page.setViewportSize(size);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    for (const figure of await root(page).all()) {
      const boxes = await figure.evaluate((element) => ({
        frame: element
          .querySelector('[data-meowui-part="presentation-image/frame"]')!
          .getBoundingClientRect()
          .toJSON(),
        caption: element.querySelector("figcaption")!.getBoundingClientRect().toJSON(),
      }));
      expect(boxes.frame.width).toBeGreaterThan(0);
      expect(boxes.frame.height).toBeGreaterThan(0);
      expect(boxes.caption.y).toBeGreaterThanOrEqual(boxes.frame.bottom - 1);
    }
    await expectFrameOwnsImage(page);
    await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
    await page.screenshot({
      path: testInfo.outputPath(`image-contain-${size.width}x${size.height}.png`),
      animations: "disabled",
    });
  }
});

test("cover is explicit and its semantic position reaches the actual image", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("cover");
  await decoded(page);
  await expectFrameOwnsImage(page);
  const images = root(page).locator("img");
  await expect(images.nth(0)).toHaveCSS("object-fit", "cover");
  await expect(images.nth(1)).toHaveCSS("object-fit", "cover");
  await expect(images.nth(0)).toHaveCSS("object-position", "0% 0%");
  await expect(images.nth(1)).toHaveCSS("object-position", "100% 100%");
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
  await page.screenshot({
    path: testInfo.outputPath("image-cover-positions.png"),
    animations: "disabled",
  });
});

test("loading and failure keep frame geometry, captions and visible feedback", async ({
  page,
}, testInfo) => {
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/presentation-image-unavailable.svg", async (route) => {
    await pending;
    await route.fulfill({ status: 404, body: "Image unavailable" });
  });
  await page.goto("/canvas.html?story=presentation-images", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#story-state")).toHaveAttribute("data-status", "ready");
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("feedback");
  const failed = root(page).nth(1);
  await expect(failed.locator('[data-image-state="loading"]')).toHaveCount(1);
  const before = await frame(failed).boundingBox();
  release!();
  await expect(failed.locator('[data-image-state="failed"]')).toHaveCount(1);
  expect(await frame(failed).boundingBox()).toEqual(before);
  await expect(failed.getByRole("status")).toHaveText(
    "The image is unavailable. Use the written description and keep the source note in view.",
  );
  await expect(caption(failed)).toBeVisible();
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeHidden();
  await page.screenshot({
    path: testInfo.outputPath("image-failure-caption.png"),
    animations: "disabled",
  });
  await caption(failed).evaluate((element) => {
    element.textContent = "A source caption exceeds the available space. ".repeat(100);
  });
  await expect(page.locator('[data-meowui-part="presentation/diagnostic"]')).toBeVisible();
  expect(
    await caption(failed).evaluate((element) => element.scrollHeight <= element.clientHeight + 1),
  ).toBe(true);
});
