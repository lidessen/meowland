import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { installPrototype, PrototypeDemo, prototypeCSS } from "./theme-prototype-demo";

export const ParameterizedThemeStory = defineStory({
  id: "parameterized-theme-prototype",
  title: "参数化主题 · 原型验证",
  group: "测试夹具",
  component: "Theme",
  description: "独立原型：区域配置、组件选项、多 part 隔离与静态 CSS。尚未迁移标准主题。",
  render({ runtime, root, onCleanup }) {
    onCleanup(installPrototype(runtime));
    const style = root.ownerDocument.createElement("style");
    style.textContent = prototypeCSS;
    root.ownerDocument.head.append(style);
    onCleanup(() => style.remove());
    return <PrototypeDemo />;
  },
});
