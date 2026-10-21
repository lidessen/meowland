import { createRuntime } from "meowjsx";
import { applyTheme, mountStyles } from "meowcss/web";
import { createMeowUI } from "meowtail";
import { createMeowSlides } from "meowslides";
import { presentationTheme } from "meowslides/theme";
import type { PreviewEnvironment } from "meowbook";

/** The presentation environment for the documentation gallery. */
export default (({ root, onCleanup }) => {
  onCleanup(mountStyles(root.ownerDocument, presentationTheme.cssText));
  onCleanup(applyTheme(root.ownerDocument.documentElement, presentationTheme));
  return createRuntime({ plugins: [createMeowUI(), createMeowSlides()] });
}) satisfies PreviewEnvironment;
