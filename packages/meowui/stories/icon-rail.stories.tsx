import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, IconRail, RailItem, RailSection } from "meowui";
import { SchemePair } from "./scheme-pair";

export const IconRailStory = defineStory({
  id: "icon-rail",
  title: "图标栏 · 展开与条目状态",
  group: "导航与布局",
  groupOrder: 41,
  component: "IconRail",
  variant: "组件插槽与状态",
  description: "仅提供示例条目与分组，不模拟 Meowland 导航或内容页。",
  render: () => (
    <SchemePair width={320}>
      {(scheme) => (
        <div style={{ position: "relative", minHeight: "300px" }}>
          <IconRail label={`示例图标栏 ${scheme}`}>
            <RailItem href="#first" current icon={<Icon name="folder" />} label="当前条目" />
            <RailItem href="#second" dot="warning" icon={<Icon name="file" />} label="提醒条目" />
            <RailSection label="示例分组" icon={<Icon name="wrench" />} href="#group">
              <RailItem href="#child" icon={<Icon name="file" />} label="分组条目" />
            </RailSection>
          </IconRail>
        </div>
      )}
    </SchemePair>
  ),
});
