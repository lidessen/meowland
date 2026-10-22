import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Icon, NavList, Stack } from "meowtail";
import { Measure } from "./specimen";

export const NavListStory = defineStory({
  id: "nav-list",
  title: "NavList · Documentation sidebar groups",
  group: "Navigation and layout",
  groupOrder: 42,
  component: "NavList",
  variant: "Docs-like groups and actions",
  description:
    "A labelled navigation landmark with grouped links, icons, badges and action rows. The host owns routing; the action rows here only update a local receipt, and the active page is fixed example data.",
  covers: [
    "navigation landmark",
    "group titles",
    "link items",
    "action items and onSelect",
    "active item",
    "icon, badge and meta",
    "item description",
  ],
  render() {
    const feedback = signal("Action rows report their selection here.");
    return (
      <Measure width="page">
        <Stack style={{ width: "min(100%, 280px)" }} gap="normal">
          <NavList
            label="Documentation"
            activeId="section"
            onSelect={(item) => {
              feedback.value = `Selected the action row: ${String(item.label)}.`;
            }}
            groups={[
              {
                id: "overview",
                label: "Overview",
                items: [
                  {
                    id: "home",
                    label: "Home",
                    href: "#nav-list-home",
                    icon: <Icon name="file" />,
                  },
                  {
                    id: "workbench",
                    label: "Component workbench",
                    href: "#nav-list-workbench",
                    icon: <Icon name="list" />,
                    badge: <Badge size="small">New</Badge>,
                  },
                ],
              },
              {
                id: "components",
                label: "Components",
                items: [
                  {
                    id: "page",
                    label: "Page",
                    href: "#nav-list-page",
                    icon: <Icon name="file-text" />,
                  },
                  {
                    id: "section",
                    label: "Section",
                    href: "#nav-list-section",
                    icon: <Icon name="notebook-tabs" />,
                    meta: "12",
                  },
                  {
                    id: "nav-list",
                    label: "NavList",
                    href: "#nav-list-self",
                    icon: <Icon name="list-checks" />,
                    badge: "Current",
                    description: "Grouped site navigation with link and action rows.",
                  },
                  {
                    id: "modal",
                    label: "Modal",
                    href: "#nav-list-modal",
                    icon: <Icon name="panel-left" />,
                    badge: "Beta",
                  },
                ],
              },
              {
                id: "guides",
                label: "Guides",
                items: [
                  {
                    id: "authoring",
                    label: "Authoring pages from regions",
                    href: "#nav-list-authoring",
                    meta: "14 min",
                  },
                  {
                    id: "adoption",
                    label: "Adopting the components",
                    href: "#nav-list-adoption",
                  },
                ],
              },
              {
                id: "actions",
                label: "Actions",
                items: [
                  {
                    id: "palette",
                    label: "Open command palette",
                    icon: <Icon name="search" />,
                    meta: "⌘K",
                  },
                  {
                    id: "settings",
                    label: "Open documentation settings",
                    icon: <Icon name="settings" />,
                    description: "An action row without a link; the host would open its settings.",
                  },
                ],
              },
            ]}
          />
          <span role="status">{feedback}</span>
        </Stack>
      </Measure>
    );
  },
});

export const NavListLongLabelStory = defineStory({
  id: "nav-list-long-labels",
  title: "NavList · Long labels in a narrow sidebar",
  group: "Navigation and layout",
  groupOrder: 42,
  component: "NavList",
  variant: "Long labels and narrow sidebar",
  description:
    "The same public navigation inside a narrow sidebar: long labels and an unbroken identifier wrap instead of widening the column, descriptions stack under the label, and disabled rows keep their place without activation.",
  covers: [
    "long label wrapping",
    "unbroken identifier",
    "item description",
    "badge and meta",
    "disabled anchor",
    "disabled action",
  ],
  render() {
    return (
      <Measure width="page">
        <Stack style={{ width: "min(100%, 220px)" }} gap="normal">
          <NavList
            label="Component workspaces"
            activeId="long"
            groups={[
              {
                id: "workspaces",
                label: "Component workspaces in this release",
                items: [
                  {
                    id: "long",
                    label:
                      "Navigation item with a long descriptive label that has to wrap inside the sidebar",
                    href: "#nav-list-long",
                    icon: <Icon name="file-text" />,
                    badge: "Updated",
                    description: "The description wraps under the label without widening the list.",
                  },
                  {
                    id: "unbroken",
                    label: `unbroken-identifier-${"x".repeat(60)}`,
                    href: "#nav-list-unbroken",
                    meta: "12",
                  },
                  {
                    id: "disabled-link",
                    label: "Disabled anchor with a long label that keeps its place",
                    href: "#nav-list-disabled",
                    disabled: true,
                    badge: "Unavailable",
                  },
                  {
                    id: "disabled-action",
                    label: "Disabled action",
                    disabled: true,
                    meta: "Locked",
                  },
                  { id: "open", label: "Open workspace" },
                ],
              },
            ]}
          />
        </Stack>
      </Measure>
    );
  },
});
