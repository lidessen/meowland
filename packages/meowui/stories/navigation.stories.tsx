import { h, signal, mapSignal } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Icon, NavItem, Stack } from "meowui";

export const NavigationItemsStory = defineStory({
  id: "navigation-cards",
  title: "导航条目 · 选中、禁用与长标签",
  group: "导航与布局",
  groupOrder: 40,
  component: "NavItem",
  variant: "条目状态",
  description: "选中状态由 gallery 的本地 props 驱动，不切换业务页面。",
  render() {
    const active = signal("first");
    return (
      <Stack>
        {mapSignal(active, (value) => (
          <NavItem
            label="示例条目"
            icon={<Icon name="file" />}
            badge={<Badge size="small">3</Badge>}
            active={value === "first"}
            onClick={() => {
              active.value = "first";
            }}
          />
        ))}
        {mapSignal(active, (value) => (
          <NavItem
            label="一个较长的导航条目标签用于观察换行表现"
            active={value === "second"}
            onClick={() => {
              active.value = "second";
            }}
          />
        ))}
        <NavItem label="禁用条目" icon={<Icon name="folder" />} disabled />
      </Stack>
    );
  },
});

export const FileNavigationStory = defineStory({
  id: "navigation-file-metadata",
  title: "导航条目 · 长文件名与元信息",
  group: "导航与布局",
  groupOrder: 40,
  component: "NavItem",
  variant: "有限目录宽度",
  description: "文件名自然换行，大小保留自己的位置；选中与禁用沿用同一导航组件。",
  render() {
    const selected = signal("long");
    return (
      <Stack style={{ width: "min(100%, 240px)" }} gap="compact">
        <NavItem
          label="long-component-layout-review-and-source-reference.test.tsx"
          icon={<Icon name="file" />}
          badge="24.5 KB"
          active={mapSignal(selected, (value) => value === "long")}
          onClick={() => {
            selected.value = "long";
          }}
        />
        <NavItem
          label="README.md"
          icon={<Icon name="file" />}
          badge="1.2 KB"
          active={mapSignal(selected, (value) => value === "readme")}
          onClick={() => {
            selected.value = "readme";
          }}
        />
        <NavItem
          label="不可读取的长名称示例-file-with-unavailable-content.txt"
          badge="未知"
          disabled
        />
      </Stack>
    );
  },
});
