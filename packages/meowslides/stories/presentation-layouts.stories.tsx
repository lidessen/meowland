import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Grid, LayoutItem, Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  Reveal,
  type SlideDefinition,
  type SlidePosition,
} from "meowslides";
import { presentationTokens } from "meowslides/theme";
import coast from "../../../examples/presentation/assets/coast-delivery.jpg";

const layouts: readonly SlideDefinition[] = [
  {
    id: "title",
    title: "标题与主张",
    render: () => (
      <PresentationLayout footer={<small>构图示例 · 内容由作者提供</small>}>
        <Stack justify="center" gap="relaxed">
          <small>先明确一件事</small>
          <h1>用区域关系组织演示，让标题、证据与结论各有位置</h1>
          <p>长标题自然换行，短副标题补充目的。</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "media",
    title: "图文分栏 · 1:2",
    render: () => (
      <PresentationLayout
        columns="wide-end"
        header={<h2>先确定图片比例，再放入真实素材</h2>}
        footer={<small>原创示例图片来自图片等待演示，仅用于布局观察。</small>}
      >
        <Stack justify="center">
          <p>文字保留主要观点；图片说明现象，替换素材后检查实际裁切。</p>
          <small>1:2 为内容区的逻辑列比，不依赖宿主窗口宽度。</small>
        </Stack>
        <Stack style={{ height: "100%" }}>
          <LayoutItem grow basis="0%">
            <img
              src={coast}
              alt="原创海岸示例插画"
              aria-describedby="layout-media-caption"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
            />
          </LayoutItem>
          <LayoutItem shrink={false}>
            <small id="layout-media-caption">真实图片 · contain 保留完整边缘</small>
          </LayoutItem>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "comparison",
    title: "并列对比 · 1:1",
    render: () => (
      <PresentationLayout columns="equal" header={<h2>相同的比较轴，让差异更容易核对</h2>}>
        <Stack>
          <h3>方案 A</h3>
          <p>短结论。</p>
          <p>适合内容相对固定的呈现。</p>
        </Stack>
        <Stack>
          <h3>方案 B</h3>
          <p>较长说明解释条件与代价，并以相同的标题层级维持阅读关系。</p>
          <p>适合需要观众改变输入的互动。</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "metric",
    title: "重点数字 · 2:1",
    render: () => (
      <PresentationLayout
        columns="wide-start"
        header={<h2>数字先说明量纲与条件</h2>}
        footer={<small>示意数值，不代表测量或产品承诺。</small>}
      >
        <Stack justify="center">
          <strong
            style={{ fontSize: `calc(${presentationTokens.fontTitle} * 2)`, lineHeight: "1.1" }}
          >
            3 项
          </strong>
          <p>每页只保留少量可解释的关键观察。</p>
        </Stack>
        <Stack justify="center">
          <h3>阅读方式</h3>
          <p>先看数字，再读单位、条件与来源。</p>
        </Stack>
      </PresentationLayout>
    ),
  },
  {
    id: "process",
    title: "流程与时间线",
    render: () => (
      <PresentationLayout
        header={<h2>先分区域，再逐步呈现过程</h2>}
        footer={<small>顺序来自原生有序列表；步骤显隐可继续组合 Reveal。</small>}
      >
        <Grid as="ol" columns={3} gap="relaxed">
          <li>
            <Stack>
              <h3>观察</h3>
              <p>记录可复现的现象。</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <h3>比较</h3>
              <p>用相同条件核对差异。</p>
            </Stack>
          </li>
          <li>
            <Stack>
              <h3>决定</h3>
              <p>说明结论与适用边界。</p>
            </Stack>
          </li>
        </Grid>
      </PresentationLayout>
    ),
  },
  {
    id: "summary",
    title: "引用与总结",
    steps: 1,
    render: () => (
      <PresentationLayout
        header={<h2>结论与依据分别保留自己的角色</h2>}
        footer={<small>作者示例文字，不冒充外部引文。</small>}
      >
        <Stack justify="center" gap="relaxed">
          <blockquote>
            <p>“先让观点清楚，再决定视觉如何帮助它。”</p>
          </blockquote>
          <Reveal at={1}>
            <Stack>
              <h3>接下来做什么</h3>
              <p>保留主张、条件和下一步，让最后一页可以独立理解。</p>
            </Stack>
          </Reveal>
        </Stack>
      </PresentationLayout>
    ),
  },
];

export const PresentationLayoutsStory = defineStory({
  id: "presentation-layouts",
  title: "演示构图 · 从区域开始",
  group: "演示与媒体",
  component: "PresentationLayout",
  variant: "标题、图文、对比、数字、流程与总结",
  description: "同一内容骨架与公共布局组件组合常见演示页面；画布整体缩放，内部构图保持逻辑比例。",
  covers: [
    "title",
    "media",
    "comparison",
    "metric",
    "process",
    "summary",
    "column proportions",
    "Reveal",
  ],
  render: () => (
    <div style={{ height: "min(900px, calc(100dvh - 90px))" }}>
      <Presentation
        title="常用演示构图"
        slides={layouts}
        position={signal<SlidePosition>({ slideId: "title", step: 0 })}
        active={false}
      />
    </div>
  ),
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
    await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
  },
});
