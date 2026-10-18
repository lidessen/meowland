import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "meowtail";
import {
  Presentation,
  PresentationImage,
  PresentationLayout,
  PresentationList,
  type SlideDefinition,
  type SlidePosition,
} from "meowtail/presentation";
import panda from "../../../examples/protecting-pandas/assets/panda-adult.jpg";

const diagram = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="#f4f6ee"/><g fill="#244d40" font-family="sans-serif" text-anchor="middle"><text x="600" y="85" font-size="42">From observation to explanation</text><g fill="#fffdf5" stroke="#748e78" stroke-width="4"><rect x="40" y="180" width="320" height="230" rx="22"/><rect x="440" y="180" width="320" height="230" rx="22"/><rect x="840" y="180" width="320" height="230" rx="22"/></g><g font-size="40"><text x="200" y="285">Observe</text><text x="600" y="285">Compare</text><text x="1000" y="285">Explain</text></g><g font-size="26"><text x="200" y="340">Keep the source</text><text x="600" y="340">Use the same criteria</text><text x="1000" y="340">State the conditions</text></g><g font-size="46"><text x="400" y="310">→</text><text x="800" y="310">→</text></g><text x="600" y="535" font-size="28">All three regions and this final line must remain visible.</text></g></svg>',
)}`;

const slides: readonly SlideDefinition[] = [
  {
    id: "two-columns",
    title: "两栏 · 列表与照片",
    render: () => (
      <PresentationLayout
        columns={2}
        header={<h2>两栏各有任务，照片按明确的裁切方式呈现</h2>}
        footer={<small>两列属于逻辑画布，窄窗口仍整体缩放，不自动上下重排。</small>}
      >
        <Stack>
          <h3>先说清应观察什么</h3>
          <PresentationList
            items={[
              "描述看见的姿态与环境。",
              "把观察与自己的推测分开。",
              "需要完整边缘时改用 contain。",
            ]}
          />
        </Stack>
        <PresentationImage
          src={panda}
          alt="Gao Gao 在高起的结构上休息，周围可见树枝和植物"
          ratio="fill"
          fit="cover"
          position="center"
          caption="Gao Gao · Mike Richey · CC BY-SA 3.0。沿用 Protecting pandas 的已署名本地照片；本页允许裁掉边缘环境。"
        />
      </PresentationLayout>
    ),
  },
  {
    id: "three-columns",
    title: "三栏 · 原生列表",
    render: () => (
      <PresentationLayout
        columns={3}
        header={<h2>相同列宽组织三个阅读区域</h2>}
        footer={<small>示例是作者编排，不代表课堂步骤或评分；第三列保留原生倒序编号。</small>}
      >
        <Stack>
          <h3>观察</h3>
          <PresentationList items={["保留原始描述。", "指出具体位置。", "记录尚不确定的地方。"]} />
        </Stack>
        <Stack>
          <h3>核对</h3>
          <PresentationList
            as="ol"
            items={["用相同条件比较。", "区分事实与推测。", "检查来源与适用范围。"]}
          />
        </Stack>
        <Stack>
          <h3>收敛</h3>
          <PresentationList
            as="ol"
            start={3}
            reversed
            items={["留下最重要的问题。", "选择一个可解释的结论。", "明确下一步。"]}
          />
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "text-image",
    title: "文字图 · 完整显示",
    render: () => (
      <PresentationLayout
        columns="wide-end"
        header={<h2>图中有文字时，先保留完整内容</h2>}
        footer={<small>原创静态示意图；信息关系另有真实文字说明，不把图片当作唯一可读材料。</small>}
      >
        <Stack>
          <h3>观察 → 比较 → 解释</h3>
          <PresentationList
            items={[
              "默认 contain 保留边缘。",
              "留白来自图片与区域的比例差异。",
              "图注自然占高，画面使用余量。",
            ]}
          />
        </Stack>
        <PresentationImage
          src={diagram}
          alt="从观察到解释：保留来源，按相同标准比较，并说明结论条件；底部一行说明也须完整显示"
          ratio="fill"
          caption="完整显示三个区域、两端边缘与底部说明。contain 不承诺同时填满所有可用面积。"
        />
      </PresentationLayout>
    ),
  },
];

export const PresentationFoundationsStory = defineStory({
  id: "presentation-foundations",
  title: "演示基础 · 列、列表与图片",
  group: "演示与媒体",
  component: "PresentationLayout",
  variant: "两列、三列、原生列表与图片适配",
  description:
    "同一真实演示中观察逻辑列数、正文列表、照片 cover 与文字图 contain，以及自然图注的高度预算。",
  covers: ["numeric columns", "PresentationList", "PresentationImage", "fill", "cover", "contain"],
  render: () => (
    <div style={{ height: "min(900px, calc(100dvh - 90px))" }}>
      <Presentation
        title="演示基础组合"
        slides={slides}
        position={signal<SlidePosition>({ slideId: "two-columns", step: 0 })}
        active={false}
      />
    </div>
  ),
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
    await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
  },
});
