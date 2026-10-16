import { h, signal } from "meowjsx";
import { defineStory, replaceComponent } from "meowbook";
import { Placeholder } from "../../src/web";

function ExpensiveChild(props: { label: string }) {
  document.body.dataset.childExecuted = "true";
  return <section>{props.label}</section>;
}
const prepared = <ExpensiveChild label="真实子组件" />;
export const CustomContainer = defineStory({
  id: "runtime/custom-container",
  container: (children) => <section data-custom-container>{children}</section>,
  render: () => <input aria-label="容器草稿" />,
});
export const BareContainer = defineStory({
  id: "runtime/bare-container",
  container: false,
  render: () => <input aria-label="无容器草稿" />,
});
function Complex() {
  return (
    <div>
      <h2>复杂组件</h2>
      {prepared}
      <ExpensiveChild label="第二实例" />
    </div>
  );
}
export const Full = defineStory({
  id: "runtime/full",
  title: "完整预览",
  render: () => <Complex />,
});
export const Partial = defineStory({
  id: "runtime/partial",
  title: "局部预览",
  replacements: [
    replaceComponent(ExpensiveChild, () => <Placeholder label="子组件占位" height={120} />),
  ],
  render: () => <Complex />,
});
export const Interactive = defineStory({
  id: "runtime/input",
  title: "输入与清理",
  render: () => <input aria-label="草稿" />,
  setup({ onCleanup }) {
    onCleanup(() =>
      localStorage.setItem(
        "meowbook-cleanups",
        String(Number(localStorage.getItem("meowbook-cleanups") ?? 0) + 1),
      ),
    );
  },
});
export const AsyncReady = defineStory({
  id: "runtime/async",
  title: "显式异步就绪",
  render: () => <div id="async-content">准备中</div>,
  async ready({ root }) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    root.querySelector("#async-content")!.textContent = "异步已完成";
  },
});
export const LateError = defineStory({
  id: "runtime/late-error",
  title: "晚到异步错误",
  render: () => {
    const content = signal<Promise<string> | string>("初始内容");
    return (
      <div>
        <button
          onclick={() => {
            content.value = Promise.reject(new Error("fixture late error"));
          }}
        >
          触发异步错误
        </button>
        {content}
      </div>
    );
  },
});
export const RenderError = defineStory({
  id: "runtime/render-error",
  title: "渲染错误",
  render() {
    throw new Error("fixture render error");
  },
});
