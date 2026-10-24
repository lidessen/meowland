import { createRuntime } from "meowjsx";
import { createMeowUI, meowUIComponents } from "meowtail";
import { createMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";
import { lessonCss } from "./lesson.styles";
export default (({ root, onCleanup }) => {
  root.style.height = "100dvh";
  onCleanup(() => root.style.removeProperty("height"));
  onCleanup(mountStyles(root.ownerDocument, presentationTheme.cssText + lessonCss));
  onCleanup(
    applyTheme(
      root.ownerDocument.documentElement,
      presentationTheme,
      presentationOptions.select({ scheme: "light" }),
    ),
  );
  return createRuntime({
    plugins: [createMeowUI({ components: meowUIComponents }), createMeowSlides()],
  });
}) satisfies PreviewEnvironment;
