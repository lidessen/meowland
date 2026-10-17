import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Badge, Button, Inline, Pill, Stack } from "meowtail";

export const PillStory = defineStory({
  id: "pill-tags",
  title: "胶囊 · 筛选与状态标签",
  component: "Pill",
  group: "基础控件",
  description: "24px 胶囊按钮与 20px 只读标签，选择状态由调用者持有。",
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
            仅显示运行中
          </Pill>
          <Pill>退出码 1</Pill>
          <Pill onClick={() => {}} disabled>
            不可用筛选
          </Pill>
          <Button size="small">刷新</Button>
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
