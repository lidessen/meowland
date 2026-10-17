import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Inline, Tag } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const TagStory = defineStory({
  id: "tag-facts",
  title: "标签 · 事实、计数与路径",
  group: "基础控件",
  groupOrder: 13,
  component: "Tag",
  variant: "中性、强调与计数",
  description:
    "标签是挨着内容的静态事实，不能点击。中性标签说明数量或类别，强调标签标出当前或默认项，橙色计数是唯一会打断你的颜色；路径、模型 ID、版本是可核对的事实，用等宽字体。",
  covers: [
    "Tag tone neutral/accent/warning",
    "kind label/count/path",
    "long path",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair>
        {() => (
          <div style={{ display: "grid", gap: "16px" }}>
            <Inline gap="compact" align="center">
              <Tag>中性标签</Tag>
              <Tag>完成条件 2</Tag>
              <Tag tone="accent">默认</Tag>
              <Tag tone="warning" kind="count">
                1
              </Tag>
              <Tag kind="count">128</Tag>
              <Tag tone="accent" kind="count">
                3
              </Tag>
            </Inline>
            <Inline gap="compact" align="center">
              <Tag kind="path">docs/records/x.md</Tag>
              <Tag kind="path">deepseek-v4.1-flash</Tag>
              <Tag kind="path">v0.1.0</Tag>
            </Inline>
            <div style={{ maxWidth: "260px" }}>
              <Tag kind="path">
                docs/records/2026-10-09-ui-systematic-design/reference/original.png
              </Tag>
            </div>
          </div>
        )}
      </SchemePair>
    );
  },
});
