import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, Select } from "meowtail";

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
      feedback.value = `已选择：${Array.from((event.currentTarget as HTMLSelectElement).selectedOptions, (option) => option.text).join("、") || "无"}`;
    };
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>整理交付</h2>
          <p>先确定交付位置，再选择要包含的成果。</p>
        </header>
        <Field label="交付目标" htmlFor="select-grouped" description="可用方向键选择，Enter 确认。">
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
        <Field label="发布环境" htmlFor="select-invalid" invalid error="需要选择一个环境才能继续。">
          <Select
            id="select-invalid"
            value=""
            required
            onChange={(event) => {
              changed(event);
              const select = event.currentTarget as HTMLSelectElement;
              const invalid = !select.value;
              select.setAttribute("aria-invalid", String(invalid));
              if (invalid) select.setAttribute("aria-describedby", "select-invalid-error");
              else select.removeAttribute("aria-describedby");
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
