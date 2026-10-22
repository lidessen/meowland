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
  Status,
  Toolbar,
} from "meowtail";
import { Note } from "./specimen";
import { Icon } from "meowtail/icons";
import { chatTokens, uiTokens } from "meowtail/theme";

export const DesignLanguageStory = defineStory({
  id: "design-language",
  title: "Design language · Panorama board",
  group: "Composition examples",
  groupOrder: 70,
  variant: "Design overview",
  description:
    "One standard theme: light and dark are explicit schemes; auto follows the system preference. Compare action hierarchy, current activity and readable states without losing input.",
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
          <h1>Design language</h1>
          <p>
            One standard theme, from quiet structure to clear actions and readable conversation.
          </p>
        </div>
        <span className="language-edition">
          Foundations · Components · Composition
          <br />
          Light · Dark · Auto follows your system
        </span>
      </header>
      <section className="language-band" aria-labelledby="language-foundations">
        <h2 id="language-foundations">
          <span>01</span> Foundation language <small>Foundations</small>
        </h2>
        <div className="language-grid language-foundations">
          <section className="language-sheet" aria-label="Color">
            <h3>
              Color <small>Color</small>
            </h3>
            <div className="language-palette">
              {(
                [
                  [uiTokens.surface.canvas, "Canvas"],
                  [uiTokens.surface.overlay, "Surface"],
                  [uiTokens.ink.primary, "Body text"],
                  [uiTokens.ink.secondary, "Secondary"],
                  [uiTokens.line.control, "Border"],
                  [uiTokens.action.primary, "Main action"],
                  [uiTokens.accent.base, "Current activity"],
                  [uiTokens.accent.selected, "Current location"],
                  [uiTokens.state.focus, "Focus"],
                ] as const
              ).map(([token, label]) => (
                <div className="language-swatch">
                  <span style={{ background: String(token) }} />
                  <strong>{label}</strong>
                  <code>{token.name.replace(/^--(?:ui-)?/, "")}</code>
                </div>
              ))}
            </div>
            <div className="language-semantic-colors">
              {[
                uiTokens.status.info,
                uiTokens.status.success,
                uiTokens.status.warning,
                uiTokens.status.danger,
              ].map((token) => (
                <span>
                  <i style={{ background: String(token) }} />
                  <code>{token.name.replace("--ui-", "")}</code>
                </span>
              ))}
            </div>
            <p className="language-note">
              Primary is black or white. Accent marks current activity and location; status colors
              explain what happened.
            </p>
          </section>
          <section className="language-sheet" aria-label="Typography">
            <h3>
              Typography <small>Typography</small>
            </h3>
            <div className="language-type-specimen">
              Aa <span>Aa</span>
            </div>
            <div className="language-type-row">
              <code>display</code>
              <strong className="language-display-specimen">A place to think</strong>
            </div>
            <div className="language-type-row">
              <code>UI</code>
              <span style={{ fontSize: `${uiTokens.type.body}` }}>
                14px · Project settings and action labels
              </span>
            </div>
            <div className="language-type-row">
              <code>chat</code>
              <span style={{ fontSize: `${chatTokens.fontBody}` }}>
                15px · Give conversation room to read.
              </span>
            </div>
            <div className="language-type-row">
              <code>meta</code>
              <span style={{ fontSize: `${uiTokens.type.caption}` }}>
                12px · Updated today · 09:41
              </span>
            </div>
            <div className="language-type-row">
              <code>mono</code>
              <span style={{ fontFamily: `${uiTokens.type.mono}` }}>Aa 0123456789</span>
            </div>
            <p className="language-note">
              Display serif gives page and section titles a voice. UI and conversation keep the
              familiar sans serif for controls and continuous reading.
            </p>
          </section>
          <section className="language-sheet" aria-label="Scale and shape">
            <h3>
              Scale and shape <small>Space & shape</small>
            </h3>
            <div className="language-spacing">
              {(
                [
                  [uiTokens.space.group, "group"],
                  [uiTokens.space.section, "section"],
                  [uiTokens.space.panel, "panel"],
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
                  [uiTokens.radius.lg, "control"],
                  [uiTokens.radius.xl, "panel"],
                  [chatTokens.bubbleRadius, "message"],
                ] as const
              ).map(([token, label]) => (
                <div>
                  <span style={{ borderRadius: String(token) }} />
                  <code>{label}</code>
                </div>
              ))}
            </div>
            <p className="language-note">
              Shared spacing and shape keep the same roles in light, dark and auto schemes.
            </p>
          </section>
        </div>
      </section>
      <section className="language-band" aria-labelledby="language-components">
        <h2 id="language-components">
          <span>02</span> Components and states <small>Components</small>
        </h2>
        <div className="language-grid">
          <section className="language-sheet" aria-label="Actions">
            <h3>
              Actions <small>Actions</small>
            </h3>
            <div className="language-samples">
              <p className="language-note">
                Edit a project · Main action, alternative, then dismissal
              </p>
              <div className="workshop-row">
                <Button data-language-action="Changes saved in this local example.">Save</Button>
                <Button variant="outline" data-language-action="The local diff is ready to review.">
                  View diff
                </Button>
                <Button
                  variant="quiet"
                  data-language-action="Editing dismissed in this local example."
                >
                  Cancel
                </Button>
              </div>
              <p className="language-note">
                Running work · Interrupt execution or inspect its activity
              </p>
              <div className="workshop-row">
                <Button
                  variant="stop"
                  data-language-action="The example run was stopped; saved work is retained."
                >
                  Stop run
                </Button>
                <Button
                  variant="accent"
                  data-language-action="Showing the current activity in this local example."
                >
                  View activity
                </Button>
              </div>
              <p className="language-note">
                Destructive confirmation · Remove the selected project
              </p>
              <div className="workshop-row">
                <Button
                  variant="danger"
                  data-language-action="Deletion confirmed in this local example; no project was removed."
                >
                  Delete project
                </Button>
                <Button variant="quiet" data-language-action="The example project was kept.">
                  Keep project
                </Button>
              </div>
              <p className="language-note" role="status" data-language-feedback>
                Local examples · Choose an action to see its receipt.
              </p>
              <div className="workshop-row">
                <Button size="small" variant="outline">
                  Small
                </Button>
                <Button variant="outline">Default</Button>
                <Button size="large" variant="outline">
                  Large
                </Button>
              </div>
              <Toolbar label="Board tools">
                <IconButton label="Search">
                  <Icon name="search" />
                </IconButton>
                <IconButton label="View file">
                  <Icon name="file" />
                </IconButton>
                <Separator orientation="vertical" style={{ height: "20px" }} />
                <AddButton variant="quiet" aria-label="Add work">
                  Add
                </AddButton>
              </Toolbar>
            </div>
          </section>
          <section className="language-sheet" aria-label="Inputs">
            <h3>
              Inputs <small>Inputs</small>
            </h3>
            <div className="language-samples">
              <Field label="Project name" htmlFor="theme-project">
                <Input id="theme-project" value="Meowland" />
              </Field>
              <div className="language-input-pair">
                <Field label="Visibility" htmlFor="language-visibility">
                  <Select id="language-visibility">
                    <option>Only me</option>
                    <option>Project members</option>
                  </Select>
                </Field>
                <Field label="Read-only example" htmlFor="language-disabled">
                  <Input id="language-disabled" value="Managed by the organization" disabled />
                </Field>
              </div>
              <Field
                label="Project address"
                htmlFor="language-invalid"
                error="Use letters, numbers or hyphens."
              >
                <Input id="language-invalid" value="my project" />
              </Field>
            </div>
          </section>
          <section className="language-sheet" aria-label="Navigation and feedback">
            <h3>
              Navigation and feedback <small>Navigation & feedback</small>
            </h3>
            <div className="workshop-navigation">
              <NavItem
                label="Design component language"
                icon={<Icon name="folder" />}
                active
                badge={<Badge>3</Badge>}
              />
              <NavItem label="Review today's changes" icon={<Icon name="file" />} />
            </div>
            <Separator />
            <div className="workshop-row">
              <Badge>Draft</Badge>
              <Badge tone="accent">In progress</Badge>
              <Badge tone="success">Synced</Badge>
              <Badge tone="warning">Waiting for review</Badge>
              <Badge tone="danger">Failed</Badge>
            </div>
            <div className="language-samples" aria-label="Execution state meanings">
              <Status state="processing" label="Processing · Work is happening now" />
              <Status state="success" label="Success · The goal is confirmed complete" />
              <Status
                state="returned"
                label="Returned · Execution ended; the goal needs checking"
              />
              <Status state="unknown" label="Unknown · Current state has not been verified" />
              <Status state="idle" label="Idle · Known to be standing by" />
            </div>
            <Alert tone="info" title="Keep the current work">
              Light and dark choose an appearance. Auto follows the system. Changing scheme keeps
              input and expanded process in place.
            </Alert>
          </section>
        </div>
      </section>
      <section className="language-band" aria-labelledby="language-composition">
        <h2 id="language-composition">
          <span>03</span> Composition and reading <small>Composition</small>
        </h2>
        <div className="language-compositions">
          <div className="language-conversation">
            <div className="workshop-stack">
              <ChatHeader
                title="Organize the component design language"
                description="meowtail · Local demo"
                status={<ChatStatus label="Ready" tone="online" />}
              />
              <ChatMessageList>
                <ChatMessage role="user" author="You">
                  Make the next action clear, and keep the current work easy to find.
                </ChatMessage>
                <ChatMessage
                  role="assistant"
                  author="Assistant"
                  actions={
                    <ChatMessageActions>
                      <Button variant="quiet" size="small">
                        View changes
                      </Button>
                    </ChatMessageActions>
                  }
                >
                  <p>
                    Save leads the action group. The accent marks current activity, while
                    conversation uses a little more reading space than the surrounding controls.
                  </p>
                  <ChatProcess label="Checked 3 kinds of components">
                    <ChatToolCall
                      label="Calibrate component boundaries"
                      state="complete"
                      detail="Structure, state and accessibility come from components; size, material and motion come from themes."
                    />
                  </ChatProcess>
                </ChatMessage>
              </ChatMessageList>
              <ChatComposer
                placeholder="Keep describing what you want to improve…"
                hint="Local example; nothing is sent to a service"
                hintId="language-hint"
              >
                <AddButton variant="quiet" aria-label="Add attachment">
                  Attachment
                </AddButton>
              </ChatComposer>
            </div>
            <Note role="status" data-feedback>
              A local receipt appears after sending; no model is called.
            </Note>
          </div>
          <aside className="language-context">
            <Card as="section">
              <div className="language-samples">
                <span className="language-eyebrow">PROJECT / 001</span>
                <h3>Let details form a whole</h3>
                <p>
                  The same words, controls and states placed in real reading and action
                  relationships.
                </p>
                <Separator />
                <div className="workshop-row">
                  <Badge tone="success">Synced</Badge>
                  <span className="language-note">Updated just now</span>
                </div>
                <Button variant="outline">View project</Button>
              </div>
            </Card>
            <div className="language-icon-strip" aria-label="Icon samples">
              {(["folder", "file", "search", "plus", "eye", "arrow-right"] as const).map((name) => (
                <Icon name={name} size={20} />
              ))}
            </div>
            <p className="language-note">
              All samples use the real theme. You can type, expand process and check focus states
              with the keyboard.
            </p>
          </aside>
        </div>
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const action = (event: Event) => {
      const button = (event.target as Element).closest<HTMLElement>("[data-language-action]");
      if (!button || !root.contains(button)) return;
      const feedback = root.querySelector<HTMLElement>("[data-language-feedback]")!;
      feedback.textContent = button.dataset.languageAction!;
      report(feedback.textContent);
    };
    const submit = (event: Event) => {
      event.preventDefault();
      const input = root.querySelector<HTMLTextAreaElement>("textarea")!;
      const feedback = root.querySelector<HTMLElement>("[data-feedback]")!;
      if (!input.value.trim()) {
        feedback.textContent = "Write a sentence before sending.";
        input.focus();
        return;
      }
      feedback.textContent = `Component submit callback: ${input.value}. Input retained.`;
      report(feedback.textContent);
    };
    root.addEventListener("click", action);
    root.addEventListener("submit", submit);
    onCleanup(() => {
      root.removeEventListener("click", action);
      root.removeEventListener("submit", submit);
    });
  },
});

export const ContentCarriersStory = defineStory({
  id: "content-carriers",
  title: "Content · Attachments, sources and execution states",
  group: "Composition examples",
  groupOrder: 70,
  component: "ChatAttachments",
  variant: "Attachments and sources",
  description:
    "Images are recognized by thumbnail and files show name and size; detailed process and sources expand on demand.",
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
            name: "layout-sketch.svg",
            mediaType: "image/svg+xml",
            url:
              "data:image/svg+xml," +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect width="320" height="180" fill="#e6e8e5"/><rect x="20" y="20" width="70" height="140" rx="6" fill="#bdc5bd"/><rect x="108" y="20" width="192" height="84" rx="6" fill="#fafbf9"/><rect x="108" y="120" width="192" height="40" rx="6" fill="#fafbf9"/></svg>',
              ),
          },
          {
            id: "file",
            name: "component-design-language-and-interaction-states.md",
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
              title="component-design-language-and-interaction-states.md"
              titleId="attachment-title"
              description="Built-in Markdown example · No local file was read"
              descriptionId="attachment-description"
            />
          }
        >
          <article className="workshop-document">
            <h3>Keep content in the foreground</h3>
            <p>Components own semantics and actions; themes organize size, color and feedback.</p>
            <p>When changing scheme, work in progress stays in place.</p>
          </article>
          <DialogActions>
            <Button data-close-preview>Back to attachments</Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
      <ChatToolCall
        label="Check component states"
        state="running"
        detail="This is a fixed-state example; no background task runs."
      />
      <ChatToolCall label="Waiting to confirm the change scope" state="waiting" collapsible>
        <p>The component contract stays stable, and themes can evolve independently.</p>
      </ChatToolCall>
      <ChatToolCall
        label="Example connection lost"
        state="error"
        detail="Input is kept; retry once the connection returns."
      />
      <ChatSources
        items={[
          {
            title: "Apple Human Interface Guidelines",
            url: "https://developer.apple.com/design/human-interface-guidelines/typography",
            description:
              "Desktop type role reference; the Web parameters are this project's adaptation.",
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
  title: "Conversation · Roles and feedback states",
  group: "Composition examples",
  groupOrder: 70,
  component: "ChatMessage",
  variant: "Roles and feedback",
  description:
    "Fixed-state examples: online, waiting, error and generating. There is no background task or model call.",
  covers: [
    "ChatMessage roles",
    "complete / pending / streaming / error",
    "ChatStatus all tones",
    "continuation",
  ],
  render: () => (
    <div className="workshop-composition">
      <div className="workshop-row">
        <ChatStatus label="Ready" tone="online" />
        <ChatStatus label="In progress" tone="busy" />
        <ChatStatus label="Waiting for confirmation" tone="waiting" />
        <ChatStatus label="Connection lost" tone="error" />
        <ChatStatus label="Not started" tone="idle" />
      </div>
      <ChatFrame>
        <ChatMessageList>
          <ChatMessage role="system" author="System" timestamp="09:41">
            Connected to the current project.
          </ChatMessage>
          <ChatMessage role="user" author="You" status="pending">
            Check how the components behave on a narrow screen. (Waiting to send)
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" status="streaming">
            Checking the layout of buttons, inputs and dialogs…
          </ChatMessage>
          <ChatMessage role="tool" author="Browser check">
            Opened the 390px canvas and kept the original content.
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" status="error">
            The connection was lost and the check did not finish. Input is still kept.
          </ChatMessage>
          <ChatMessage role="assistant" author="Assistant" continuation>
            Checking can continue once the connection returns.
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
    </div>
  ),
});
