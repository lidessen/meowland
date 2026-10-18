import { h, signal } from "meowjsx";
import { Presentation, type SlideBackground, type SlideDefinition } from "meowtail/presentation";
import type { SlideBackground as RootBackground } from "meowtail";

const local = signal<SlideBackground | undefined>(undefined);
const deck = signal<RootBackground>({ fill: "#182932", foreground: "light" });
const slides = [
  { id: "inherit", title: "Inherited", background: local, render: () => <p>Local state</p> },
  { id: "theme", title: "Theme", background: "theme", render: () => <p>Theme paper</p> },
] satisfies SlideDefinition[];
const view = <Presentation title="Backgrounds" slides={slides} background={deck} />;
void view;
local.value = {
  image: { src: "./cover.jpg", fit: "cover", position: "top left" },
  overlay: "#0008",
};
local.value = undefined;
// @ts-expect-error Only theme is a shorthand; fills use the explicit object form.
const shorthand: SlideBackground = "red";
void shorthand;
// @ts-expect-error Backgrounds are decorative images, not video playback controllers.
const video: SlideBackground = { video: "./background.mp4" };
void video;
// @ts-expect-error Image fitting uses the bounded cover/contain presets.
const stretched: SlideBackground = { image: { src: "./cover.jpg", fit: "stretch" } };
void stretched;
// @ts-expect-error Crop position uses the nine authored anchors.
const arbitraryPosition: SlideBackground = { image: { src: "./cover.jpg", position: "12px 47%" } };
void arbitraryPosition;
// @ts-expect-error Foreground selects readable text, independently from the surrounding theme.
const autoContrast: SlideBackground = { foreground: "auto" };
void autoContrast;
