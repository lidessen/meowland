import { createRuntime } from "meowjsx";
import { applyTheme, mountStyles } from "meowcss/web";
import { installFocusModality } from "meowtail/web";
import { createMeowUI, meowUIComponents } from "meowtail";
import { createMeowSlides } from "meowslides";
import { presentationTheme } from "meowslides/theme";
import type { PreviewEnvironment } from "meowbook";

export default (({ root, onCleanup }) => {
  onCleanup(mountStyles(root.ownerDocument, presentationTheme.cssText));
  onCleanup(applyTheme(root.ownerDocument.documentElement, presentationTheme));
  onCleanup(installFocusModality(root.ownerDocument));
  return createRuntime({
    plugins: [createMeowUI({ components: meowUIComponents }), createMeowSlides()],
  });
}) satisfies PreviewEnvironment;
