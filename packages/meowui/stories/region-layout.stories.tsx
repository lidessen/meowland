import { h, signal, mapSignal } from "meowjsx";
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
} from "meowui";
import { standardTheme, uiTokens } from "meowui/theme";
import { applyTheme } from "meowcss/web";

export const RegionLayoutStory = defineStory({
  id: "region-layout",
  title: "区域布局 · 列表、阅读与输入",
  group: "导航与布局",
  groupOrder: 40,
  component: "RegionLayout",
  variant: "命名区域与内容分离",
  description: "父容器分配空间；窄窗联合显示阅读与输入，返回保留草稿和列表焦点。",
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
        header={<PageHeader title="通信" description="命名区域与内容使用同一共享布局。" />}
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
                backLabel: "返回列表",
                regionLabels: { list: "会话列表", thread: "当前会话", compose: "消息输入" },
              },
            );
            const draft = signal("");
            const selected = signal(-1);
            const mounts = [
              render(
                <Stack gap="compact">
                  {Array.from({ length: 35 }, (_, i) => (
                    <NavItem
                      label={`会话 ${i + 1}`}
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
                <strong>持续核对工作 · 长会话名称会自然换行，不撑开整体布局</strong>,
                surface.regions.thread!,
              ),
              render(
                <ChatConversation ariaLabel="消息阅读区">
                  {Array.from({ length: 40 }, (_, i) => (
                    <p>消息 {i + 1}：内容保持可读，阅读历史和草稿不因窗口变化丢失。</p>
                  ))}
                </ChatConversation>,
                surface.regions.messages!,
              ),
              render(
                <Input
                  aria-label="消息草稿"
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
  title: "区域布局 · 局部内容中的菜单与选择",
  group: "导航与布局",
  groupOrder: 40,
  component: "RegionLayout",
  variant: "隔离内容中的原生浮层",
  description: "内容只进入叶区域；共享菜单、选择与焦点仍使用真实组件。",
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
        const selected = signal("未选择");
        const mounted = render(
          <Stack align="start">
            <Menu
              id="isolated-menu"
              trigger={(bindings) => <Button {...bindings}>区域动作</Button>}
              items={[
                {
                  id: "read",
                  label: "读取",
                  onSelect: () => {
                    selected.value = "读取";
                  },
                },
                {
                  id: "copy",
                  label: "复制",
                  onSelect: () => {
                    selected.value = "复制";
                  },
                },
                {
                  id: "more",
                  label: "更多",
                  children: [
                    {
                      id: "detail",
                      label: "查看详情",
                      onSelect: () => {
                        selected.value = "详情";
                      },
                    },
                  ],
                },
              ]}
            />
            <ChoiceSelect
              id="isolated-choice"
              options={[
                { value: "one", label: "第一个" },
                { value: "two", label: "第二个" },
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
  title: "区域布局 · 连续阅读与草稿工作区",
  group: "导航与布局",
  groupOrder: 40,
  component: "PageFrame",
  variant: "全宽工具栏与自然高度输入",
  description: "页壳分配剩余空间，长草稿在输入内滚动，工具栏就地展开与原生浮层保持可达。",
  covers: ["workspace frame", "content row", "long draft", "short window", "popover"],
  render: () => (
    <ChatFrame style={{ height: "calc(100dvh - 90px)", minHeight: 0 }}>
      <PageFrame
        variant="workspace"
        toolbar={
          <Inline gap="compact" style={{ position: "relative", zIndex: 2 }}>
            <strong>Assistant</strong>
            <details style={{ position: "relative" }}>
              <summary>当前工作</summary>
              <div
                data-workspace-inline-panel
                style={{
                  position: "absolute",
                  top: "100%",
                  zIndex: 2,
                  width: "min(280px, 80vw)",
                  padding: String(uiTokens.spaceSection),
                  background: String(uiTokens.surface),
                  border: `1px solid ${uiTokens.border}`,
                }}
              >
                <p>查看当前工作与依据，关闭后继续阅读。</p>
                <Button size="small">查看详情</Button>
              </div>
            </details>
            <Button variant="outline" size="small">
              停止
            </Button>
          </Inline>
        }
        header={<span role="status">共享布局示例 · 固定内容，无真实模型请求</span>}
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
                <ChatConversation ariaLabel="工作区消息">
                  {Array.from({ length: 30 }, (_, i) => (
                    <p>消息 {i + 1}：同一阅读区保留位置，窗口变化后仍能继续核对长内容。</p>
                  ))}
                </ChatConversation>,
                surface.regions.messages!,
              ),
              render(
                <ChatComposer
                  layout="stacked"
                  inputLabel="工作区草稿"
                  placeholder="有什么需要一起推进？"
                  value={draft}
                  onInput={(event: Event) => {
                    draft.value = (event.target as HTMLTextAreaElement).value;
                  }}
                  onSubmit={(event: Event) => event.preventDefault()}
                  trailing={
                    <ChoiceSelect
                      id="workspace-model"
                      label="示例模型"
                      value="one"
                      placement="top"
                      align="end"
                      matchTriggerWidth={false}
                      options={[
                        { value: "one", label: "本地示例模型" },
                        { value: "two", label: "另一示例模型" },
                      ]}
                    />
                  }
                  submitLabel="发送"
                >
                  <IconButton label="添加材料">
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
  title: "区域布局 · 窄窗导航与正文共存",
  group: "导航与布局",
  groupOrder: 40,
  component: "RegionLayout",
  variant: "导航自然高、正文占剩余空间",
  description: "桌面双栏，窄窗保留同组导航与正文；改变区域几何不重建输入或分类。",
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
              { regionLabels: { navigation: "分类导航", content: "分类正文" } },
            );
            const selected = signal(0);
            const draft = signal("");
            const mounts = [
              render(
                <Grid minColumnWidth="compact" gap="compact">
                  {Array.from({ length: 5 }, (_, i) => (
                    <NavItem
                      label={`分类 ${i + 1}`}
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
                  <strong>{mapSignal(selected, (value) => `当前分类 ${value + 1}`)}</strong>
                  <Input
                    aria-label="分类草稿"
                    value={draft}
                    onInput={(event: Event) => {
                      draft.value = (event.target as HTMLInputElement).value;
                    }}
                  />
                  {Array.from({ length: 20 }, (_, i) => (
                    <p>内容 {i + 1}：窗口改变只调整区域位置，当前分类与草稿保持原身份。</p>
                  ))}
                  <Button>末尾动作</Button>
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
