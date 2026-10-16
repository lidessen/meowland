import { previewStyles } from "./preview.styles";
import { languageStyles } from "./language.styles";
import { defaultRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, Select } from "meowui";
import { standardTheme } from "meowui/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";

installMeowUI(defaultRuntime);
const preview: PreviewEnvironment = ({ root, onCleanup }) => {
  root.classList.add("meowui-story");
  const scope = document.documentElement;
  onCleanup(
    mountStyles(
      root.ownerDocument,
      standardTheme.cssText + previewStyles.text + languageStyles.text,
    ),
  );
  onCleanup(applyTheme(scope, standardTheme));
  if (scope.dataset.meowbookCapture === "true") {
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      scope.dataset.meowuiColorScheme = scheme.matches ? "dark" : "light";
    };
    update();
    scheme.addEventListener("change", update);
    onCleanup(() => {
      scheme.removeEventListener("change", update);
      root.classList.remove("meowui-story");
      delete scope.dataset.meowuiColorScheme;
    });
    return defaultRuntime;
  }
  const toolbar = document.createElement("nav");
  toolbar.className = "workshop-theme-controls";
  toolbar.setAttribute("aria-label", "主题预览");
  const controls: { unmount(): void }[] = [];
  for (const [label, key, choices] of [
    [
      "外观",
      "meowuiColorScheme",
      [
        ["light", "浅色"],
        ["dark", "深色"],
        ["auto", "跟随系统"],
      ],
    ],
  ] as const) {
    const field = document.createElement("label");
    field.textContent = label;
    let selected: string = choices[0][0];
    try {
      const saved = sessionStorage.getItem(`meowui-preview:${key}`);
      if (saved && choices.some(([value]) => value === saved)) selected = saved;
    } catch {
      // Storage can be unavailable in embedded or privacy-restricted previews.
    }
    scope.dataset[key] = selected;
    const onChange = (event: Event) => {
      const value = (event.currentTarget as HTMLSelectElement).value;
      scope.dataset[key] = value;
      try {
        sessionStorage.setItem(`meowui-preview:${key}`, value);
      } catch {
        // The current canvas still switches even without persistent storage.
      }
    };
    controls.push(
      createWebRenderer(defaultRuntime).render(
        h(
          Select,
          { value: selected, onChange },
          ...choices.map(([value, text]) => h("option", { value }, text)),
        ),
        field,
      ),
    );
    toolbar.append(field);
  }
  root.before(toolbar);
  onCleanup(() => {
    root.classList.remove("meowui-story");
    toolbar.remove();
    for (const control of controls) control.unmount();
    delete scope.dataset.meowuiColorScheme;
  });
  return defaultRuntime;
};
export default preview;
