import { h, type Child } from "meowjsx";
import { Badge, Button, ComposerPanel, Icon, IconButton, MetaRow } from "meowtail";

/**
 * Author scene: the page is a ComposerPanel with slots. No style/className is
 * used here; the panel, composer, rail, meta row and primitives own layout.
 */
export function ComposerPage(): Child {
  return (
    <ComposerPanel
      value="Continue — I'm wondering whether the component set is still too thin, especially for containers. Here's a simple example: if we want to write one…"
      placeholder="Continue, type a message…"
      inputLabel="Message"
      hint="Enter for a new line · Use Send to submit"
      hintId="reference-composer-hint"
      submitLabel="Send message"
      submitContent={<Icon name="arrow-up" />}
      trailing={[
        <Button variant="quiet" size="small">
          DeepSeek-V4.1-Flash <Badge tone="accent">1017</Badge>
        </Button>,
        <Button variant="quiet" size="small">
          Max <Icon name="chevron-down" />
        </Button>,
        <IconButton label="Voice input">
          <Icon name="mic" />
        </IconButton>,
      ]}
      meta={
        <MetaRow
          items={[
            {
              icon: <Icon name="gauge" />,
              label: "7 turns 162 steps",
            },
            {
              icon: <Icon name="timer" />,
              label: "219 tok/s",
            },
            {
              icon: <Icon name="database" />,
              label: "Cache hit 99.5%",
            },
          ]}
          progress={45}
          progressLabel="Cache progress"
          align="center"
        />
      }
    >
      <IconButton label="Add attachment">
        <Icon name="plus" />
      </IconButton>
      <Button variant="quiet" size="small">
        <Icon name="shield-check" /> Auto review <Icon name="chevron-down" />
      </Button>
    </ComposerPanel>
  );
}
