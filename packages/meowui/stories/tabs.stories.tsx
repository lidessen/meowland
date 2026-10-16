import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Tabs, Input, Stack, Container } from "meowui";

export const ProjectTabs = defineStory({
  id: "tabs",
  title: "标签页 · 项目上下文",
  component: "Tabs",
  variant: "键盘与受控选择",
  group: "导航与布局",
  groupOrder: 40,
  description:
    "方向键与 Home / End 切换可用标签，跳过禁用项；离开后再回来仍保留输入草稿。下方受控例展示由调用者确认的选择。",
  covers: ["Tabs", "keyboard", "disabled", "controlled"],
  render: () => {
    const selected = signal("overview");
    return (
      <Container width="content">
        <Stack gap="relaxed">
          <Tabs
            id="project-tabs"
            label="项目视图"
            items={[
              {
                value: "overview",
                label: "概览",
                content: <p>网站改版 · 正在整理本周需要交付的页面。</p>,
              },
              { value: "locked", label: "权限管理", disabled: true, content: "仅管理员可用" },
              {
                value: "notes",
                label: "工作笔记",
                content: <Input aria-label="工作草稿" placeholder="写下一步要做的事" />,
              },
              { value: "files", label: "文件", content: <p>设计说明.md · 本地示例文件</p> },
            ]}
          />
          <Tabs
            id="controlled-tabs"
            label="受控视图"
            value={selected}
            onValueChange={(value) => {
              selected.value = value;
            }}
            items={[
              { value: "overview", label: "摘要", content: <p>选择由调用者保存。</p> },
              { value: "details", label: "详情", content: <p>已切换到详细记录。</p> },
            ]}
          />
        </Stack>
      </Container>
    );
  },
});
