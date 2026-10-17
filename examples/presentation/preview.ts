import { createRuntime } from "meowjsx";
import { createMeowUI } from "meowtail";
import { standardOptions, standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";
import { talkCss } from "./talk.styles";
export default (({ root, onCleanup }) => {
  root.style.height = "100dvh";
  onCleanup(() => {
    root.style.removeProperty("height");
  });
  onCleanup(mountStyles(root.ownerDocument, standardTheme.cssText + talkCss));
  onCleanup(
    applyTheme(
      root.ownerDocument.documentElement,
      standardTheme,
      standardOptions.select({ scheme: "light" }),
    ),
  );
  return createRuntime({ plugins: [createMeowUI()] });
}) satisfies PreviewEnvironment;
