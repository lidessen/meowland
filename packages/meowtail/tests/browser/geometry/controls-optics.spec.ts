import { expect, test } from "@playwright/test";
import { centerDistance } from "./geometry";

interface Measurement {
  case: string;
  root: number;
  content?: number | null;
  icon?: number | null;
  paddingTop?: number;
  paddingBottom?: number;
  borderTop?: number;
  borderBottom?: number;
  transform?: string;
}

test("basic controls keep single-line content on the control center", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/canvas.html?story=basic-quality-controls");
  await expect(page.locator("[data-basic-quality-scene]")).toBeVisible();

  const measurements = await page.evaluate(() => {
    const boxCenter = (element: Element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top + bounds.height / 2;
    };
    const textCenter = (element: Element) => {
      const node = [...element.childNodes].find(
        (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
      );
      if (!node) return null;
      const range = document.createRange();
      range.selectNodeContents(node);
      const bounds = range.getBoundingClientRect();
      return bounds.top + bounds.height / 2;
    };
    const measure = (caseName: string, element: Element): Measurement => ({
      case: caseName,
      root: boxCenter(element),
      icon: element.querySelector("svg") ? boxCenter(element.querySelector("svg")!) : null,
      transform: getComputedStyle(element).transform,
    });
    const buttons = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-batch1="button-text"], [data-batch1="button-icon-text"], [data-batch1="icon-button"]',
      ),
    ].map((element) => ({
      ...measure(element.dataset.batch1 ?? "button", element),
      content: textCenter(element),
    }));

    const fields = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-batch1="input"], [data-batch1="input-placeholder"], [data-batch1="select"]',
      ),
    ].map((element) => {
      const style = getComputedStyle(element);
      return {
        case: element.dataset.batch1 ?? "field",
        paddingTop: parseFloat(style.paddingTop),
        paddingBottom: parseFloat(style.paddingBottom),
        borderTop: parseFloat(style.borderTopWidth),
        borderBottom: parseFloat(style.borderBottomWidth),
      };
    });

    // ChoiceSelect spreads host props onto its native trigger, which is the
    // element carrying data-batch1; the value span is inside it.
    const choice = document.querySelector<HTMLElement>('[data-batch1="choice-select"]');
    const choiceValue = choice?.querySelector<HTMLElement>(
      '[data-meowui-part="choice-select/value"]',
    );
    const choiceMeasurement =
      choice && choiceValue
        ? {
            case: "choice-select",
            root: boxCenter(choice),
            content: textCenter(choiceValue),
            icon: null,
            transform: getComputedStyle(choice).transform,
          }
        : null;

    const composer = document.querySelector<HTMLElement>('[data-batch1="composer"]');
    const composerInput = composer?.querySelector("textarea");
    const composerSubmit = composer?.querySelector('button[type="submit"]');
    const composerMeasurement =
      composer && composerInput && composerSubmit
        ? {
            case: "composer-inline",
            root: boxCenter(composer),
            input: boxCenter(composerInput),
            submit: boxCenter(composerSubmit),
            inputPaddingTop: parseFloat(getComputedStyle(composerInput).paddingTop),
            inputPaddingBottom: parseFloat(getComputedStyle(composerInput).paddingBottom),
            submitTransform: getComputedStyle(composerSubmit).transform,
          }
        : null;

    return { buttons, fields, choice: choiceMeasurement, composer: composerMeasurement };
  });

  const findings: string[] = [];

  for (const measurement of measurements.buttons) {
    if (measurement.content != null && centerDistance(measurement.root, measurement.content) >= 1) {
      findings.push(
        `${measurement.case}: text center ${measurement.content.toFixed(2)} vs control ${measurement.root.toFixed(2)}`,
      );
    }
    if (measurement.icon != null && centerDistance(measurement.root, measurement.icon) >= 1) {
      findings.push(
        `${measurement.case}: icon center ${measurement.icon.toFixed(2)} vs control ${measurement.root.toFixed(2)}`,
      );
    }
    if (measurement.transform && measurement.transform !== "none") {
      findings.push(`${measurement.case}: unexpected transform ${measurement.transform}`);
    }
  }

  for (const field of measurements.fields) {
    if (Math.abs(field.paddingTop - field.paddingBottom) >= 1) {
      findings.push(
        `${field.case}: asymmetric block padding ${field.paddingTop}px / ${field.paddingBottom}px`,
      );
    }
    if (Math.abs(field.borderTop - field.borderBottom) >= 0.5) {
      findings.push(
        `${field.case}: asymmetric block border ${field.borderTop}px / ${field.borderBottom}px`,
      );
    }
  }

  if (!measurements.choice) {
    findings.push("choice-select: trigger or value was not found");
  } else if (
    measurements.choice.content != null &&
    centerDistance(measurements.choice.root, measurements.choice.content) >= 1
  ) {
    findings.push(
      `choice-select: value center ${measurements.choice.content.toFixed(2)} vs trigger ${measurements.choice.root.toFixed(2)}`,
    );
  }

  if (!measurements.composer) {
    findings.push("composer-inline: form, input or submit was not found");
  } else {
    const composer = measurements.composer;
    if (centerDistance(composer.root, composer.input) >= 1) {
      findings.push(
        `composer-inline: input center ${composer.input.toFixed(2)} vs form ${composer.root.toFixed(2)}`,
      );
    }
    if (centerDistance(composer.root, composer.submit) >= 1) {
      findings.push(
        `composer-inline: submit center ${composer.submit.toFixed(2)} vs form ${composer.root.toFixed(2)}`,
      );
    }
    if (Math.abs(composer.inputPaddingTop - composer.inputPaddingBottom) >= 1) {
      findings.push(
        `composer-inline: asymmetric input padding ${composer.inputPaddingTop}px / ${composer.inputPaddingBottom}px`,
      );
    }
    if (composer.submitTransform && composer.submitTransform !== "none") {
      findings.push(`composer-inline: unexpected submit transform ${composer.submitTransform}`);
    }
  }

  expect(findings, findings.join("\n")).toEqual([]);
});
