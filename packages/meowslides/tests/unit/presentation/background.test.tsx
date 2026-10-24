import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { createWebRenderer } from "meowjsx/web";
import {
  Presentation,
  type SlideBackground,
  type SlideDefinition,
} from "../../../src/presentation";

const deckBackground: SlideBackground = {
  fill: "#182932",
  image: { src: "/deck.png" },
  overlay: "rgb(0 0 0 / 40%)",
  foreground: "light",
};

function html(background?: SlideBackground, override?: SlideBackground) {
  const slides: SlideDefinition[] = [
    { id: "one", title: "First", background: override, render: () => <p>Readable content</p> },
  ];
  return createWebRenderer(createRuntime()).renderToHtml(
    <Presentation
      title="Background contract"
      slides={slides}
      background={background}
      active={false}
    />,
  );
}

test("omitted backgrounds use the theme and omitted page overrides inherit the whole deck", () => {
  const themed = html();
  expect(themed).not.toContain('data-meowui-part="presentation/background"');
  expect(themed).toContain('data-background-foreground="theme"');
  const inherited = html(deckBackground);
  expect(inherited).toContain('src="/deck.png"');
  expect(inherited).toContain('data-background-foreground="light"');
  expect(inherited).toContain("Readable content");
});

test("a page object replaces the deck and theme resets both decoration and foreground", () => {
  const replaced = html(deckBackground, { fill: "#f7f4ed" });
  expect(replaced).toContain("#f7f4ed");
  expect(replaced).not.toContain("/deck.png");
  expect(replaced).not.toContain('data-meowui-part="presentation/background-overlay"');
  expect(replaced).toContain('data-background-foreground="theme"');
  const reset = html(deckBackground, "theme");
  expect(reset).not.toContain('data-meowui-part="presentation/background"');
  expect(reset).toContain('data-background-foreground="theme"');
});

test("signal backgrounds retain a decorative image contract and explicit image geometry", () => {
  const background = signal<SlideBackground | undefined>({
    image: { src: "/cover.png", fit: "contain", position: "top right" },
  });
  const rendered = createWebRenderer(createRuntime()).renderToHtml(
    <Presentation
      title="Signal background"
      background={deckBackground}
      slides={[
        { id: "one", title: "First", background, render: () => <input aria-label="Draft" /> },
      ]}
      active={false}
    />,
  );
  expect(rendered).toContain('aria-hidden="true" inert');
  expect(rendered).toContain('alt=""');
  expect(rendered).toContain("object-fit:contain");
  expect(rendered).toContain("object-position:top right");
  expect(rendered).not.toContain("/deck.png");
  expect(rendered).not.toContain("<video");
});
