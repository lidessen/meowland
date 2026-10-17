import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { controlsTheme, RealControlsDemo } from "./real-controls-demo";

export const RealControlsThemeStory = defineStory({
  id: "real-controls-theme",
  title: "参数化主题 · 真实 Button 与 Alert",
  group: "测试夹具",
  component: "Theme",
  description: "契约驱动的样式 props、完整根默认配置、多 part 嵌套与原生表单。",
  render({ root, onCleanup }) {
    const style = root.ownerDocument.createElement("style");
    style.textContent = controlsTheme.cssText;
    root.ownerDocument.head.append(style);
    onCleanup(() => style.remove());
    return <RealControlsDemo />;
  },
});
