import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Field, Input, PathPicker, Stack } from "meowtail";

export const PathPickerStory = defineStory({
  id: "path-picker",
  title: "路径选择 · 手动输入与宿主浏览",
  group: "表单输入",
  groupOrder: 20,
  component: "PathPicker",
  covers: ["PathPicker", "Field", "Input", "Button", "cancel", "failure", "disabled", "readonly"],
  render: () => {
    const value = signal("/Users/demo/Projects/my-project");
    let result: "selected" | "cancelled" | "failed" = "selected";
    return (
      <Stack gap="normal" className="workshop-constrained">
        <Field label="项目名称" htmlFor="picker-name">
          <Input id="picker-name" value="个人网站" />
        </Field>
        <Field
          label="本地目录"
          htmlFor="picker-directory"
          description="演示选择器只返回固定路径，不读取文件或授予访问权限。"
        >
          <PathPicker
            id="picker-directory"
            label="本地目录"
            value={value}
            kind="directory"
            onValueChange={(next) => {
              value.value = next;
            }}
            onChoose={async () => {
              await new Promise((resolve) => setTimeout(resolve, 450));
              if (result === "failed") throw new Error("Picker unavailable");
              return result === "cancelled" ? null : "/Users/demo/Projects/selected-project";
            }}
          />
        </Field>
        <Stack gap="compact">
          <Button
            variant="quiet"
            onClick={() => {
              result = "selected";
            }}
          >
            演示成功选择
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              result = "cancelled";
            }}
          >
            演示取消选择
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              result = "failed";
            }}
          >
            演示选择失败
          </Button>
        </Stack>
        <Field label="文件路径" htmlFor="picker-file">
          <PathPicker
            id="picker-file"
            label="文件路径"
            value="/tmp/report.md"
            onValueChange={() => {}}
            onChoose={async () => null}
            readOnly
          />
        </Field>
        <Field label="等待保存" htmlFor="picker-disabled">
          <PathPicker
            id="picker-disabled"
            label="等待保存"
            value="/tmp/project"
            kind="directory"
            onValueChange={() => {}}
            onChoose={async () => null}
            disabled
          />
        </Field>
        <Field
          label="手动输入目录"
          htmlFor="picker-manual"
          description="宿主未提供选择能力时，继续手动填写绝对路径。"
        >
          <PathPicker
            id="picker-manual"
            label="手动输入目录"
            value={value}
            onValueChange={(next) => {
              value.value = next;
            }}
          />
        </Field>
      </Stack>
    );
  },
});
