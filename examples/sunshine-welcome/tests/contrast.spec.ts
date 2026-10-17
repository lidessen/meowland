import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

test("small authored text remains readable against its actual composed background", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  const scenes = [];
  for (const [slide, step] of [
    ["welcome", 1],
    ["notice", 2],
    ["words-people", 2],
    ["words-life", 2],
    ["match", 2],
    ["read-talk", 2],
    ["choose", 3],
    ["pair-talk", 1],
    ["take-action", 1],
  ] as const) {
    await page.goto(`/?slide=${slide}&step=${step}`);
    await expect(page.locator("#app")).toHaveAttribute("data-ready", "true");
    await page.evaluate(() => document.fonts.ready);
    const samples = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      const rgba = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return Array.from(context.getImageData(0, 0, 1, 1).data);
      };
      const blend = (front: number[], back: number[]) => {
        const alpha = front[3]! / 255;
        return front
          .slice(0, 3)
          .map((channel, index) => channel * alpha + back[index]! * (1 - alpha))
          .concat(255);
      };
      const luminance = (color: number[]) =>
        color.slice(0, 3).reduce((sum, channel, index) => {
          const value = channel / 255;
          return (
            sum +
            (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
              [0.2126, 0.7152, 0.0722][index]!
          );
        }, 0);
      return Array.from(
        document.querySelectorAll(
          ".source-tag,.kicker,.dialogue strong,.word-phrase,.word-meaning,.small,.teacher-line",
        ),
      )
        .filter((element) => element.checkVisibility({ visibilityProperty: true }))
        .map((element) => {
          let background = [255, 255, 255, 255];
          let opacity = 1;
          const ancestors: Element[] = [];
          for (let current: Element | null = element; current; current = current.parentElement)
            ancestors.unshift(current);
          for (const ancestor of ancestors) {
            const css = getComputedStyle(ancestor);
            background = blend(rgba(css.backgroundColor), background);
            opacity *= Number(css.opacity);
          }
          const css = getComputedStyle(element);
          const first = luminance(blend(rgba(css.color), background));
          const second = luminance(background);
          return {
            text: element.textContent?.trim(),
            className: element.className,
            color: css.color,
            background,
            fontSize: css.fontSize,
            fontWeight: css.fontWeight,
            opacity,
            contrast: (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05),
          };
        });
    });
    expect(samples.length).toBeGreaterThan(0);
    scenes.push({ slide, step, samples });
  }
  await mkdir(testInfo.outputDir, { recursive: true });
  await writeFile(
    testInfo.outputPath("contrast-diagnostics.json"),
    JSON.stringify(scenes, null, 2),
  );
  for (const scene of scenes)
    for (const sample of scene.samples) {
      expect(sample.opacity, `${scene.slide}: ${sample.text}`).toBe(1);
      expect(sample.contrast, `${scene.slide}: ${sample.text}`).toBeGreaterThanOrEqual(4.5);
    }
});
