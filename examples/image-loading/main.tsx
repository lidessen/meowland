import { defaultRuntime } from "meowjsx";
import { render } from "meowjsx/web";
import { Button, Grid, ImagePreview, Inline, Stack, installMeowUI } from "meowtail";
import { installMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { createImageLoadingDeck } from "./deck";
import { imageLoadingCss } from "./styles";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Presentation mount point is missing");
const uninstall = installMeowUI(
  { components: [Button, Grid, ImagePreview, Inline, Stack] },
  defaultRuntime,
);
const uninstallSlides = installMeowSlides();
const restoreTheme = applyTheme(
  document.documentElement,
  presentationTheme,
  presentationOptions.select({ scheme: "light" }),
);
const removeStyles = mountStyles(document, presentationTheme.cssText + imageLoadingCss);
const options = new URLSearchParams(location.search);
const knownSlides = new Set(["opening", "compare", "experiment", "evidence", "summary"]);
const slideId = options.get("slide");
const step = Number(options.get("step") ?? "0");
const speed = Number(options.get("speed") ?? "8");
if (slideId !== null && !knownSlides.has(slideId)) throw new Error(`Unknown slide: ${slideId}`);
if (!Number.isInteger(step) || step < 0) throw new Error("Step must be a nonnegative integer");
if (!Number.isFinite(speed) || speed < 1 || speed > 101)
  throw new Error("Speed must be between 1 and 101 Mbit/s");
const deck = createImageLoadingDeck({
  initialPosition: slideId ? { slideId, step } : undefined,
  speed,
});
const mounted = render(deck.view, root);
root.dataset.ready = "true";
window.addEventListener("pagehide", (event) => {
  if (event.persisted) return;
  mounted.unmount();
  removeStyles();
  restoreTheme();
  uninstallSlides();
  uninstall();
});
