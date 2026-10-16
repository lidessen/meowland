import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
  ResourceCard,
  Stack,
  StatusDot,
  Tag,
} from "meowui";

export const PageStructureStory = defineStory({
  id: "page-structure",
  title: "页面组件 · 页头、卡片与分组行",
  group: "导航与布局",
  groupOrder: 33,
  component: "PageHeader",
  variant: "独立组件状态",
  description: "分别展示公共组件的 props 与插槽，不组装应用页面。",
  render: () => (
    <Stack>
      <PageHeader
        title="示例页头"
        description="组件描述插槽"
        actions={<Button size="small">操作</Button>}
      />
      <ResourceCard
        title="示例资源"
        subtitle="资源类别"
        description="由调用方提供说明。"
        icon={<Icon name="folder" />}
      />
      <ResourceCard title="停用资源" tone="muted" description="停用状态的组件示例。" />
      <ListRow
        tone="accent"
        title="摘要行"
        tags={<Tag tone="accent">选中</Tag>}
        description="独立条目"
      />
      <ListGroup>
        <ListRow title="第一个条目" description="由调用方提供内容" />
        <ListRow title="展开条目" expanded>
          <p>展开内容插槽</p>
        </ListRow>
      </ListGroup>
    </Stack>
  ),
});

const longContentCopy = {
  pageTitle: "服务配置与已注册工作区中的可用能力",
  purpose: "页头、状态与标识在窄窗中保持可读，操作仍靠近其对象。",
  action: "查看配置",
  title: "Development workspace · Review and documentation service",
  description: "名称用于辨认能力，说明帮助理解用途，标识用于准确核对实例。",
  category: "工作区能力",
  status: "已启用",
  emptyTitle: "停用资源",
  emptyDescription: "状态由宿主提供，组件只呈现信息与可用动作。",
};

export const PageStructureLongContentStory = defineStory({
  id: "page-structure-long-content",
  title: "页面组件 · 长名称、标识与禁用动作",
  group: "导航与布局",
  groupOrder: 33,
  component: "ResourceCard",
  variant: "窄窗与可读元信息",
  description: "真实公共组件的内容压力场景，不模拟业务请求。",
  covers: ["long title", "identity", "disabled action", "status label", "page title"],
  render: () => (
    <Stack>
      <PageHeader
        title={longContentCopy.pageTitle}
        description={longContentCopy.purpose}
        actions={<Button size="small">{longContentCopy.action}</Button>}
      />
      <ResourceCard
        title={longContentCopy.title}
        subtitle={longContentCopy.category}
        description={longContentCopy.description}
        icon={<Icon name="folder" />}
        status={[<StatusDot state="success" />, longContentCopy.status]}
        identity="workspace:development-documentation-service"
        actions={<Button size="small">{longContentCopy.action}</Button>}
      />
      <ResourceCard
        title={longContentCopy.emptyTitle}
        tone="muted"
        description={longContentCopy.emptyDescription}
        actions={
          <Button size="small" disabled>
            {longContentCopy.action}
          </Button>
        }
      />
    </Stack>
  ),
});
