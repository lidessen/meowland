import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, ChatHeader, ChatStatus, Stack } from "meowtail";

export const ChatHeaderStory = defineStory({
  id: "chat-header",
  title: "会话标题 · 状态与操作",
  component: "ChatHeader",
  group: "对话组件",
  groupOrder: 50,
  variant: "窄屏与长标题",
  render: () => (
    <Stack>
      <ChatHeader title="Assistant" />
      <ChatHeader
        eyebrow="当前项目"
        title="重新检查组件的文字、图标、暗色表面与窄屏交互"
        description="保留工作上下文，状态与操作在窄屏中自然换行。"
        status={<ChatStatus tone="busy" label="正在处理" />}
        actions={
          <Button variant="outline" size="small">
            停止
          </Button>
        }
      />
      <ChatHeader
        title="等待你的决定"
        status={<ChatStatus tone="waiting" label="等待确认" />}
        actions={<Button size="small">查看请求</Button>}
      />
    </Stack>
  ),
});
