import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  AddButton,
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogPanel,
  DialogHeader,
  DialogActions,
  ChatAttachments,
  ChatComposer,
  ChatFrame,
  ChatHeader,
  ChatMessage,
  ChatMessageActions,
  ChatMessageList,
  ChatProcess,
  ChatSources,
  ChatStatus,
  ChatToolCall,
  Field,
  IconButton,
  Input,
  NavItem,
  Select,
  Separator,
  Toolbar,
} from "meowui";
import { Icon } from "meowui/icons";
import { uiTokens } from "meowui/theme";

export const DesignLanguageStory = defineStory({
  id: "design-language",
  title: "设计语言 · 全景画板",
  group: "组合示例",
  groupOrder: 70,
  variant: "设计总览",
  description:
    "在同一张画板上查看色彩、字体、尺度与组件组合。切换设计与外观，对照整体语言；输入和交互状态保持不变。",
  covers: [
    "theme switching",
    "retained input",
    "Card",
    "NavItem",
    "Separator",
    "IconButton",
    "AddButton",
  ],
  render: () => (
    <div className="language-board">
      <header className="language-heading">
        <div>
          <span className="language-eyebrow">MEOWUI / DESIGN LANGUAGE</span>
          <h1>设计语言</h1>
          <p>从基础元素到完整界面，在一张画板里看见它们的关系。</p>
        </div>
        <span className="language-edition">
          基础 · 组件 · 组合
          <br />
          同一套组件，两种表达
        </span>
      </header>
      <section className="language-band" aria-labelledby="language-foundations">
        <h2 id="language-foundations">
          <span>01</span> 基础语言 <small>Foundations</small>
        </h2>
        <div className="language-grid language-foundations">
          <section className="language-sheet" aria-label="色彩">
            <h3>
              色彩 <small>Color</small>
            </h3>
            <div className="language-palette">
              {(
                [
                  [uiTokens.background, "画布"],
                  [uiTokens.surface, "表面"],
                  [uiTokens.surfaceMuted, "衬底"],
                  [uiTokens.foreground, "正文"],
                  [uiTokens.mutedForeground, "次要"],
                  [uiTokens.border, "边界"],
                  [uiTokens.primary, "强调"],
                  [uiTokens.primarySoft, "选中"],
                  [uiTokens.focus, "焦点"],
                ] as const
              ).map(([token, label]) => (
                <div className="language-swatch">
                  <span style={{ background: String(token) }} />
                  <strong>{label}</strong>
                  <code>{token.name.replace("--ui-", "")}</code>
                </div>
              ))}
            </div>
            <div className="language-semantic-colors">
              {[uiTokens.info, uiTokens.success, uiTokens.warning, uiTokens.danger].map((token) => (
                <span>
                  <i style={{ background: String(token) }} />
                  <code>{token.name.replace("--ui-", "")}</code>
                </span>
              ))}
            </div>
          </section>
          <section className="language-sheet" aria-label="字体">
            <h3>
              字体 <small>Typography</small>
            </h3>
            <div className="language-type-specimen">
              Aa <span>字</span>
            </div>
            <div className="language-type-row">
              <code>title</code>
              <strong style={{ fontSize: `${uiTokens.fontTitle}` }}>让工作自然继续</strong>
            </div>
            <div className="language-type-row">
              <code>body</code>
              <span style={{ fontSize: `${uiTokens.fontBody}` }}>清楚表达，也留出思考的空间。</span>
            </div>
            <div className="language-type-row">
              <code>caption</code>
              <span style={{ fontSize: `${uiTokens.fontCaption}` }}>更新于今天 · 09:41</span>
            </div>
            <div className="language-type-row">
              <code>mono</code>
              <span style={{ fontFamily: `${uiTokens.mono}` }}>Aa 0123456789</span>
            </div>
          </section>
          <section className="language-sheet" aria-label="尺度与形状">
            <h3>
              尺度与形状 <small>Space & shape</small>
            </h3>
            <div className="language-spacing">
              {(
                [
                  [uiTokens.spaceGroup, "group"],
                  [uiTokens.spaceSection, "section"],
                  [uiTokens.spacePanel, "panel"],
                ] as const
              ).map(([token, label]) => (
                <div>
                  <code>{label}</code>
                  <span style={{ width: String(token) }} />
                </div>
              ))}
            </div>
            <div className="language-shapes">
              {(
                [
                  [uiTokens.controlRadius, "control"],
                  [uiTokens.panelRadius, "panel"],
                  [uiTokens.messageRadius, "message"],
                ] as const
              ).map(([token, label]) => (
                <div>
                  <span style={{ borderRadius: String(token) }} />
                  <code>{label}</code>
                </div>
              ))}
            </div>
            <p className="language-note">间距、字形与圆角随主题一起变化。</p>
          </section>
        </div>
      </section>
      <section className="language-band" aria-labelledby="language-components">
        <h2 id="language-components">
          <span>02</span> 组件与状态 <small>Components</small>
        </h2>
        <div className="language-grid">
          <section className="language-sheet" aria-label="操作">
            <h3>
              操作 <small>Actions</small>
            </h3>
            <div className="language-samples">
              <div className="workshop-row">
                <Button>保存修改</Button>
                <Button variant="outline">查看差异</Button>
                <Button variant="quiet">取消</Button>
              </div>
              <div className="workshop-row">
                <Button variant="danger">删除</Button>
                <Button disabled>不可用</Button>
                <Button variant="outline" disabled>
                  不可用
                </Button>
              </div>
              <div className="workshop-row">
                <Button size="small" variant="outline">
                  小尺寸
                </Button>
                <Button variant="outline">默认</Button>
                <Button size="large" variant="outline">
                  大尺寸
                </Button>
              </div>
              <Toolbar label="画板工具">
                <IconButton label="搜索">
                  <Icon name="search" />
                </IconButton>
                <IconButton label="查看文件">
                  <Icon name="file" />
                </IconButton>
                <Separator orientation="vertical" style={{ height: "20px" }} />
                <AddButton variant="quiet" aria-label="添加工作">
                  添加
                </AddButton>
              </Toolbar>
            </div>
          </section>
          <section className="language-sheet" aria-label="输入">
            <h3>
              输入 <small>Inputs</small>
            </h3>
            <div className="language-samples">
              <Field label="项目名称" htmlFor="theme-project">
                <Input id="theme-project" value="Meowland" />
              </Field>
              <div className="language-input-pair">
                <Field label="可见范围" htmlFor="language-visibility">
                  <Select id="language-visibility">
                    <option>仅自己</option>
                    <option>项目成员</option>
                  </Select>
                </Field>
                <Field label="只读示例" htmlFor="language-disabled">
                  <Input id="language-disabled" value="由组织管理" disabled />
                </Field>
              </div>
              <Field label="项目地址" htmlFor="language-invalid" error="请使用字母、数字或短横线。">
                <Input id="language-invalid" value="my project" />
              </Field>
            </div>
          </section>
          <section className="language-sheet" aria-label="导航与反馈">
            <h3>
              导航与反馈 <small>Navigation & feedback</small>
            </h3>
            <div className="workshop-navigation">
              <NavItem
                label="设计组件语言"
                icon={<Icon name="folder" />}
                active
                badge={<Badge>3</Badge>}
              />
              <NavItem label="审阅今天的修改" icon={<Icon name="file" />} />
            </div>
            <Separator />
            <div className="workshop-row">
              <Badge>草稿</Badge>
              <Badge tone="accent">进行中</Badge>
              <Badge tone="success">已同步</Badge>
              <Badge tone="warning">等待审阅</Badge>
              <Badge tone="danger">失败</Badge>
            </div>
            <Alert tone="info" title="保留当前工作">
              切换主题后，输入和展开状态保持不变。
            </Alert>
          </section>
        </div>
      </section>
      <section className="language-band" aria-labelledby="language-composition">
        <h2 id="language-composition">
          <span>03</span> 组合与阅读 <small>Composition</small>
        </h2>
        <div className="language-compositions">
          <div className="language-conversation">
            <div className="workshop-stack">
              <ChatHeader
                title="整理组件的设计语言"
                description="meowui · 本地演示"
                status={<ChatStatus label="就绪" tone="online" />}
              />
              <ChatMessageList>
                <ChatMessage role="user" author="你">
                  组件结构保持稳定，让不同的设计通过主题表达。
                </ChatMessage>
                <ChatMessage
                  role="assistant"
                  author="Assistant"
                  actions={
                    <ChatMessageActions>
                      <Button variant="quiet" size="small">
                        查看修改
                      </Button>
                    </ChatMessageActions>
                  }
                >
                  <p>先校准阅读与操作的比例，再用同一组组件检查两种语言。</p>
                  <ChatProcess label="已检查 3 类组件">
                    <ChatToolCall
                      label="校准组件边界"
                      state="complete"
                      detail="结构、状态和可访问性由组件提供；尺寸、材质和动态交由主题。"
                    />
                  </ChatProcess>
                </ChatMessage>
              </ChatMessageList>
              <ChatComposer
                placeholder="继续描述想改进的地方…"
                hint="本地示例，不会发送到服务"
                hintId="language-hint"
              >
                <AddButton variant="quiet" aria-label="添加附件">
                  附件
                </AddButton>
              </ChatComposer>
            </div>
            <p className="workshop-feedback" role="status" data-feedback>
              发送后显示本地回执，不调用模型。
            </p>
          </div>
          <aside className="language-context">
            <Card as="section">
              <div className="language-samples">
                <span className="language-eyebrow">PROJECT / 001</span>
                <h3>让细节形成整体</h3>
                <p>相同的文字、控件和状态，放进真实的阅读与操作关系中。</p>
                <Separator />
                <div className="workshop-row">
                  <Badge tone="success">已同步</Badge>
                  <span className="language-note">刚刚更新</span>
                </div>
                <Button variant="outline">查看项目</Button>
              </div>
            </Card>
            <div className="language-icon-strip" aria-label="图标样本">
              {(["folder", "file", "search", "plus", "eye", "arrow-right"] as const).map((name) => (
                <Icon name={name} size={20} />
              ))}
            </div>
            <p className="language-note">
              所有样本使用正式主题。可直接输入、展开过程，并用键盘查看焦点状态。
            </p>
          </aside>
        </div>
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const submit = (event: Event) => {
      event.preventDefault();
      const input = root.querySelector<HTMLTextAreaElement>("textarea")!;
      const feedback = root.querySelector<HTMLElement>("[data-feedback]")!;
      if (!input.value.trim()) {
        feedback.textContent = "先写下一句话，再发送。";
        input.focus();
        return;
      }
      feedback.textContent = `组件提交回调：${input.value}。输入保留。`;
      report(feedback.textContent);
    };
    root.addEventListener("submit", submit);
    onCleanup(() => {
      root.removeEventListener("submit", submit);
    });
  },
});

export const ContentCarriersStory = defineStory({
  id: "content-carriers",
  title: "内容 · 附件、来源与执行状态",
  group: "组合示例",
  groupOrder: 70,
  component: "ChatAttachments",
  variant: "附件与来源",
  description: "图片以缩略图辨认，文件显示名称和大小；详细过程与来源按需展开。",
  covers: [
    "ChatAttachments",
    "ChatSources",
    "ChatToolCall",
    "running / waiting / error",
    "long names",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatAttachments
        items={[
          {
            id: "image",
            name: "布局草图.svg",
            mediaType: "image/svg+xml",
            url:
              "data:image/svg+xml," +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#e6e8e5"/><rect x="20" y="20" width="70" height="140" rx="6" fill="#bdc5bd"/><rect x="108" y="20" width="192" height="84" rx="6" fill="#fafbf9"/><rect x="108" y="120" width="192" height="40" rx="6" fill="#fafbf9"/></svg>',
              ),
          },
          {
            id: "file",
            name: "组件设计语言与交互状态说明.md",
            mediaType: "text/markdown",
            sizeBytes: 2468,
            url: "data:text/plain,MeowUI%20design%20sample",
            onPreview: () =>
              (document.getElementById("attachment-preview") as HTMLDialogElement).showModal(),
          },
        ]}
      />
      <Dialog
        id="attachment-preview"
        labelledBy="attachment-title"
        describedBy="attachment-description"
      >
        <DialogPanel
          header={
            <DialogHeader
              title="组件设计语言与交互状态说明.md"
              titleId="attachment-title"
              description="内置 Markdown 示例 · 未读取本地文件"
              descriptionId="attachment-description"
            />
          }
        >
          <article className="workshop-document">
            <h3>让内容保持在前景</h3>
            <p>组件负责语义与操作，主题组织尺寸、颜色和反馈。</p>
            <p>切换表达时，正在进行的工作留在原处。</p>
          </article>
          <DialogActions>
            <Button data-close-preview>返回附件</Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
      <ChatToolCall
        label="检查组件状态"
        state="running"
        detail="这里是固定状态样例，不执行后台任务。"
      />
      <ChatToolCall label="等待确认修改范围" state="waiting" collapsible>
        <p>组件契约保持稳定，主题可以独立演进。</p>
      </ChatToolCall>
      <ChatToolCall label="示例连接中断" state="error" detail="保留输入，可在连接恢复后重试。" />
      <ChatSources
        items={[
          {
            title: "Apple Human Interface Guidelines",
            url: "https://developer.apple.com/design/human-interface-guidelines/typography",
            description: "桌面字体角色参考；Web 参数是本项目适配。",
          },
        ]}
      />
    </div>
  ),
  setup({ root, onCleanup }) {
    const dialog = root.querySelector<HTMLDialogElement>("#attachment-preview")!;
    const close = () => dialog.close();
    const button = root.querySelector<HTMLButtonElement>("[data-close-preview]")!;
    button.addEventListener("click", close);
    onCleanup(() => {
      button.removeEventListener("click", close);
      if (dialog.open) dialog.close();
    });
  },
});

export const ConversationStatesStory = defineStory({
  id: "conversation-states",
  title: "对话 · 角色与反馈状态",
  group: "组合示例",
  groupOrder: 70,
  component: "ChatMessage",
  variant: "角色与反馈",
  description: "固定状态样例：在线、等待、错误及生成中。没有后台任务或模型调用。",
  covers: [
    "ChatMessage roles",
    "complete / pending / streaming / error",
    "ChatStatus all tones",
    "continuation",
  ],
  render: () => (
    <div className="workshop-composition">
      <div className="workshop-row">
        <ChatStatus label="就绪" tone="online" />
        <ChatStatus label="处理中" tone="busy" />
        <ChatStatus label="等待确认" tone="waiting" />
        <ChatStatus label="连接中断" tone="error" />
        <ChatStatus label="未开始" tone="idle" />
      </div>
      <ChatFrame>
        <ChatMessageList>
          <ChatMessage role="system" author="系统" timestamp="09:41">
            已连接当前项目。
          </ChatMessage>
          <ChatMessage role="user" author="你" status="pending">
            帮我检查组件在窄屏上的表现。（等待发送）
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" status="streaming">
            正在检查按钮、输入和弹窗的布局…
          </ChatMessage>
          <ChatMessage role="tool" author="浏览器检查">
            已打开 390px 画布，保留原始内容。
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" status="error">
            连接中断，检查未完成。输入仍然保留。
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" continuation>
            恢复连接后可以继续检查。
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
    </div>
  ),
});
