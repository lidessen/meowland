import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { controlsTheme, RealControlsDemo } from "./real-controls-demo";

export const RealControlsThemeStory = defineStory({
  id: "real-controls-theme",
  title: "Parameterized theme · Real Button and Alert",
  group: "Test fixtures",
  component: "Theme",
  description:
    "Contract-driven style props, full root default configuration, multi-part nesting, and native forms.",
  render({ root, onCleanup }) {
    const style = root.ownerDocument.createElement("style");
    style.textContent = controlsTheme.cssText;
    root.ownerDocument.head.append(style);
    onCleanup(() => style.remove());
    return <RealControlsDemo />;
  },
});
