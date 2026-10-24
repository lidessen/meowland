import { createRuntime } from "meowjsx";
import { createMeowUI, meowUIComponents } from "meowtail";
import { createMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";
import { imageLoadingCss } from "../../styles";
const previewCss = `
html, body { margin: 0; background: #e8ece8; color: #163f3a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
body { min-width: 320px; }
#app { height: 100dvh; }
.preview-shell { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.image-talk .preview-gate { padding: 12px 20px; background: #fff3d7; display: flex; gap: 16px; align-items: center; font-size: 15px; }
`;

export default (({ root, onCleanup }) => {
  root.style.height = "100dvh";
  onCleanup(() => {
    root.style.removeProperty("height");
  });
  onCleanup(
    mountStyles(root.ownerDocument, presentationTheme.cssText + imageLoadingCss + previewCss),
  );
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
