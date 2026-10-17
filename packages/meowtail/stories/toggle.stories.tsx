import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Checkbox, Inline, Stack, Switch } from "meowtail";

export const ToggleStory = defineStory({
  id: "toggles",
  title: "选择 · 复选与开关",
  group: "表单输入",
  component: "Checkbox",
  description: "点击标签、空格切换和表单重置；受控开关由调用方决定是否接受修改。",
  covers: ["Checkbox native label/required/reset", "Switch controlled/disabled/keyboard"],
  render: () => {
    const checked = signal(true);
    return (
      <form onSubmit={(event: Event) => event.preventDefault()}>
        <Stack>
          <Checkbox label="保存本次选择" name="remember" defaultChecked />
          <Checkbox label="确认后才能提交" name="confirm" required />
          <Checkbox label="当前不可选择" disabled />
          <Switch label="显示工具过程" name="tools" defaultChecked />
          <Switch
            label="通知（受控）"
            name="notifications"
            checked={checked}
            onChange={(event: Event) => {
              checked.value = (event.currentTarget as HTMLInputElement).checked;
            }}
          />
          <Switch label="固定开启（拒绝修改）" checked={true} />
          <Switch label="暂不可用" disabled />
          <Inline>
            <Button type="reset" variant="outline">
              重置
            </Button>
            <Button type="submit">确认</Button>
          </Inline>
        </Stack>
      </form>
    );
  },
});
