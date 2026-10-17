import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { DetailSection, ResourceLink, Stack, Timeline, TimelineItem } from "meowtail";

export const DetailComponentsStory = defineStory({
  id: "detail-components",
  title: "详情组件 · 分块、时间线与资源引用",
  group: "导航与布局",
  groupOrder: 32,
  component: "DetailSection",
  variant: "独立组件状态",
  description: "独立展示公共详情组件，不模拟工作详情面板。",
  render: () => (
    <Stack>
      <DetailSection title="分块标题" aside="辅助说明">
        <p>正文由调用方提供。</p>
      </DetailSection>
      <Timeline>
        <TimelineItem state="processing" title="处理中" stateLabel="处理中" />
        <TimelineItem state="returned" title="执行返回" stateLabel="已返回" />
        <TimelineItem state="success" title="完成" stateLabel="完成" />
      </Timeline>
      <ResourceLink href="#sample" title="示例链接" detail="链接形式" />
      <ResourceLink
        title="一个很长的示例资源名称用于观察调用方传入长文本的表现"
        detail="按钮形式"
      />
    </Stack>
  ),
});
