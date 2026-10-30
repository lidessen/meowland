import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Badge, Button, Inline, Pill, Stack } from "meowtail";

export const PillStory = defineStory({
  id: "pill-tags",
  title: "Pill · Filters and status tags",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "Pill",
  description: "24px pill buttons and 20px read-only tags; the caller owns the selection state.",
  render() {
    const active = signal(true);
    const pressed = signal("true");
    return (
      <Stack>
        <Inline align="center">
          <Pill
            active={active}
            aria-pressed={pressed}
            onClick={() => {
              active.value = !active.value;
              pressed.value = String(active.value);
            }}
          >
            Show running only
          </Pill>
          <Pill>Exit code 1</Pill>
          <Pill onClick={() => {}} disabled>
            Unavailable filter
          </Pill>
          <Button size="small">Refresh</Button>
        </Inline>
        <Inline>
          {(
            [
              "outline",
              "solid",
              "neutral",
              "quiet",
              "success",
              "accent",
              "warning",
              "danger",
            ] as const
          ).map((tone) => (
            <Badge size="small" tone={tone}>
              {tone}
            </Badge>
          ))}
        </Inline>
      </Stack>
    );
  },
});
