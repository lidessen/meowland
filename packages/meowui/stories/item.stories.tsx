import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import { Item, Icon, Stack, Container } from "meowui";

export const ItemStory = defineStory({
  id: "item-composition",
  title: "条目 · 阅读与导航",
  group: "基础控件",
  groupOrder: 10,
  component: "Item",
  variant: "信息层次与状态",
  description: "同一条目承载文件、来源和目录目的地。内容自然换行，操作使用原生按钮。",
  render: () => (
    <Container>
      <Stack>
        <Item
          title="发布检查"
          description="静态记录不显示可点击反馈。"
          meta="记录"
          leading={<Icon name="file-text" />}
        />
        <Item
          as="button"
          title="设计系统"
          description="字体、排版与主题的共同约定"
          meta="项目"
          leading={<Icon name="network" />}
          trailing={<Icon name="arrow-right" />}
        />
        <Item
          as="button"
          size="small"
          variant="outline"
          title="very-long-source-reference-component.tsx"
          description="packages/meowui/src/components/"
          leading={<Icon name="file-text" />}
          trailing="L24–48"
        />
        <Item
          as="button"
          selected
          title="已选中的来源"
          description="保留位置与阅读关系"
          trailing={<Icon name="arrow-right" />}
        />
        <Item as="button" disabled title="不可用的文件" description="文件尚未同步" />
      </Stack>
    </Container>
  ),
});
