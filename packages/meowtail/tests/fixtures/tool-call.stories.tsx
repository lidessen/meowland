import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Stack } from "meowtail";
import { ChatToolCall, type ChatToolCallState } from "../../src/chat/tool-call";

export const ToolCallContract = defineStory({
  id: "tool-call-contract",
  title: "Tool call contract",
  render: () => {
    const state = signal<ChatToolCallState>("queued");
    const summary = signal<string | undefined>(
      "workspace/source/very-long-path/no-other-width-limit",
    );
    const status = signal("Queued; no execution reported");
    const output = signal<string | undefined>(
      Array.from(
        { length: 24 },
        (_, i) => `line ${i + 1}: ${"long result 长结果 ".repeat(8)}`,
      ).join("\n"),
    );
    const canRetry = signal(true);
    const retryDisabled = signal(false);
    const intents = signal("No intent");
    const update = () => {
      state.value = "running";
      status.value =
        "WaitingForTheIndependentWorkerToReturnItsResultWithoutPublishingAReply".repeat(3);
      output.value = `${output.value ?? ""}\nnew streamed line`;
    };
    return (
      <Stack style={{ width: "100%", maxWidth: "800px" }}>
        <Inline wrap>
          <Button onClick={update}>Update output</Button>
          <Button
            onClick={() => {
              output.value = "";
            }}
          >
            Empty output
          </Button>
          <Button
            onClick={() => {
              output.value = undefined;
            }}
          >
            Missing output
          </Button>
          <Button
            onClick={() => {
              canRetry.value = !canRetry.value;
            }}
          >
            Toggle retry
          </Button>
        </Inline>
        <Button
          onClick={() => {
            summary.value = undefined;
          }}
        >
          Missing summary
        </Button>
        <div style={{ width: "320px", maxWidth: "100%" }}>
          <ChatToolCall
            label={"check_" + "VeryLongToolName没有空格工具名称".repeat(6)}
            summary={summary}
            state={state}
            statusLabel={status}
            input={
              "<script>window.untrustedExecuted = true</script>\n" + "很长的中文输入".repeat(35)
            }
            output={output}
            outputSummary="The output is execution data; it does not imply a public reply."
            maxLines={8}
            collapsible
            onRetry={() => {
              intents.value = "Retry intent";
              retryDisabled.value = true;
            }}
            onCancel={() => {
              intents.value = "Cancel intent";
            }}
            retryDisabled={retryDisabled}
            canRetry={canRetry}
            labels={{
              input: "Input",
              output: "Output",
              emptyInput: "Empty input",
              emptyOutput: "Empty output",
              retry: "Retry",
              cancel: "Cancel",
            }}
          />
        </div>
        <ChatToolCall
          data-wide-tool
          label="Read long source material"
          summary={"/very-long-source-name".repeat(50)}
          state="cancelled"
          statusLabel="已取消"
          collapsible
        />
        <p role="status" data-tool-intents>
          {intents}
        </p>
      </Stack>
    );
  },
});
