import { createRuntime } from "meowjsx";
import { applyTheme, mountStyles } from "meowcss/web";
import { createMeowUI } from "meowtail";
import { createMeowSlides } from "meowslides";
import { presentationOptions, presentationTheme } from "meowslides/theme";
import type { PreviewEnvironment } from "meowbook";

export default (({ root, onCleanup }) => {
  const document = root.ownerDocument;
  const scope = document.documentElement;
  onCleanup(mountStyles(document, presentationTheme.cssText));
  onCleanup(applyTheme(scope, presentationTheme, presentationOptions.select({ scheme: "light" })));
  const label = document.createElement("label");
  label.textContent = "Appearance";
  const select = document.createElement("select");
  for (const [value, text] of [
    ["light", "Light"],
    ["dark", "Dark"],
  ]) {
    const option = document.createElement("option");
    option.value = value!;
    option.textContent = text!;
    select.append(option);
  }
  select.addEventListener("change", () => {
    scope.dataset.meowuiColorScheme = select.value;
  });
  label.append(select);
  root.before(label);
  onCleanup(() => label.remove());
  return createRuntime({ plugins: [createMeowUI(), createMeowSlides()] });
}) satisfies PreviewEnvironment;
