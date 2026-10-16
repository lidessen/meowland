import { h } from "meowjsx/runtime";
import { defineStory } from "meowbook";
import { Disclosure } from "meowui";

export const DisclosureStory = defineStory({
  id: "disclosure",
  title: "折叠详情 · 保留阅读上下文",
  group: "导航与布局",
  groupOrder: 40,
  component: "Disclosure",
  variant: "阅读上下文",
  description: "只展开需要的补充信息。原生键盘操作、初始展开和嵌套区域互不干扰。",
  covers: ["Disclosure open/onToggle", "Disclosure host slots", "native keyboard", "long content"],
  render: () => (
    <div className="workshop-composition" data-disclosure-example>
      <header className="workshop-composition-header">
        <h2>组件检查记录</h2>
        <p>主体结论保持可见，执行细节在需要时展开。</p>
      </header>
      <div className="workshop-section">
        <Disclosure
          summary="查看执行详情"
          data-disclosure="execution"
          onToggle={(event) => {
            const details = event.currentTarget as HTMLDetailsElement;
            const status = details
              .closest("[data-disclosure-example]")
              ?.querySelector("[data-disclosure-status]");
            if (status) status.textContent = details.open ? "执行详情已展开" : "执行详情已收起";
          }}
        >
          <div className="workshop-disclosure-detail">
            <p>已检查消息、附件和工具结果。检查文件：</p>
            <code className="workshop-disclosure-path">
              packages/meowui/stories/review-of-component-typography-and-interaction-states.tsx
            </code>
            <Disclosure summary="查看检查范围" data-disclosure="nested">
              <p>覆盖桌面和窄屏中的文字层级、键盘焦点及内容换行。</p>
            </Disclosure>
          </div>
        </Disclosure>
        <Disclosure
          summary="待确认的限制"
          open
          data-disclosure="open"
          className="review-note"
          summaryClassName="review-note-heading"
          contentClassName="review-note-body"
        >
          <p>组件验证不等于真实服务已连接。集成验收需要独立检查数据来源和失败恢复。</p>
        </Disclosure>
      </div>
      <p className="workshop-feedback" data-disclosure-status role="status">
        执行详情已收起
      </p>
    </div>
  ),
});
