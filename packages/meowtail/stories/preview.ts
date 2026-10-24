import { previewStyles } from "./preview.styles";
import { languageStyles } from "./language.styles";
import { defaultRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { installMeowUI, meowUIComponents, Select } from "meowtail";
import { standardTheme } from "meowtail/theme";
import { applyTheme, mountStyles } from "meowcss/web";
import type { PreviewEnvironment } from "meowbook";

installMeowUI({ components: meowUIComponents }, defaultRuntime);
/**
 * An embedded canvas is a frame inside a page that already carries its own
 * chrome. The theme toolbar would repeat in every frame, so an embedded canvas
 * leaves it out and follows the reader's system scheme.
 */
function isEmbedded(): boolean {
  return new URLSearchParams(location.search).has("embedded");
}
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
  if (isEmbedded()) {
    onCleanup(() => root.classList.remove("meowui-story"));
    return defaultRuntime;
  }
  const toolbar = document.createElement("nav");
  toolbar.className = "workshop-theme-controls";
  toolbar.setAttribute("aria-label", "Theme preview");
  const controls: { unmount(): void }[] = [];
  for (const [label, key, choices] of [
    [
      "Appearance",
      "meowuiColorScheme",
      [
        ["light", "Light"],
        ["dark", "Dark"],
        ["auto", "Follow system"],
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
