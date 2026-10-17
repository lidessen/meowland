import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Breadcrumb, Stack } from "meowtail";
export const Breadcrumbs = defineStory({
  id: "breadcrumb",
  title: "路径导航 · 所在位置",
  component: "Breadcrumb",
  variant: "长路径换行",
  group: "导航与布局",
  groupOrder: 40,
  description:
    "前序层级保留链接，末项表示当前位置；窄屏允许长路径换行。此处链接定位到同页的示例层级。",
  covers: ["Breadcrumb", "navigation", "long-label"],
  render: () => (
    <Stack>
      <Breadcrumb
        items={[
          { label: "工作区", href: "#breadcrumb-workspace" },
          { label: "网站改版", href: "#breadcrumb-project" },
          { label: "第一阶段的组件与交互设计说明" },
        ]}
      />
      <h3 id="breadcrumb-workspace">工作区</h3>
      <p id="breadcrumb-project">网站改版 · 第一阶段</p>
    </Stack>
  ),
});
