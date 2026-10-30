import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Inline, Tag } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const TagStory = defineStory({
  id: "tag-facts",
  title: "Tag · Facts, counts and paths",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "Tag",
  variant: "Neutral, accent and count",
  description:
    "A tag is a static fact next to content and cannot be clicked. Neutral tags state a count or category, accent tags mark the current or default item, and the orange count is the only color that interrupts you; paths, model IDs and versions are checkable facts set in a monospace font.",
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
              <Tag>Neutral tag</Tag>
              <Tag>2 completion conditions</Tag>
              <Tag tone="accent">Default</Tag>
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
