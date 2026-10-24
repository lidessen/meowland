import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import { Presentation, Reveal, type SlideDefinition } from "../../../src/presentation";

const basicSlides: SlideDefinition[] = [
  { id: "one", title: "First", steps: 3, render: ({ step }) => <p>Step {step}</p> },
  { id: "two", title: "Second", render: () => <p>Second content</p> },
];

function html(slides: readonly SlideDefinition[], position = signal({ slideId: "one", step: 0 })) {
  return createWebRenderer(createRuntime()).renderToHtml(
    <Presentation title="Contract deck" slides={slides} position={position} active={false} />,
  );
}

test("direct positions render their state without replaying earlier steps or inactive pages", () => {
  const rendered = html(basicSlides, signal({ slideId: "one", step: 3 }));
  expect(rendered).toContain("Step 3");
  expect(rendered).not.toContain("Second content");
});

test("invalid deck definitions and external positions have explicit diagnostics", () => {
  const invalidDecks: SlideDefinition[][] = [
    [],
    [{ ...basicSlides[0]!, id: "" }],
    [basicSlides[0]!, { ...basicSlides[1]!, id: "one" }],
    [{ ...basicSlides[0]!, steps: -1 }],
    [{ ...basicSlides[0]!, steps: 1.5 }],
    [{ ...basicSlides[0]!, steps: Number.POSITIVE_INFINITY }],
  ];
  for (const slides of invalidDecks) expect(() => html(slides)).toThrow();
  for (const position of [
    { slideId: "missing", step: 0 },
    { slideId: "one", step: -1 },
    { slideId: "one", step: 0.5 },
    { slideId: "one", step: 4 },
    { slideId: "one", step: Number.NaN },
  ]) {
    expect(() => html(basicSlides, signal(position))).toThrow();
  }
});

test("unreachable Reveal steps fail rather than permanently hiding content", () => {
  for (const at of [-1, 0.5, 4]) {
    expect(() =>
      html([
        {
          ...basicSlides[0]!,
          render: () => <Reveal at={at}>Unreachable content</Reveal>,
        },
      ]),
    ).toThrow();
  }
});
