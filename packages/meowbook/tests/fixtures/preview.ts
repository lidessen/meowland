import { createRuntime, h } from "meowjsx";
import type { PreviewEnvironment } from "../../src";
import { createMeowUI, meowUIComponents } from "meowtail";
import { standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
function PreviewContainer({ children }: { children?: import("meowjsx").Child }) {
  return h("div", { "data-default-container": true }, children);
}
export default (({ root, setContainer, onCleanup }) => {
  setContainer((children) => h(PreviewContainer, {}, children));
  onCleanup(mountStyles(root.ownerDocument, standardTheme.cssText));
  onCleanup(applyTheme(root.ownerDocument.documentElement, standardTheme));
  return createRuntime({ plugins: [createMeowUI({ components: meowUIComponents })] });
}) satisfies PreviewEnvironment;
