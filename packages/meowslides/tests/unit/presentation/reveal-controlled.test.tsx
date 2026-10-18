import { expect, test } from "bun:test";
import { createRuntime, h, signal } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { Presentation, Reveal, type RevealProps } from "../../../src/presentation";

function html(props: RevealProps) {
  return createWebRenderer(createRuntime()).renderToHtml(
    <Presentation
      title="Controlled reveal"
      active={false}
      slides={[
        {
          id: "support",
          title: "Supporting detail",
          steps: 1,
          render: () => <Reveal {...props}>Mounted supporting detail</Reveal>,
        },
      ]}
    />,
  );
}

test("controlled reveal keeps its child and excludes hidden content from interaction", () => {
  for (const when of [false, signal(false)]) {
    const hidden = html({ when });
    expect(hidden).toContain("Mounted supporting detail");
    expect(hidden).toContain('aria-hidden="true"');
    expect(hidden).toContain('data-revealed="false"');
    expect(hidden).toContain("inert");
    expect(hidden).not.toContain(" when=");
  }
  const visible = html({ when: signal(true) });
  expect(visible).toContain('aria-hidden="false"');
  expect(visible).toContain('data-revealed="true"');
});

test("reveal requires one visibility source while retaining the step contract", () => {
  for (const props of [{}, { at: 0, when: false }]) {
    expect(() => html(props as unknown as RevealProps)).toThrow("exactly one of at or when");
  }
  expect(html({ at: 0 })).toContain('data-revealed="true"');
  expect(html({ at: 1 })).toContain('data-revealed="false"');
  for (const at of [-1, 0.5, 2]) expect(() => html({ at })).toThrow("Invalid Reveal step");
  expect(() =>
    createWebRenderer(createRuntime()).renderToHtml(<Reveal when={false}>Outside</Reveal>),
  ).toThrow("requires a Presentation slide");
});
