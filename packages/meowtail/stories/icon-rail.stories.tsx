import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, IconRail, RailItem, RailSection } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const IconRailStory = defineStory({
  id: "icon-rail",
  title: "Icon rail · Expansion and item states",
  group: "Navigation and layout",
  groupOrder: 41,
  component: "IconRail",
  variant: "Component slots and states",
  description:
    "Provides only sample items and groups; does not simulate Meowland navigation or content pages.",
  render: () => (
    <SchemePair width={320}>
      {(scheme) => (
        <div style={{ position: "relative", minHeight: "300px" }}>
          <IconRail label={`Sample icon rail ${scheme}`}>
            <RailItem href="#first" current icon={<Icon name="folder" />} label="Current item" />
            <RailItem
              href="#second"
              dot="warning"
              icon={<Icon name="file" />}
              label="Item with reminder"
            />
            <RailSection label="Sample group" icon={<Icon name="folder" />} href="#group">
              <RailItem href="#child" icon={<Icon name="file" />} label="Group item" />
            </RailSection>
          </IconRail>
        </div>
      )}
    </SchemePair>
  ),
});
