import { render } from "meowjsx/web";
import { installMeowUI } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import { createSunshineLesson } from "./lesson";
import { lessonCss } from "./lesson.styles";
const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("Lesson mount point is missing");
const uninstall = installMeowUI();
const restore = applyTheme(
  document.documentElement,
  standardTheme,
  standardOptions.select({ scheme: "light" }),
);
const remove = mountStyles(document, standardTheme.cssText + lessonCss);
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
    uninstall();
  },
  { once: true },
);
