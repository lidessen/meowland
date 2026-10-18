import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { installPrototype, PrototypeDemo, prototypeCSS } from "./theme-prototype-demo";

export const ParameterizedThemeStory = defineStory({
  id: "parameterized-theme-prototype",
  title: "Parameterized theme · Prototype validation",
  group: "Test fixtures",
  component: "Theme",
  description:
    "Standalone prototype: region configuration, component options, multi-part isolation, and static CSS. The standard theme is not migrated yet.",
  render({ runtime, root, onCleanup }) {
    onCleanup(installPrototype(runtime));
    const style = root.ownerDocument.createElement("style");
    style.textContent = prototypeCSS;
    root.ownerDocument.head.append(style);
    onCleanup(() => style.remove());
    return <PrototypeDemo />;
  },
});
