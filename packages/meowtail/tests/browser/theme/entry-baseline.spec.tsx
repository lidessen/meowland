import { expect, test } from "@playwright/test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { themeAttributes } from "meowcss";
import { Button, Input, Stack, createMeowUI, meowUIComponents } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";

const rootAttributes = themeAttributes(standardTheme, standardOptions.select({ scheme: "light" }));
const attributes = Object.entries(rootAttributes)
  .map(([name, value]) => `${name}="${value}"`)
  .join(" ");

function content() {
  const runtime = createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
  return createWebRenderer(runtime).renderToHtml(
    <Stack>
      <p id="plain">Plain explanatory text beside shared controls.</p>
      <Button id="control">Save</Button>
      <Input aria-label="Project name" />
      <div style="font-size:28px;line-height:1.3" id="author">
        <div {...themeAttributes(undefined, standardOptions.select({ scheme: "dark" }))}>
          <p id="configuration">A local appearance keeps its author's typography.</p>
          <div {...themeAttributes(undefined, standardOptions.select({ scheme: "light" }))}>
            <p id="restored">A light region resolves its own text color again.</p>
          </div>
        </div>
        <div {...rootAttributes}>
          <p id="nested">An explicit nested theme keeps its author's typography.</p>
        </div>
        <div data-meowui-theme-root="foreign" data-meowui-scope="">
          <p id="foreign">Another theme owns its text color.</p>
        </div>
      </div>
    </Stack>,
  );
}

for (const placement of ["document", "embedded"]) {
  test(`the ${placement} entry theme supplies ordinary text typography without preview CSS`, async ({
    page,
  }) => {
    const markup = content();
    await page.setContent(`<!doctype html><html ${placement === "document" ? attributes : ""}>
      <head><style>:where([data-meowui-theme-root="foreign"]) {color:rgb(90,30,50)}
      ${standardTheme.cssText}</style></head>
      <body style="margin:0">${placement === "document" ? markup : `<p id="outside" style="font:22px serif">Host text</p><main ${attributes}>${markup}</main>`}</body>
      </html>`);
    const typography = await page.locator("#control").evaluate((element) => {
      const style = getComputedStyle(element);
      return { family: style.fontFamily, size: style.fontSize, leading: style.lineHeight };
    });
    await expect(page.locator("#plain")).toHaveCSS("font-family", typography.family);
    await expect(page.locator("#plain")).toHaveCSS("font-size", typography.size);
    await expect(page.locator("#plain")).toHaveCSS("line-height", typography.leading);
    await expect(page.getByRole("textbox")).toHaveCSS("font-family", typography.family);
    await expect(page.locator("#configuration")).toHaveCSS("font-size", "28px");
    await expect(page.locator("#nested")).toHaveCSS("font-size", "28px");
    await expect(page.locator("#nested")).toHaveCSS("line-height", "36.4px");
    const ink = await page.locator("#plain").evaluate((element) => getComputedStyle(element).color);
    await expect(page.locator("#configuration")).not.toHaveCSS("color", ink);
    await expect(page.locator("#restored")).toHaveCSS("color", ink);
    await expect(page.locator("#nested")).toHaveCSS("color", ink);
    await expect(page.locator("#foreign")).toHaveCSS("color", "rgb(90, 30, 50)");
    if (placement === "embedded")
      await expect(page.locator("#outside")).toHaveCSS("font-size", "22px");
  });
}

test("an entry theme remains easy to override without a global reset", async ({ page }) => {
  await page.setContent(`<!doctype html><style>${standardTheme.cssText}
    .host {font:20px/1.8 serif;color:rgb(80,40,20)}
    </style><main ${attributes} class="host"><p id="copy">Author typography</p></main>`);
  await expect(page.locator("#copy")).toHaveCSS("font-size", "20px");
  await expect(page.locator("#copy")).toHaveCSS("line-height", "36px");
  await expect(page.locator("#copy")).toHaveCSS("color", "rgb(80, 40, 20)");
  expect(
    await page.locator("#copy").evaluate((element) => getComputedStyle(element).marginTop),
  ).not.toBe("0px");
});
