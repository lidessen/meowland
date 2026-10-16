import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Stack } from "meowui";
import { SegmentedControl } from "../src/components/segmented-control";
import { TextShimmer } from "../src/components/text-shimmer";
import { RiskConfirmation } from "../src/components/risk-confirmation";

export const SegmentedFormStory = defineStory({
  id: "segmented-forms",
  title: "分段选择 · 表单归属与重置",
  component: "SegmentedControl",
  group: "基础控件",
  groupOrder: 10,
  description: "两组受控选择分别位于表单内和表单外，原生重置不改变宿主当前值。",
  render() {
    const options = [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ];
    const inside = signal("a");
    const outside = signal("a");
    return (
      <Stack>
        <form id="segmented-inside">
          <SegmentedControl
            id="inside-choice"
            name="mode"
            label="内部选择"
            value={inside}
            options={options}
            onValueChange={(value) => {
              inside.value = value;
            }}
          />
          <Button type="reset">重置内部表单</Button>
        </form>
        <form id="segmented-outside">
          <Button type="reset">重置外部表单</Button>
        </form>
        <SegmentedControl
          id="outside-choice"
          name="mode"
          form="segmented-outside"
          label="外部选择"
          value={outside}
          options={options}
          onValueChange={(value) => {
            outside.value = value;
          }}
        />
      </Stack>
    );
  },
});
export const SelectionFeedbackStory = defineStory({
  id: "selection-feedback",
  title: "选择与反馈 · 分段、活动文字与确认",
  component: "SegmentedControl",
  group: "基础控件",
  groupOrder: 10,
  description: "分段选择保留原生单选语义。确认只用于此本地样例，不引入全局操作门禁。",
  render() {
    const mode = signal("comfortable");
    const locked = signal(false);
    const active = signal(true);
    const open = signal(false);
    const acknowledged = signal(false);
    const feedback = signal("尚未移除样例。");
    return (
      <Stack align="start">
        <SegmentedControl
          id="reading-mode"
          label="阅读间距"
          value={mode}
          disabled={locked}
          onValueChange={(next) => {
            mode.value = next;
          }}
          options={[
            { value: "comfortable", label: "舒适" },
            { value: "locked", label: "自动", disabled: true },
            { value: "compact", label: "紧凑" },
          ]}
        />
        <Button
          variant="quiet"
          onClick={() => {
            locked.value = !locked.value;
          }}
        >
          切换选择锁定
        </Button>
        <TextShimmer text="正在读取文件内容" active={active} />
        <TextShimmer active={active} className="compound-shimmer">
          <TextShimmer text="正在检查" />
          {" · "}
          <TextShimmer text="src/components" />
        </TextShimmer>
        <Button
          variant="quiet"
          onClick={() => {
            active.value = !active.value;
          }}
        >
          切换活动状态
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            acknowledged.value = false;
            open.value = true;
          }}
        >
          移除样例
        </Button>
        <RiskConfirmation
          id="remove-sample"
          open={open}
          title="移除样例"
          description="这是本地组件示例，不会删除真实文件。"
          acknowledgeLabel="我了解此操作只影响样例。"
          cancelLabel="取消"
          confirmLabel="确认移除"
          acknowledged={acknowledged}
          onAcknowledgedChange={(next) => {
            acknowledged.value = next;
          }}
          onCancel={() => {
            open.value = false;
          }}
          onConfirm={() => {
            open.value = false;
            feedback.value = "已移除本地样例。";
          }}
        />
        <p role="status">{feedback}</p>
      </Stack>
    );
  },
});
