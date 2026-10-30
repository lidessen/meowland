import { h } from "meowjsx";
import { signal, mapSignal } from "meowjsx/signal";
import { render } from "meowjsx/web";
import { defineStory } from "meowbook";
import {
  NavItem,
  ChatConversation,
  Input,
  PageFrame,
  PageHeader,
  Stack,
  mountRegionLayout,
  Button,
  Menu,
  ChoiceSelect,
  ChatFrame,
  ChatComposer,
  Inline,
  Icon,
  IconButton,
  Grid,
} from "meowtail";
import { standardTheme, uiTokens } from "meowtail/theme";
import { applyTheme } from "meowcss/web";

export const RegionLayoutStory = defineStory({
  id: "region-layout",
  title: "Region Layout · List, reading and input",
  group: "Foundations and parts",
  groupOrder: 100,
  component: "RegionLayout",
  variant: "Named areas and separate content",
  description:
    "The parent container allocates space; a narrow window combines reading and input, and going back keeps the draft and list focus.",
  covers: [
    "named areas",
    "content scroll owner",
    "group visibility",
    "focus return",
    "short window",
  ],
  render: () => (
    <div style={{ height: "min(680px, calc(100dvh - 90px))", minHeight: 0 }}>
      <PageFrame
        header={
          <PageHeader
            title="Messages"
            description="Named areas and content use the same shared layout."
          />
        }
      >
        <div
          ref={(host: HTMLElement) => {
            const surface = mountRegionLayout(
              host,
              {
                areas: [
                  ["list", "thread"],
                  ["list", "messages"],
                  ["list", "compose"],
                ],
                columns: ["compact", "fill"],
                rows: ["content", "fill", "content"],
                regions: {
                  list: { group: "browse" },
                  thread: { group: "detail" },
                  messages: { group: "detail", scrollOwner: "content" },
                  compose: { group: "detail" },
                },
              },
              {
                backLabel: "Back to list",
                regionLabels: {
                  list: "Conversation list",
                  thread: "Current conversation",
                  compose: "Message input",
                },
              },
            );
            const draft = signal("");
            const selected = signal(-1);
            const mounts = [
              render(
                <Stack gap="compact">
                  {Array.from({ length: 35 }, (_, i) => (
                    <NavItem
                      label={`Conversation ${i + 1}`}
                      active={mapSignal(selected, (value) => value === i)}
                      onClick={() => {
                        selected.value = i;
                        surface.showGroup("detail");
                      }}
                    />
                  ))}
                </Stack>,
                surface.regions.list!,
              ),
              render(
                <strong>
                  Continuous review work · Long conversation names wrap naturally and do not widen
                  the layout
                </strong>,
                surface.regions.thread!,
              ),
              render(
                <ChatConversation ariaLabel="Message reading area">
                  {Array.from({ length: 40 }, (_, i) => (
                    <p>
                      Message {i + 1}: Content stays readable; history and drafts are not lost when
                      the window changes.
                    </p>
                  ))}
                </ChatConversation>,
                surface.regions.messages!,
              ),
              render(
                <Input
                  aria-label="Message draft"
                  value={draft}
                  onInput={(event: Event) => {
                    draft.value = (event.target as HTMLInputElement).value;
                  }}
                />,
                surface.regions.compose!,
              ),
            ];
            return () => {
              for (const mount of mounts) mount.unmount();
              surface.dispose();
            };
          }}
        />
      </PageFrame>
    </div>
  ),
});

export const IsolatedRegionStory = defineStory({
  id: "region-layout-isolated-controls",
  title: "Region Layout · Menus and choices in local content",
  group: "Foundations and parts",
  groupOrder: 100,
  component: "RegionLayout",
  variant: "Native popovers inside isolated content",
  description:
    "Content only enters leaf regions; the shared menu, choices and focus still use real components.",
  covers: ["shadow leaf", "Menu keyboard", "nested menu", "ChoiceSelect", "focus return"],
  render: () => (
    <div
      style={{ height: "320px" }}
      ref={(host: HTMLElement) => {
        const surface = mountRegionLayout(
          host,
          { areas: [["content"]], regions: { content: {} } },
          { isolateContent: true },
        );
        const content = surface.regions.content!;
        const shadow = content.getRootNode() as ShadowRoot;
        const style = host.ownerDocument.createElement("style");
        style.textContent = standardTheme.cssText;
        shadow.append(style);
        const removeTheme = applyTheme(content, standardTheme);
        const selected = signal("Not selected");
        const mounted = render(
          <Stack align="start">
            <Menu
              id="isolated-menu"
              trigger={(bindings) => <Button {...bindings}>Region actions</Button>}
              items={[
                {
                  id: "read",
                  label: "Read",
                  onSelect: () => {
                    selected.value = "Read";
                  },
                },
                {
                  id: "copy",
                  label: "Copy",
                  onSelect: () => {
                    selected.value = "Copy";
                  },
                },
                {
                  id: "more",
                  label: "More",
                  children: [
                    {
                      id: "detail",
                      label: "View details",
                      onSelect: () => {
                        selected.value = "Details";
                      },
                    },
                  ],
                },
              ]}
            />
            <ChoiceSelect
              id="isolated-choice"
              options={[
                { value: "one", label: "First option" },
                { value: "two", label: "Second option" },
              ]}
            />
            <span role="status">{selected}</span>
          </Stack>,
          content,
        );
        return () => {
          mounted.unmount();
          removeTheme();
          surface.dispose();
        };
      }}
    />
  ),
});

export const WorkspaceRegionStory = defineStory({
  id: "region-layout-workspace",
  title: "Page Frame · Continuous reading and draft workspace",
  group: "Pages and layout",
  groupOrder: 10,
  component: "PageFrame",
  variant: "Full-width toolbar and natural-height input",
  description:
    "The page shell allocates the remaining space, a long draft scrolls inside the input, and the inline toolbar expansion and native popovers stay reachable.",
  covers: ["workspace frame", "content row", "long draft", "short window", "popover"],
  render: () => (
    <ChatFrame style={{ height: "calc(100dvh - 90px)", minHeight: 0 }}>
      <PageFrame
        variant="workspace"
        toolbar={
          <Inline gap="compact" style={{ position: "relative", zIndex: 2 }}>
            <strong>Assistant</strong>
            {/* A host's own inline expansion: a quiet trigger and a floating panel over the content. */}
            <details style={{ position: "relative" }}>
              <summary
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  borderRadius: String(uiTokens.radius.md),
                  listStyle: "none",
                  color: String(uiTokens.ink.secondary),
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Current work
                <Icon name="chevron-down" size={14} />
              </summary>
              <div
                data-workspace-inline-panel
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  zIndex: 2,
                  display: "grid",
                  justifyItems: "start",
                  gap: String(uiTokens.space.group),
                  width: "min(280px, 80vw)",
                  padding: String(uiTokens.space.section),
                  borderRadius: String(uiTokens.radius.xl),
                  background: String(uiTokens.surface.overlay),
                  boxShadow: String(uiTokens.shadow.float),
                }}
              >
                <p style={{ margin: 0 }}>
                  Review the current work and its evidence, then close this and keep reading.
                </p>
                <Button size="small">View details</Button>
              </div>
            </details>
            <Button variant="outline" size="small">
              Stop
            </Button>
          </Inline>
        }
        header={
          <span role="status">Shared layout example · Fixed content, no real model requests</span>
        }
      >
        <div
          ref={(host: HTMLElement) => {
            const surface = mountRegionLayout(host, {
              areas: [["messages"], ["compose"]],
              rows: ["fill", "content"],
              gap: "none",
              regions: {
                messages: { scrollOwner: "content" },
                compose: {},
              },
            });
            const draft = signal("");
            const mounts = [
              render(
                <ChatConversation ariaLabel="Workspace messages">
                  {Array.from({ length: 30 }, (_, i) => (
                    <p>
                      Message {i + 1}: The same reading area keeps its position, so long content can
                      still be checked after the window changes.
                    </p>
                  ))}
                </ChatConversation>,
                surface.regions.messages!,
              ),
              render(
                <ChatComposer
                  layout="stacked"
                  inputLabel="Workspace draft"
                  placeholder="What should we push forward together?"
                  value={draft}
                  onInput={(event: Event) => {
                    draft.value = (event.target as HTMLTextAreaElement).value;
                  }}
                  onSubmit={(event: Event) => event.preventDefault()}
                  trailing={
                    <ChoiceSelect
                      id="workspace-model"
                      label="Example model"
                      value="one"
                      placement="top"
                      align="end"
                      matchTriggerWidth={false}
                      options={[
                        { value: "one", label: "Local example model" },
                        { value: "two", label: "Another example model" },
                      ]}
                    />
                  }
                  submitLabel="Send"
                >
                  <IconButton label="Add material">
                    <Icon name="plus" />
                  </IconButton>
                </ChatComposer>,
                surface.regions.compose!,
              ),
            ];
            return () => {
              for (const mount of mounts) mount.unmount();
              surface.dispose();
            };
          }}
        />
      </PageFrame>
    </ChatFrame>
  ),
});

export const NavigationRegionStory = defineStory({
  id: "region-layout-compact-navigation",
  title: "Region Layout · Narrow-window navigation beside content",
  group: "Foundations and parts",
  groupOrder: 100,
  component: "RegionLayout",
  variant: "Natural-height navigation and content filling the rest",
  description:
    "Two columns on desktop; a narrow window keeps navigation and content in the same group. Changing region geometry does not rebuild the input or the category.",
  covers: ["compact row", "same group", "content height", "draft identity"],
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)", minHeight: 0 }}>
      <PageFrame variant="workspace">
        <div
          ref={(host: HTMLElement) => {
            const surface = mountRegionLayout(
              host,
              {
                areas: [["navigation", "content"]],
                columns: ["compact", "fill"],
                gap: "compact",
                regions: {
                  navigation: { compactRow: "content" },
                  content: { compactRow: "fill" },
                },
              },
              {
                regionLabels: {
                  navigation: "Category navigation",
                  content: "Category body",
                },
              },
            );
            const selected = signal(0);
            const draft = signal("");
            const mounts = [
              render(
                <Grid minColumnWidth="compact" gap="compact">
                  {Array.from({ length: 5 }, (_, i) => (
                    <NavItem
                      label={`Category ${i + 1}`}
                      active={mapSignal(selected, (value) => value === i)}
                      onClick={() => {
                        selected.value = i;
                      }}
                    />
                  ))}
                </Grid>,
                surface.regions.navigation!,
              ),
              render(
                <Stack gap="compact">
                  <strong>{mapSignal(selected, (value) => `Current category ${value + 1}`)}</strong>
                  <Input
                    aria-label="Category draft"
                    value={draft}
                    onInput={(event: Event) => {
                      draft.value = (event.target as HTMLInputElement).value;
                    }}
                  />
                  {Array.from({ length: 20 }, (_, i) => (
                    <p>
                      Content {i + 1}: Changing the window only moves regions; the current category
                      and draft keep their identity.
                    </p>
                  ))}
                  <Button>End action</Button>
                </Stack>,
                surface.regions.content!,
              ),
            ];
            return () => {
              for (const mount of mounts) mount.unmount();
              surface.dispose();
            };
          }}
        />
      </PageFrame>
    </div>
  ),
});
