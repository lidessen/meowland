import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Checkbox, ChoiceGroup, Field, Inline, Select, Stack } from "meowtail";

export const SelectStatesStory = defineStory({
  id: "select-states",
  title: "选择 · 分组、错误与多选",
  group: "表单输入",
  groupOrder: 20,
  component: "Select",
  variant: "分组与多选",
  description: "保留系统原生选项和键盘操作。size 表示可见行数，多选使用当前平台的组合键。",
  covers: [
    "Select required/invalid/disabled",
    "optgroup/disabled option",
    "multiple/size",
    "long option",
    "keyboard native",
  ],
  render() {
    const feedback = signal("选择后会在这里显示当前值。");
    const changed = (event: Event) => {
      const select = event.currentTarget as HTMLSelectElement;
      const label = select.labels?.[0]?.textContent || "选择";
      feedback.value = `${label}已选择：${Array.from(select.selectedOptions, (option) => option.text).join("、") || "无"}。仅更新本地示例。`;
    };
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>原生选择能力对照</h2>
          <p>分组、必填错误、多选和禁用为独立示例；选择只更新本地回执，不发布交付。</p>
        </header>
        <Field
          label="交付目标"
          htmlFor="select-grouped"
          description="分组单选；可用方向键选择，Enter 确认。"
        >
          <Select id="select-grouped" value="review" onChange={changed}>
            <optgroup label="当前项目">
              <option value="draft">保留为本地草稿</option>
              <option value="review">交给项目负责人审阅完整修改与验证记录</option>
            </optgroup>
            <optgroup label="外部目标">
              <option disabled>尚未连接远端</option>
            </optgroup>
          </Select>
        </Field>
        <Field
          label="发布环境"
          htmlFor="select-invalid"
          description="必填校验示例，选择后解除错误。"
          invalid
          error="需要选择一个环境才能继续。"
        >
          <Select
            id="select-invalid"
            value=""
            required
            onChange={(event) => {
              changed(event);
              const select = event.currentTarget as HTMLSelectElement;
              const invalid = !select.value;
              select.setAttribute("aria-invalid", String(invalid));
              select.setAttribute(
                "aria-describedby",
                invalid
                  ? "select-invalid-description select-invalid-error"
                  : "select-invalid-description",
              );
              select
                .closest('[data-meowui-part="field/root"]')
                ?.setAttribute("data-invalid", String(invalid));
              const error = select.ownerDocument.getElementById("select-invalid-error");
              if (error) error.hidden = !invalid;
            }}
          >
            <option value="">请选择环境</option>
            <option value="local">仅本地预览</option>
            <option value="staging">测试环境</option>
          </Select>
        </Field>
        <Field
          label="包含的成果"
          htmlFor="select-multiple"
          description="按住 ⌘ / Ctrl 可增选，Shift 可连续选择。"
        >
          <Select id="select-multiple" multiple size={3} onChange={changed}>
            <option value="source" selected>
              源代码修改
            </option>
            <option value="tests">验证记录</option>
            <option value="design">设计说明</option>
          </Select>
        </Field>
        <Field label="被锁定的目标" htmlFor="select-disabled">
          <Select id="select-disabled" disabled>
            <option>当前任务使用本地工作区</option>
          </Select>
        </Field>
        <p role="status" className="workshop-feedback">
          {feedback}
        </p>
      </div>
    );
  },
});

export const DeliveryChoiceStory = defineStory({
  id: "delivery-choice",
  title: "选择用途 · 整理本地交付清单",
  group: "表单输入",
  groupOrder: 20,
  component: "ChoiceGroup",
  variant: "同屏比较与多项选择",
  description: "少量目标同屏比较，成果独立增选；提交仅在本页生成清单，不发送或发布。",
  render() {
    const feedback = signal("尚未生成清单；下面的选择是草稿。");
    return (
      <form
        className="workshop-constrained"
        onSubmit={(event: Event) => {
          event.preventDefault();
          const form = event.currentTarget as HTMLFormElement;
          const data = new FormData(form);
          const destination =
            data.get("destination") === "review"
              ? "交给项目负责人审阅完整修改与验证记录"
              : "保留为本地草稿";
          const contents = data.getAll("contents").join("、") || "未包含成果";
          feedback.value = `已生成本地清单：${destination}；${contents}。选择修改后，请重新生成。`;
        }}
      >
        <Stack gap="relaxed">
          <Stack gap="compact">
            <strong>整理本地交付清单</strong>
            <span style={{ textWrap: "balance" }}>
              先确定交付位置，再选择要包含的成果。清单只在本页显示。
            </span>
          </Stack>
          <ChoiceGroup
            label="交付目标"
            name="destination"
            defaultValue="review"
            options={[
              {
                value: "draft",
                label: "保留为本地草稿",
                description: "先留在工作区，之后继续整理。",
              },
              {
                value: "review",
                label: "交给项目负责人审阅完整修改与验证记录",
                description: "把修改与核对材料放在同一份清单中。",
              },
              { value: "remote", label: "尚未连接远端", disabled: true },
            ]}
          />
          <fieldset style={{ border: "0", padding: "0", margin: "0" }}>
            <legend>包含的成果</legend>
            <Stack gap="compact">
              <Checkbox name="contents" value="源代码修改" defaultChecked label="源代码修改" />
              <Checkbox name="contents" value="验证记录" label="验证记录" />
              <Checkbox name="contents" value="设计说明" label="设计说明" />
            </Stack>
          </fieldset>
          <Inline>
            <Button type="submit">生成本地清单</Button>
          </Inline>
          <p role="status" className="workshop-feedback">
            {feedback}
          </p>
        </Stack>
      </form>
    );
  },
});
