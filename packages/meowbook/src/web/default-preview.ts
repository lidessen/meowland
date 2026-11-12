import { createRuntime } from "meowjsx";
import { createMeowUI, meowUIComponents } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";
import { installFocusModality } from "meowtail/web";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "../types";

/**
 * Meowbook's standard preview, used when a config names no `preview`: a fresh runtime with the
 * Meowtail components, the standard theme on the document and focus modality. A project with its
 * own theme, host components or providers writes its own preview instead.
 */
const preview: PreviewEnvironment = ({ root, onCleanup }) => {
  const document = root.ownerDocument;
  // `applyTheme` rewrites every theme attribute, so the scheme the canvas already named (the
  // gallery's `scheme` parameter) is passed on as the selection. Under capture there is none and
  // `auto` follows `prefers-color-scheme`.
  const named = document.documentElement.getAttribute("data-meowui-color-scheme");
  const scheme = named === "light" || named === "dark" ? named : "auto";
  onCleanup(mountStyles(document, standardTheme.cssText));
  onCleanup(
    applyTheme(document.documentElement, standardTheme, standardOptions.select({ scheme })),
  );
  onCleanup(installFocusModality(document));
  return createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
};
export default preview;
