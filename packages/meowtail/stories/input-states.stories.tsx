import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, Input, Textarea } from "meowtail";

export const InputStatesStory = defineStory({
  id: "input-states",
  title: "输入 · 只读、错误与长内容",
  group: "表单输入",
  groupOrder: 20,
  component: "Input",
  variant: "只读与长内容",
  description: "只读内容仍可选择与复制；禁用内容不能编辑。显式错误、组合字段和长内容保留清楚关联。",
  covers: [
    "Input text/email/password/search",
    "readonly/disabled/invalid",
    "Textarea readonly/disabled/long",
    "Field explicit invalid",
    "Field multiple controls explicit association",
  ],
  render: () => (
    <div className="workshop-composition-columns">
      <section className="workshop-stack">
        <Field
          label="项目地址（只读）"
          htmlFor="readonly-path"
          description="可选择和复制，不能在这里更换。"
        >
          <Input
            id="readonly-path"
            readonly
            value="/workspace/meowland/packages/meowtail/components/long-project-reference"
          />
        </Field>
        <Field label="检索文件" htmlFor="search-files">
          <Input id="search-files" type="search" placeholder="输入文件名称…" />
        </Field>
        <Field label="通知邮箱" htmlFor="invalid-email" invalid error="请输入完整的邮箱地址。">
          <Input id="invalid-email" type="email" value="meow@" />
        </Field>
        <Field label="访问口令（禁用）" htmlFor="disabled-password">
          <Input id="disabled-password" type="password" value="demo-only" disabled />
        </Field>
        <Field
          label="检查范围"
          description="组合字段由调用方分别关联标签与说明。"
          descriptionId="range-description"
        >
          <div className="workshop-foundation-range">
            <label>
              从{" "}
              <Input
                aria-label="起始行"
                aria-describedby="range-description"
                type="number"
                value="1"
                min="1"
              />
            </label>
            <label>
              到{" "}
              <Input
                aria-label="结束行"
                aria-describedby="range-description"
                type="number"
                value="80"
                min="1"
              />
            </label>
          </div>
        </Field>
      </section>
      <section className="workshop-stack">
        <Field label="交付说明（可编辑）" htmlFor="long-notes">
          <Textarea id="long-notes" rows={6}>
            第一步，确认所有组件在窄屏仍可阅读。第二步，保留用户输入并切换主题。第三步，用键盘打开弹窗、取消并返回。长内容应自然换行，不能为了画面简洁而删掉检查依据。
          </Textarea>
        </Field>
        <Field label="上次检查记录（只读）" htmlFor="readonly-notes">
          <Textarea id="readonly-notes" rows={3} readonly>
            记录保留供核对。只读不等于不可访问。
          </Textarea>
        </Field>
        <Field label="等待恢复连接" htmlFor="disabled-notes">
          <Textarea id="disabled-notes" rows={3} disabled>
            连接恢复后继续编辑。
          </Textarea>
        </Field>
      </section>
    </div>
  ),
});
