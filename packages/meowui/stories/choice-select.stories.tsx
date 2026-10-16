import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { ChoiceSelect, Stack, Field, Container } from "meowui";

export const GroupedChoiceSelectStory = defineStory({
  id: "choice-select-grouped",
  title: "选择器 · 分组选项",
  component: "ChoiceSelect",
  group: "基础控件",
  render() {
    const value = signal("deepseek-flash");
    return (
      <ChoiceSelect
        aria-label="Provider 与模型"
        value={value}
        onValueChange={(next) => {
          value.value = next;
        }}
        options={[
          { value: "deepseek-flash", label: "DeepSeek-V41-Flash", group: "DeepSeek" },
          { value: "deepseek-pro", label: "DeepSeek-V4-Pro", group: "DeepSeek" },
          { value: "anthropic", label: "Claude", group: "Anthropic" },
        ]}
      />
    );
  },
});

export const ChoiceWidthStory = defineStory({
  id: "choice-select-width",
  title: "选择器 · 短触发器与长选项",
  component: "ChoiceSelect",
  group: "基础控件",
  description: "匹配触发器保留精确宽度；自然浮层与宽表单沿各自已有合同呈现。",
  render() {
    return (
      <Stack align="start">
        <ChoiceSelect
          id="short-choice"
          aria-label="短触发器选择"
          options={[
            { value: "one", label: "第一个" },
            { value: "two", label: "第二个" },
          ]}
        />
        <ChoiceSelect
          id="natural-choice"
          aria-label="自然宽度选择"
          matchTriggerWidth={false}
          options={[
            { value: "one", label: "第一个" },
            { value: "two", label: "第二个" },
          ]}
        />
        <Container width="narrow">
          <Field label="完整选项名称" htmlFor="long-choice">
            <ChoiceSelect
              id="long-choice"
              defaultValue="long"
              options={[
                { value: "long", label: "项目负责人审阅当前完整修改与验证记录" },
                {
                  value: "path",
                  label: "workspace-very-long-source-reference-for-a-readable-selection",
                },
              ]}
            />
          </Field>
        </Container>
      </Stack>
    );
  },
});
