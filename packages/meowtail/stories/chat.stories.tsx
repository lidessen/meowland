import { h, signal } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import {
  Button,
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
  Icon,
  IconButton,
  AssistantMark,
} from "meowtail";
import { Note } from "./specimen";

export const MessagePartsStory = defineStory({
  id: "message-parts",
  title: "Message · Avatar, long title, and actions",
  group: "Conversation components",
  groupOrder: 50,
  component: "ChatMessage",
  variant: "Avatar and actions",
  description:
    "The avatar, author, time, body, and actions of one conversation; long content must not crowd out actions or break narrow screens.",
  covers: [
    "ChatHeader all parts",
    "ChatMessage avatar/time/actions",
    "ChatFrame",
    "ChatMessageList custom label",
    "long text",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatFrame>
        <ChatHeader
          eyebrow="Current project"
          title="Review the component's text, icons, dark surfaces, and narrow-screen interactions"
          description="The title and description wrap when space runs out without hiding the work context."
          status={<ChatStatus label="Waiting for review" tone="waiting" />}
          actions={
            <IconButton label="View conversation information" data-message-info>
              <Icon name="eye" />
            </IconButton>
          }
        />
        <ChatMessageList ariaLabel="Component review sample messages">
          <ChatMessage
            role="assistant"
            author="Assistant handling the component review"
            timestamp="09:41"
            avatar={<AssistantMark />}
            actions={
              <ChatMessageActions>
                <Button variant="quiet" size="small" data-message-action="Marked this reply.">
                  Mark reply
                </Button>
                <IconButton label="Reply details" data-message-info>
                  <Icon name="eye" />
                </IconButton>
                <Button variant="quiet" size="small" disabled>
                  Waiting for check results
                </Button>
              </ChatMessageActions>
            }
          >
            <p>
              The title, author, and actions must keep the reading order together. Longer paths
              should also stay inside the current container:
            </p>
            <p>
              packages/meowtail/stories/review-of-typography-and-component-interaction-states.tsx
            </p>
          </ChatMessage>
          <ChatMessage
            role="assistant"
            author="Assistant handling the component review"
            continuation
            timestamp="09:42"
            avatar={<AssistantMark />}
          >
            Continues the previous reply in the same column: the avatar slot stays but goes blank,
            and the author line keeps the turn attributed.
          </ChatMessage>
          <ChatMessage
            role="user"
            author="You"
            timestamp="09:43"
            avatar={<Icon name="user-round" />}
          >
            Keep the relationship between input, messages, and attachments, and make sure long
            content stays fully readable.
          </ChatMessage>
          <ChatMessage
            role="assistant"
            author="Assistant"
            timestamp="09:44"
            actions={
              <ChatMessageActions>
                <Button data-message-action="Opened the local suggestion sample.">
                  Review suggestion
                </Button>
                <Button variant="outline" data-message-action="Opened the local diff sample.">
                  View diff
                </Button>
                <button
                  type="button"
                  data-message-action="Kept the check record; you can come back later"
                >
                  Handle later
                </button>
              </ChatMessageActions>
            }
          >
            <p>
              The check record is ready. You can review the suggestion first and then decide whether
              to adopt it, or keep the record and handle it later.
            </p>
          </ChatMessage>
        </ChatMessageList>
      </ChatFrame>
      <ChatHeader title="Compact conversation with a title only" />
      <Note role="status" data-message-feedback>
        Actions only report back to the local sample.
      </Note>
    </div>
  ),
  setup({ root, onCleanup }) {
    const click = (event: Event) => {
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-message-action], [data-message-info]",
      );
      if (target)
        root.querySelector("[data-message-feedback]")!.textContent =
          target.dataset.messageAction ??
          "This is a component review sample with no real conversation data.";
    };
    root.addEventListener("click", click);
    onCleanup(() => root.removeEventListener("click", click));
  },
});

export const ComposerRecoveryStory = defineStory({
  id: "composer-recovery",
  title: "Composer · Send, failure, and recovery",
  group: "Conversation components",
  groupOrder: 50,
  component: "ChatComposer",
  variant: "Sending and recovery",
  description:
    "Local simulated states are advanced by hand, with no timer or network. You can keep editing while waiting; submitted content and the latest draft are kept separately.",
  covers: [
    "ChatComposer value/placeholder/hint/submitLabel/submitDisabled",
    "onInput/onSubmit",
    "pending/error/recovery",
    "long hint",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatComposer
        value="Check component states in light and dark themes, and keep this input I am editing."
        submitLabel="Submit check"
        hint="Local send simulation: you can keep writing while waiting, and the latest draft is not cleared."
        hintId="recovery-hint"
      >
        <IconButton label="Attachments not available yet" disabled>
          <Icon name="plus" />
        </IconButton>
      </ChatComposer>
      <Note data-composer-submitted>No content submitted yet.</Note>
      <div className="workshop-row">
        <Button variant="outline" data-composer-result="failure" disabled>
          Simulate failure
        </Button>
        <Button variant="outline" data-composer-result="success" disabled>
          Simulate success
        </Button>
        <Button variant="quiet" data-composer-recover disabled>
          Recover and keep editing
        </Button>
      </div>
      <Note role="status" data-composer-feedback>
        Waiting for submission. Local demo only.
      </Note>
    </div>
  ),
  setup({ root, onCleanup }) {
    const form = root.querySelector("form")!;
    const input = root.querySelector("textarea")!;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const feedback = root.querySelector("[data-composer-feedback]")!;
    const submitted = root.querySelector("[data-composer-submitted]")!;
    const results = [...root.querySelectorAll<HTMLButtonElement>("[data-composer-result]")];
    const recover = root.querySelector<HTMLButtonElement>("[data-composer-recover]")!;
    const send = (event: Event) => {
      event.preventDefault();
      if (submit.disabled) return;
      if (!input.value.trim()) {
        feedback.textContent = "Enter the check request first.";
        input.focus();
        return;
      }
      submitted.textContent = `This submission: ${input.value}`;
      submit.disabled = true;
      results.forEach((button) => {
        button.disabled = false;
      });
      feedback.textContent =
        "Accepted the local send simulation and waiting for a result. You can keep editing the next draft.";
    };
    const click = (event: Event) => {
      const result = (event.target as Element).closest<HTMLElement>("[data-composer-result]");
      if (result) {
        results.forEach((button) => {
          button.disabled = true;
        });
        recover.disabled = false;
        feedback.textContent =
          result.dataset.composerResult === "failure"
            ? "Simulated connection failure. Not completed yet; you can recover and retry."
            : "The local check sample completed; you can keep editing.";
        recover.focus();
      }
      if ((event.target as Element).closest("[data-composer-recover]")) {
        submit.disabled = false;
        recover.disabled = true;
        feedback.textContent = "Recovered; the input is unchanged.";
        input.focus();
      }
    };
    const edit = () => {
      feedback.textContent = submit.disabled
        ? "Editing the latest draft; the previously submitted content is unchanged, and you can submit again after the result or recovery."
        : "Editing; the latest changes have not been submitted.";
    };
    form.addEventListener("submit", send);
    input.addEventListener("input", edit);
    root.addEventListener("click", click);
    onCleanup(() => {
      form.removeEventListener("submit", send);
      input.removeEventListener("input", edit);
      root.removeEventListener("click", click);
    });
  },
});

export const ExecutionDetailsStory = defineStory({
  id: "execution-details",
  title: "Execution · Four states and expansion on demand",
  group: "Conversation components",
  groupOrder: 50,
  component: "ChatToolCall",
  variant: "Execution and evidence",
  description:
    "Static states and real native expansion behavior are separate: each of the four states shows both a plain and a collapsible carrier.",
  covers: [
    "ChatToolCall running/complete/waiting/error × collapsible",
    "ChatProcess open/closed",
    "ChatSources open/closed/custom label/no description/empty",
  ],
  render: () => (
    <div className="workshop-composition">
      <ChatProcess label="Expanded check evidence" open>
        <p>
          This content shows only component states; it does not mean a real project was checked.
        </p>
      </ChatProcess>
      <ChatProcess label="Supporting process you expand when needed">
        <p>Tab to the heading, then use Enter or Space to expand and the same keys to collapse.</p>
      </ChatProcess>
      {(["running", "complete", "waiting", "error"] as const).map((state) => (
        <section className="workshop-section" aria-label={`${state} execution state`}>
          <ChatToolCall
            icon={<Icon name="list-checks" />}
            label={`Component check · ${state}`}
            state={state}
            detail="The plain carrier shows the evidence directly."
          />
          <ChatToolCall
            icon={<Icon name="list-checks" />}
            label={`Expand the full check details and follow-up notes for ${state}`}
            state={state}
            collapsible
            detail="The summary and details belong to the same execution."
          >
            <p>
              Continue checking how the long path
              packages/meowtail/src/theme/components-and-conversation-state-review.ts is displayed.
            </p>
          </ChatToolCall>
        </section>
      ))}
      <ChatSources
        label="Design evidence"
        open
        items={[
          {
            title: "Apple's typography roles on desktop and the boundary of local Web adaptation",
            url: "https://developer.apple.com/design/human-interface-guidelines/typography",
            description:
              "Source titles and descriptions can wrap; opening the link leaves the local sample.",
          },
          {
            title: "Source without a supporting description",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
          },
        ]}
      />
      <ChatSources items={[]} />
    </div>
  ),
});

export const ExecutionWorkflowStory = defineStory({
  id: "execution-workflow",
  title: "Execution · Task, progress, and actual results",
  group: "Conversation components",
  groupOrder: 50,
  component: "ChatToolCall",
  variant: "Execution within a conversation",
  description:
    "A fixed engineering example: identify what was done while collapsed, then check the command and result when expanded. Running, waiting, and failure each describe the current progress; no command is executed and no model is requested.",
  covers: [
    "ChatToolCall concrete task and result",
    "running/complete/waiting/error",
    "collapsed and initially open",
    "long command/output on narrow viewport",
    "ChatProcess grouped execution",
  ],
  render: () => (
    <ChatFrame>
      <ChatMessageList ariaLabel="Order summary fix sample">
        <ChatMessage role="user" author="You">
          Fix how the order summary handles special SKUs, add regression tests, and update the
          changelog.
        </ChatMessage>
        <ChatMessage role="assistant" author="Assistant">
          <p>
            I'll check the summary logic first, then review the test results for special key names
            and empty orders.
          </p>
          <ChatProcess label="Checks and changes · 3 items" open>
            <ChatToolCall
              icon={<Icon name="file-text" />}
              label="Read the order summary and tests"
              state="complete"
              collapsible
            >
              <p>
                Read <code>orders.ts</code> and <code>orders.test.ts</code>. The summary object uses
                a plain object, so <code>__proto__</code> and <code>constructor</code> hit prototype
                properties.
              </p>
            </ChatToolCall>
            <ChatToolCall
              icon={<Icon name="file-text" />}
              label="Fix the summary for special SKUs"
              state="complete"
              collapsible
            >
              <p>
                Store SKU counts with <code>Object.create(null)</code> while keeping the existing
                return fields. Added regression tests for special key names and updated{" "}
                <code>CHANGELOG.md</code>.
              </p>
            </ChatToolCall>
            <ChatToolCall
              icon={<Icon name="terminal" />}
              label="Run the order summary tests"
              state="complete"
              collapsible
              open
            >
              <pre>
                <code>{`$ bun test orders.test.ts

✓ empty orders return zero counts
✓ counts only paid orders
✓ merges quantities for duplicate SKUs
✓ supports __proto__, constructor, toString

4 pass · 0 fail · 10 expect calls
Exit code 0`}</code>
              </pre>
            </ChatToolCall>
          </ChatProcess>
          <p>
            The fix and regression tests are complete. Expand the process to check the change
            evidence and test output.
          </p>
        </ChatMessage>
        <ChatMessage role="assistant" author="Assistant" continuation>
          <ChatToolCall
            icon={<Icon name="file-text" />}
            label="Check component library types"
            state="running"
            collapsible
            open
            detail="Started checking MeowUI; no final result yet."
          >
            <pre>
              <code>{`$ bun run --filter meowtail typecheck
Checking packages/meowtail/src/chat/tool-call.tsx`}</code>
            </pre>
          </ChatToolCall>
          <ChatToolCall
            icon={<Icon name="terminal" />}
            label="Install project dependencies"
            state="waiting"
            collapsible
            detail="Waiting for permission to access the dependency repository; nothing installed yet."
          >
            <p>
              <code>bun install</code> needs to download the missing dependencies. During the wait,
              file changes that are already done are kept.
            </p>
          </ChatToolCall>
          <ChatToolCall
            icon={<Icon name="terminal" />}
            label="Check formatting across the repository"
            state="error"
            collapsible
            open
          >
            <pre>
              <code>{`$ bun run format:check
[warn] packages/meowtail/stories/conversation/long-running-execution-and-recovery.stories.tsx
[warn] Code style issues found in the above file.
Exit code 1`}</code>
            </pre>
            <p>
              The format check did not pass; this result is not a typecheck or test failure. Recheck
              after fixing the formatting.
            </p>
          </ChatToolCall>
        </ChatMessage>
      </ChatMessageList>
    </ChatFrame>
  ),
});

export const AttachmentScaleStory = defineStory({
  id: "attachment-scales",
  title: "Attachments · Ratios, sizes, and missing information",
  group: "Conversation components",
  groupOrder: 50,
  component: "ChatAttachments",
  variant: "Ratios and missing information",
  description:
    "Wide images, tall images, and files each use their own carrier. Downloads are built-in samples; no local file is read.",
  covers: [
    "ChatAttachments image/file",
    "host download callback/default link",
    "wide/tall image",
    "zero/KB/MB/unknown size",
    "long filename",
    "empty list/custom label",
  ],
  render: () => {
    const downloadFeedback = signal("Host download callback sample; no service is connected.");
    return (
      <div className="workshop-composition">
        <ChatAttachments
          label="Image ratio samples"
          items={[
            {
              id: "wide",
              name: "wide-structure-diagram.svg",
              mediaType: "image/svg+xml",
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#fae8ff"/></linearGradient></defs><rect width="600" height="120" fill="url(#bg)"/><text x="300.0" y="60.0" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="500" fill="#4f46e5" fill-opacity="0.7">600 × 120</text></svg>',
                ),
            },
            {
              id: "tall",
              name: "tall-structure-diagram.svg",
              mediaType: "image/svg+xml",
              url:
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="360" viewBox="0 0 120 360"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0e7ff"/><stop offset="1" stop-color="#fae8ff"/></linearGradient></defs><rect width="120" height="360" fill="url(#bg)"/><text x="60.0" y="180.0" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="500" fill="#4f46e5" fill-opacity="0.7">120 × 360</text></svg>',
                ),
            },
          ]}
        />
        <ChatAttachments
          label="File size samples"
          items={[
            {
              id: "zero",
              name: "empty.txt",
              mediaType: "text/plain",
              sizeBytes: 0,
              url: "data:text/plain,",
            },
            {
              id: "kb",
              name: "component-design-language-and-all-interaction-state-check-records-with-follow-up-change-suggestions.md",
              mediaType: "text/markdown",
              sizeBytes: 2860,
              url: "data:text/plain,Example",
            },
            {
              id: "mb",
              name: "reference.pdf",
              mediaType: "application/pdf",
              sizeBytes: 1572864,
              url: "data:text/plain,Fixture%20metadata%20only",
            },
            {
              id: "unknown",
              name: "size-not-provided.txt",
              mediaType: "text/plain",
              url: "data:text/plain,Unknown%20size",
            },
          ]}
        />
        <Note>
          File sizes are fixed display data and do not claim to match the actual byte count of the
          downloaded content.
        </Note>
        <ChatAttachments
          label="Host download callback sample"
          items={[
            {
              id: "host-download",
              name: "protected-document.txt",
              mediaType: "text/plain",
              url: "data:text/plain,Host%20download%20example",
              onDownload: () =>
                downloadFeedback.set("The host took over the download; local sample only."),
            },
          ]}
        />
        <Note role="status" data-attachment-download-feedback>
          {downloadFeedback}
        </Note>
        <ChatAttachments label="No attachments" items={[]} />
      </div>
    );
  },
});
