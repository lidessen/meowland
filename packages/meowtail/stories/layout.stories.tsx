import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Badge,
  Button,
  Container,
  Field,
  Grid,
  Inline,
  Input,
  LayoutItem,
  PageHeader,
  Stack,
} from "meowtail";

export const LayoutCompositionStory = defineStory({
  id: "layout-composition",
  title: "布局组合 · 文本基线与固定动作",
  group: "导航与布局",
  groupOrder: 40,
  component: "LayoutItem",
  variant: "长内容与动作",
  description: "相关文字沿基线靠近；正文可收缩，动作保持自然宽度；换行行距独立于组内间距。",
  covers: ["LayoutItem grow/shrink", "Inline baseline", "rowGap", "columnGap", "long content"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Inline as="header" gap="compact" align="baseline" data-layout-summary>
          <small>默认连接</small>
          <Inline gap="compact" align="baseline">
            <strong>Codex</strong>
            <small>gpt-6-luna</small>
          </Inline>
        </Inline>
        <Inline wrap={false} align="center" data-layout-fixed>
          <LayoutItem grow>
            <Stack gap="compact">
              <strong>团队共享的默认模型连接</strong>
              <span style={{ overflowWrap: "anywhere" }}>
                organization/research-model-with-a-very-long-unbroken-identifier-2026
              </span>
            </Stack>
          </LayoutItem>
          <LayoutItem shrink={false}>
            <Button variant="outline">编辑连接</Button>
          </LayoutItem>
        </Inline>
        <Inline as="footer" gap="compact" rowGap="normal" data-layout-actions>
          <Button>保存当前配置</Button>
          <Button variant="outline">恢复默认配置</Button>
          <Button variant="quiet">检查连接的可用性</Button>
        </Inline>
        <Grid columns={2} gap="relaxed" rowGap="compact" data-layout-grid-gaps>
          <span>连接名称</span>
          <span>当前模型</span>
          <strong>Codex</strong>
          <span>gpt-6-luna</span>
        </Grid>
      </Stack>
    </Container>
  ),
});

export const StackStory = defineStory({
  id: "layout-stack",
  title: "纵向布局 · 阅读与操作",
  group: "导航与布局",
  groupOrder: 40,
  component: "Stack",
  variant: "阅读与操作",
  description: "同属一件事的标题、说明与行动靠近；下一段工作使用更宽的节奏。",
  covers: ["Stack", "semantic gap", "Inline wrap"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Stack gap="compact">
          <strong>检查搜索结果的更新顺序</strong>
          <span>保留当前输入，核对旧请求是否会覆盖新结果。长说明自然换行，顺序保持连续。</span>
        </Stack>
        <Inline gap="compact">
          <Badge tone="success">已完成检查</Badge>
          <span>2 处修改等待审阅</span>
        </Inline>
        <Inline>
          <Button>审阅修改</Button>
          <Button variant="quiet">稍后处理</Button>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const InlineStory = defineStory({
  id: "layout-inline",
  title: "横向布局 · 换行与对齐",
  group: "导航与布局",
  groupOrder: 40,
  component: "Inline",
  variant: "换行与对齐",
  description: "状态和操作共享一行，空间不足时完整换行，不压缩按钮文字。",
  covers: ["Inline", "wrap", "align", "justify"],
  render: () => (
    <Container width="content">
      <Stack gap="relaxed">
        <Inline justify="between" align="baseline">
          <strong>待审阅工作</strong>
          <small>3 项 · 最近更新于 10:24</small>
        </Inline>
        <Inline gap="compact">
          <Button>审阅全部修改</Button>
          <Button variant="outline">查看完整验证记录</Button>
          <Button variant="quiet">暂时保留当前结果</Button>
        </Inline>
        <Inline align="start">
          <Badge tone="warning">需确认</Badge>
          <Stack gap="compact">
            <strong>检查修改范围</strong>
            <span>确认没有包含当前任务之外的文件。</span>
          </Stack>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const GridStory = defineStory({
  id: "layout-grid",
  title: "网格布局 · 并列工作",
  group: "导航与布局",
  groupOrder: 40,
  component: "Grid",
  variant: "自适应列",
  description: "并列工作依据可用宽度排列，窄容器降为单列，不隐藏长标题。",
  covers: ["Grid", "auto columns", "Container", "long content"],
  render: () => (
    <Container width="wide">
      <Grid gap="relaxed">
        <Stack gap="compact" align="start">
          <Badge tone="success">已完成</Badge>
          <strong>搜索结果的顺序与过期请求处理</strong>
          <span>保留新结果，忽略晚到的旧结果。</span>
          <Button variant="outline">查看修改</Button>
        </Stack>
        <Stack gap="compact" align="start">
          <Badge tone="warning">待确认</Badge>
          <strong>窄屏对话中的代码阅读与来源检查</strong>
          <span>代码在局部滚动，正文保持可读。</span>
          <Button variant="outline">查看记录</Button>
        </Stack>
      </Grid>
    </Container>
  ),
});

export const ContainerStory = defineStory({
  id: "layout-container",
  title: "内容宽度 · 让阅读聚焦",
  group: "导航与布局",
  groupOrder: 40,
  component: "Container",
  variant: "阅读宽度",
  description: "内容宽度来自主题，同一结构可以适配紧凑工具与阅读场景。",
  covers: ["Container narrow/content/wide/page/full"],
  render: () => (
    <Stack gap="relaxed">
      {(["narrow", "content", "wide", "page", "full"] as const).map((width) => (
        <Container width={width}>
          <Stack gap="compact">
            <strong>
              {
                {
                  narrow: "短表单",
                  content: "主要阅读",
                  wide: "宽幅工作区",
                  page: "页面主体（两侧留白，窄屏收为 16px）",
                  full: "占满可用空间",
                }[width]
              }
            </strong>
            <span>内容在当前容器内自然换行，保持明确的阅读起点；宽度不改变信息的先后关系。</span>
          </Stack>
        </Container>
      ))}
    </Stack>
  ),
});

export const NaturalPageContainerStory = defineStory({
  id: "layout-container-page",
  title: "自然页面 · 语义留白与连续阅读",
  group: "导航与布局",
  groupOrder: 40,
  component: "Container",
  variant: "页面留白与自然文流",
  description:
    "页面沿现语义 token 保留边缘，长内容交页面自然滚动；宽窄变化不重挂载草稿与末尾动作。",
  covers: ["Container page", "page inset tokens", "natural document scroll", "draft continuity"],
  container: (children) => <div data-container-page-scope>{children}</div>,
  render: () => (
    <Container as="main" width="page" data-container-page>
      <Stack>
        <PageHeader
          title="核对页面留白与阅读顺序"
          description="这是隔离的自然页面组合，不读取资料或保存设置。"
        />
        <Field label="页面草稿" htmlFor="container-page-draft">
          <Input id="container-page-draft" placeholder="保留当前输入，继续核对页面" />
        </Field>
        <Stack gap="compact">
          {Array.from({ length: 24 }, (_, index) => (
            <p>
              阅读段落 {index + 1}
              ：标题、输入与末尾操作沿同一自然内容列排列，长说明完整换行，窗口变化后继续从当前内容核对。
            </p>
          ))}
        </Stack>
        <Inline as="footer">
          <Button variant="outline">检查末尾操作</Button>
          <span>末尾操作保持自然位置，不固定覆盖正文。</span>
        </Inline>
      </Stack>
    </Container>
  ),
});

export const NestedLayoutScrollStory = defineStory({
  id: "layout-nested-scroll",
  title: "嵌套布局 · 固定头尾与局部滚动",
  group: "导航与布局",
  groupOrder: 40,
  component: "LayoutItem",
  variant: "纵向余量与动态长内容",
  description: "有限高度交给布局分配，阅读体独立滚动；固定操作、草稿和自然文流保持原身份。",
  covers: ["nested min-size", "fixed header/footer", "dynamic content", "numeric basis"],
  render: () => {
    const count = signal(24);
    return (
      <Container width="wide">
        <Stack
          gap="compact"
          style={{ height: "clamp(240px, calc(100dvh - 170px), 540px)" }}
          data-nested-layout
        >
          <LayoutItem shrink={false} data-nested-fixed="header">
            <Inline gap="compact" justify="between">
              <strong>检查动态内容与可用空间</strong>
              <Button size="small" variant="outline" onClick={() => (count.value += 12)}>
                追加内容
              </Button>
            </Inline>
          </LayoutItem>
          <LayoutItem grow basis={0} style={{ display: "flex" }} data-nested-body>
            <Inline wrap={false} align="stretch" gap="compact" style={{ flex: 1 }}>
              <LayoutItem basis={120} shrink={false} style="color:inherit" data-numeric-basis>
                <Stack gap="compact">
                  <strong>当前范围</strong>
                  <span>布局基础</span>
                  <Badge>本地检查</Badge>
                </Stack>
              </LayoutItem>
              <LayoutItem grow basis="0%" style={{ display: "flex" }} data-percent-basis>
                <Stack gap="compact" style={{ flex: 1 }}>
                  <LayoutItem shrink={false}>
                    <Field label="检查草稿" htmlFor="nested-layout-draft">
                      <Input id="nested-layout-draft" placeholder="窗口变化后继续编辑" />
                    </Field>
                  </LayoutItem>
                  <LayoutItem grow basis={0} style={{ display: "flex" }}>
                    <Grid columns={1} gap="none" style={{ flex: 1 }}>
                      <Stack
                        gap="compact"
                        role="region"
                        aria-label="嵌套布局阅读区"
                        tabIndex={0}
                        style={{ overflow: "auto", overscrollBehavior: "contain" }}
                        data-nested-scroll
                      >
                        {mapSignal(count, (value) =>
                          Array.from({ length: value }, (_, index) => (
                            <p style={{ margin: 0, overflowWrap: "anywhere" }}>
                              记录 {index + 1}：长内容在阅读区域内连续排列，输入和底部操作保持可达。
                              organization/research-model-with-a-very-long-unbroken-identifier-2026
                            </p>
                          )),
                        )}
                      </Stack>
                    </Grid>
                  </LayoutItem>
                </Stack>
              </LayoutItem>
            </Inline>
          </LayoutItem>
          <LayoutItem shrink={false} data-nested-fixed="footer">
            <Inline gap="compact">
              <Button>完成检查</Button>
              <span>固定操作不跟随阅读体滚动。</span>
            </Inline>
          </LayoutItem>
        </Stack>
      </Container>
    );
  },
});
