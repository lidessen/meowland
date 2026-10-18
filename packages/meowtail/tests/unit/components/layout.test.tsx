import { expect, test } from "bun:test";
import { createRuntime, h, createThemePlugin, type Props, type Child } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Container, containerContract } from "../../../src/components/container";
import { Stack, stackContract } from "../../../src/components/stack";
import { Inline, inlineContract } from "../../../src/components/inline";
import { Grid, gridContract } from "../../../src/components/grid";
import { AspectRatio } from "../../../src/components/aspect-ratio";
import { FieldGroup } from "../../../src/components/field-group";
import { LayoutItem } from "../../../src/components/layout-item";
import { createMeowUI } from "../../../src/registry";

test("layout items own flex placement without changing content semantics", () => {
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <Inline as="footer" wrap={false}>
      <LayoutItem as="section" grow basis="0%" alignSelf="baseline" aria-label="Content">
        Long content
      </LayoutItem>
      <LayoutItem shrink={false}>
        <button>Edit</button>
      </LayoutItem>
    </Inline>,
  );
  expect(html).toContain("<footer");
  expect(html).toContain("<section");
  expect(html).toContain('aria-label="Content"');
  expect(html).toContain("flex-grow:1");
  expect(html).toContain("flex-basis:0%");
  expect(html).toContain("align-self:baseline");
  expect(html).toContain("flex-shrink:0");
  expect(html).not.toContain("alignSelf=");
  expect(html).not.toContain("grow=");
});

test("layout spacing defaults preserve gap and expose axis overrides through contracts", () => {
  const runtime = createRuntime();
  runtime.use(createMeowUI());
  const web = createWebRenderer(runtime);
  const html = web.renderToHtml(
    <Inline gap="relaxed" rowGap="compact">
      <span>Content</span>
    </Inline>,
  );
  expect(html).toContain('data-option-layout-gap="relaxed"');
  expect(html).toContain('data-option-layout-row-gap="compact"');
  expect(html).toContain('data-option-layout-column-gap="auto"');
  expect(html).not.toContain("rowGap=");
});

test("layout hosts retain decoration and placement while structure wins", () => {
  const web = createWebRenderer(createRuntime());
  for (const Component of [Stack, Inline, Grid, Container, AspectRatio] as Array<
    (props: Props) => Child
  >) {
    const html = web.renderToHtml(
      h(Component, { style: { color: "red", gridColumn: "1 / -1", minWidth: 300 } }),
    );
    expect(html).toContain("color:red");
    expect(html).toContain("grid-column:1 / -1");
    expect(html).toContain("min-width:0");
    expect(html).not.toContain("min-width:300");
    expect(web.renderToHtml(h(Component, { style: "color:red" }))).toContain("color:red;");
  }
  expect(web.renderToHtml(<Inline align="baseline">Mixed text</Inline>)).toContain(
    "align-items:baseline",
  );
});

test("aspect ratio rejects invalid geometry and preserves the requested ratio", () => {
  const web = createWebRenderer(createRuntime());
  for (const ratio of [0, -1, Infinity, NaN])
    expect(() => web.renderToHtml(<AspectRatio ratio={ratio} />)).toThrow("finite positive ratio");
  expect(
    web.renderToHtml(<AspectRatio ratio={1} style={{ aspectRatio: "2", maxWidth: "240px" }} />),
  ).toContain("aspect-ratio:1");
});

test("field group associates supplementary text and retains native disabled semantics", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <FieldGroup
      legend="Managed settings"
      description="Managed by your organization"
      disabled
      aria-describedby="other-help"
    >
      <input name="organization" value="Studio" />
    </FieldGroup>,
  );
  const descriptionId = html.match(/<p[^>]*id="([^"]+)"/)?.[1];
  expect(descriptionId).toBeTruthy();
  expect(html).toContain(`aria-describedby="other-help ${descriptionId}"`);
  expect(html).toMatch(/<fieldset[^>]* disabled>/);
  expect(html).toContain("<legend>Managed settings</legend>");
  expect(html).not.toContain("<input disabled");
});

test("unthemed layouts retain semantic elements and structure without choosing visual spacing", () => {
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(
    <Container as="main" width="narrow" aria-label="Workspace">
      <Stack gap="relaxed">
        <Inline as="nav" wrap={false} align="start" justify="between">
          Tools
        </Inline>
        <Grid columns={3} gap="compact">
          Content
        </Grid>
      </Stack>
    </Container>,
  );
  expect(html).toContain("<main");
  expect(html).toContain('aria-label="Workspace"');
  expect(html).toContain("<nav");
  expect(html).toContain("flex-wrap:nowrap");
  expect(html).toContain("justify-content:space-between");
  expect(html).toContain("grid-template-columns:repeat(3, minmax(0, 1fr))");
  expect(html).not.toContain("gap:");
});

test("layout themes can change spacing independently from structure and uninstall cleanly", () => {
  const runtime = createRuntime();
  for (const contract of [stackContract, inlineContract, gridContract, containerContract])
    runtime.registry.register(contract);
  const web = createWebRenderer(runtime);
  const view = (
    <Grid minColumnWidth="compact" gap="relaxed">
      <span>Long content</span>
    </Grid>
  );
  const before = web.renderToHtml(view);
  const remove = runtime.use(
    createThemePlugin({
      name: "layout-test",
      resolve: ({ component }) =>
        component.component === "grid"
          ? { className: "custom-grid", style: { gap: "23px" } }
          : undefined,
    }),
  );
  const themed = web.renderToHtml(view);
  expect(themed).toContain('class="custom-grid"');
  expect(themed).toContain("gap:23px");
  expect(themed).toContain(
    "repeat(auto-fit, minmax(min(100%, var(--grid-min-column, 100%)), 1fr))",
  );
  remove();
  expect(web.renderToHtml(view)).toBe(before);
});
