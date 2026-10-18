import { h, signal } from "meowjsx";
import { ChatToolCall, type ChatToolCallState } from "../../src/chat/tool-call";
import { OutputBlock } from "../../src/components/output-block";

const state = signal<ChatToolCallState>("queued");
const output = signal<string | undefined>(undefined);
const flag = signal(true);
const tool = (
  <ChatToolCall
    label={signal("Read")}
    state={state}
    statusLabel={signal("Waiting for approval")}
    input="data"
    output={output}
    outputSummary={signal("No public reply sent")}
    canRetry={flag}
    canCancel={flag}
    retryDisabled={flag}
    cancelDisabled={flag}
    onRetry={() => {}}
    onCancel={() => {}}
    collapsible
    labels={{ retry: "Try again" }}
  />
);
const block = (
  <OutputBlock
    title="Result"
    rows={signal<readonly string[]>(["one"])}
    copyText={signal("one")}
    wrap
  />
);
// @ts-expect-error Tool payloads are inert text, not executable or raw HTML objects.
const invalidPayload = <ChatToolCall label="Read" output={{ html: "<b>unsafe</b>" }} />;
// @ts-expect-error Execution state is a finite display contract.
const invalidState = <ChatToolCall label="Read" state="not-replied" />;
void tool;
void block;
void invalidPayload;
void invalidState;
