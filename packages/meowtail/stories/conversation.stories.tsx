import { uiTokens } from "meowtail/theme";
import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { ChatConversation, ChatMessageList, ChatMessage, Button, Stack, Inline } from "meowtail";

export const ConversationReading = defineStory({
  id: "chat-conversation",
  title: "对话阅读 · 持续更新与回看",
  component: "ChatConversation",
  variant: "阅读连续性",
  group: "对话组件",
  groupOrder: 50,
  description:
    "先向上阅读，再增加回复；阅读位置保持不动。返回动作位于正文视口之后，不覆盖历史文字；回到最新后继续跟随。按钮只更新本地示例，收起再展开会重新挂载阅读区。",
  covers: [
    "ChatConversation",
    "ChatMessageList",
    "streaming",
    "scroll",
    "normal-flow latest",
    "cleanup",
  ],
  render: () => {
    let count = 8;
    const renderMessages = (): Child =>
      Array.from({ length: count }, (_, index) => (
        <ChatMessage
          role={index % 2 ? "assistant" : "user"}
          author={index % 2 ? "Assistant" : "你"}
        >
          <p>
            {index % 2
              ? `第 ${index + 1} 条回复：我检查了页面的窄屏布局。长文件名需要保留完整名称，工具反馈应留在对应消息旁。`
              : `第 ${index + 1} 条消息：继续检查项目的阅读体验，并说明需要我决定的事项。`}
          </p>
          {index % 2 ? (
            <p>
              这一段是用于观察滚动的本地内容。向上回看时，新回复不会要求你离开当前阅读位置；准备好以后，可以主动回到最新消息。
            </p>
          ) : null}
        </ChatMessage>
      ));
    const messages = signal<Child>(renderMessages());
    const latestText = signal("");
    const makeView = () => (
      <ChatConversation
        ariaLabel="示例对话阅读区"
        style={{
          height: "360px",
          border: `1px solid ${uiTokens.border}`,
          borderRadius: `${uiTokens.controlRadius}`,
        }}
      >
        <ChatMessageList>
          {messages}
          <p>{latestText}</p>
        </ChatMessageList>
      </ChatConversation>
    );
    const view = signal<Child>(makeView());
    let mounted = true;
    return (
      <Stack>
        <Inline wrap>
          <Button
            variant="outline"
            onClick={() => {
              count += 1;
              messages.value = renderMessages();
            }}
          >
            增加一条回复
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              latestText.value += "继续补充当前回复：检查内容变化时的阅读位置。";
            }}
          >
            继续当前回复
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              mounted = !mounted;
              view.value = mounted ? makeView() : <p>阅读区已收起。</p>;
            }}
          >
            收起 / 展开阅读区
          </Button>
        </Inline>
        {view}
      </Stack>
    );
  },
});
