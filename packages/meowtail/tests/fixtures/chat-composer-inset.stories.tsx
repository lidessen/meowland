import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Card, CardContent, Stack } from "meowtail";
import { ChatComposer, ChatFrame } from "meowtail/chat";

export const ChatComposerInsetFixture = defineStory({
  id: "chat-composer-inset",
  title: "Composer spacing ownership",
  render: () => (
    <Stack style={{ width: "100%", maxWidth: "390px" }}>
      <ChatFrame aria-label="Direct composer frame">
        <ChatComposer inputLabel="Direct draft" value="The same short draft" />
      </ChatFrame>
      <ChatFrame aria-label="Footer composer frame">
        <footer data-composer-container="footer" style={{ padding: "8px 20px" }}>
          <ChatComposer inputLabel="Footer draft" value="The same short draft" />
        </footer>
      </ChatFrame>
      <ChatFrame aria-label="Card composer frame">
        <Card>
          <CardContent data-composer-container="card">
            <ChatComposer inputLabel="Card draft" value="The same short draft" />
          </CardContent>
        </Card>
      </ChatFrame>
      <div data-composer-container="standalone">
        <ChatComposer inputLabel="Standalone draft" value="The same short draft" />
      </div>
    </Stack>
  ),
});
