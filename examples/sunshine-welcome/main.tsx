import { render } from "meowjsx/web";
import { installMeowUI } from "meowtail";
import { installMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { createSunshineLesson } from "./lesson";
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
const remove = mountStyles(document, presentationTheme.cssText + lessonCss);
const query = new URLSearchParams(location.search);
const slideId = query.get("slide");
const step = Number(query.get("step") ?? 0);
const lesson = createSunshineLesson({ initialPosition: slideId ? { slideId, step } : undefined });
const mounted = render(lesson.view, root);
root.dataset.ready = "true";
window.addEventListener(
  "pagehide",
  () => {
    mounted.unmount();
    remove();
    restore();
    uninstallSlides();
    uninstall();
  },
  { once: true },
);
