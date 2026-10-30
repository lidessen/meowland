import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, ChatHeader, ChatStatus, Stack } from "meowtail";

export const ChatHeaderStory = defineStory({
  id: "chat-header",
  title: "Chat Header · Status and actions",
  group: "Agent and conversation",
  groupOrder: 90,
  component: "ChatHeader",
  variant: "Narrow screen and long title",
  render: () => (
    <Stack>
      <ChatHeader title="Assistant" />
      <ChatHeader
        eyebrow="Current project"
        title="Review the component's text, icons, dark surfaces, and narrow-screen interactions"
        description="Keeps the work context; status and actions wrap naturally on narrow screens."
        status={<ChatStatus tone="busy" label="Processing" />}
        actions={
          <Button variant="outline" size="small">
            Stop
          </Button>
        }
      />
      <ChatHeader
        title="Waiting for your decision"
        status={<ChatStatus tone="waiting" label="Waiting for confirmation" />}
        actions={<Button size="small">View request</Button>}
      />
    </Stack>
  ),
});
