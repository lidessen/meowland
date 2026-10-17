import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Stack } from "meowtail";
import { ShortcutKeys } from "../src/components/shortcut-keys";
import { PathLabel } from "../src/components/path-label";
import { StateDot } from "../src/components/state-dot";
import { HoverCard } from "../src/components/hover-card";
export const ReferencePrimitivesStory = defineStory({
  id: "reference-primitives",
  title: "细节 · 路径、状态与预览",
  component: "PathLabel",
  group: "基础控件",
  groupOrder: 10,
  description: "路径只展示文本；预览内容由宿主提供，悬停或键盘聚焦可读。",
  render: () => (
    <Stack align="start">
      <Inline>
        保存 <ShortcutKeys keys={["⌘", "S"]} />
        <ShortcutKeys keys={["Ctrl", "+", "S"]} variant="tooltip" />
      </Inline>
      <div style={{ width: "260px", maxWidth: "100%" }}>
        <PathLabel path="packages/meowtail/src/components/shortcut-keys.tsx" />
      </div>
      <Inline>
        {(["done", "warning", "ongoing", "error", "idle"] as const).map((state) => (
          <Inline>
            <StateDot state={state} />
            <span>{state}</span>
          </Inline>
        ))}
      </Inline>
      <Inline>
        <StateDot state="done" appearance="step" />
        完成
        <StateDot state="idle" appearance="step" />
        等待
      </Inline>
      <HoverCard
        id="reference-preview"
        trigger={(bindings) => (
          <Button variant="outline" {...bindings}>
            组件说明
          </Button>
        )}
        content={
          <Stack>
            <strong>PathLabel</strong>
            <p>保留文件名后缀；完整路径可通过原生提示查看。这是内置说明，没有读取文件。</p>
            <a href="https://example.com" target="_blank" rel="noreferrer">
              外部链接样例
            </a>
          </Stack>
        }
      />
      <section id="wide-preview-anchor" style={{ width: "min(680px, calc(100vw - 64px))" }}>
        <HoverCard
          id="wide-reference-preview"
          variant="preview"
          widthAnchor={() => document.getElementById("wide-preview-anchor")}
          copyText="packages/meowtail/src/components/hover-card.tsx"
          onCopy={async (text) => {
            document.getElementById("wide-preview-anchor")!.dataset.copied = text;
          }}
          trigger={(bindings) => (
            <Button variant="outline" {...bindings}>
              宽预览与复制
            </Button>
          )}
          content={<p>packages/meowtail/src/components/hover-card.tsx</p>}
        />
      </section>
    </Stack>
  ),
});
