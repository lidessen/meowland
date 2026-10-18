import { render } from "meowjsx/web";
import { installMeowUI } from "meowtail";
import { installMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { createPandaLesson } from "./lesson";
import { lessonCss } from "./lesson.styles";

const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Lesson mount point is missing");
const uninstall = installMeowUI();
const uninstallSlides = installMeowSlides();
const restore = applyTheme(
  document.documentElement,
  presentationTheme,
  presentationOptions.select({ scheme: "light" }),
);
const removeStyles = mountStyles(document, presentationTheme.cssText + lessonCss);
const query = new URLSearchParams(location.search);
const slideId = query.get("slide");
const lesson = createPandaLesson({
  initialPosition: slideId ? { slideId, step: Number(query.get("step") ?? 0) } : undefined,
});
const mounted = render(lesson.view, root);
root.dataset.ready = "true";
window.addEventListener(
  "pagehide",
  () => {
    mounted.unmount();
    removeStyles();
    restore();
    uninstallSlides();
    uninstall();
  },
  { once: true },
);
