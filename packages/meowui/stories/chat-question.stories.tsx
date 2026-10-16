import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, ChatQuestion, ChoiceGroup, Textarea } from "meowui";

export const ChatQuestionStory = defineStory({
  id: "chat-question",
  title: "问答 · 选择与文字回答",
  group: "对话组件",
  component: "ChatQuestion",
  variant: "可操作问答",
  description: "问题优先，选项直接可见。选择不会发送，确认提交后才产生本地回执；切换输入保留草稿。",
  covers: [
    "ChoiceGroup native radio",
    "required",
    "keyboard",
    "free text",
    "long content",
    "cancel",
  ],
  render: () => (
    <form data-question-form>
      <ChatQuestion
        question="你刚才选择重试前，Meowland 宿主已经重建或重启过了吗？"
        questionId="restart-question"
        description="Cell 重试仍未成功，需要确认宿主当前状态。"
        actions={[
          <Button type="submit">提交回答</Button>,
          <Button variant="quiet" size="small" data-question-mode>
            用文字回答
          </Button>,
          <Button variant="quiet" size="small" data-question-cancel>
            取消问题
          </Button>,
        ]}
      >
        <div data-question-choices>
          <ChoiceGroup
            id="restart-choice"
            name="answer"
            label="选择回答"
            hideLabel
            required
            options={[
              {
                value: "restarted",
                label: "已经重启",
                description: "重建并重启了宿主，可以继续排查。",
              },
              {
                value: "not-yet",
                label: "还没有重启",
                description: "先保留现场，说明接下来需要做什么。",
              },
              { value: "unsure", label: "不确定", description: "帮我确认当前运行的是哪个版本。" },
            ]}
          />
        </div>
        <div data-question-text hidden>
          <Textarea
            aria-label="你的回答"
            name="freeAnswer"
            rows={3}
            placeholder="补充当前情况…"
            disabled
          />
        </div>
        <p data-question-feedback role="status" hidden />
      </ChatQuestion>
    </form>
  ),
  setup({ root, onCleanup, report }) {
    const form = root.querySelector<HTMLFormElement>("[data-question-form]")!;
    const choices = root.querySelector<HTMLElement>("[data-question-choices]")!;
    const text = root.querySelector<HTMLElement>("[data-question-text]")!;
    const textarea = text.querySelector<HTMLTextAreaElement>("textarea")!;
    const mode = root.querySelector<HTMLButtonElement>("[data-question-mode]")!;
    const feedback = root.querySelector<HTMLElement>("[data-question-feedback]")!;
    const show = (message: string) => {
      feedback.hidden = false;
      feedback.textContent = message;
      report(message);
    };
    const changeMode = () => {
      choices.hidden = !choices.hidden;
      text.hidden = !choices.hidden;
      choices.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
        input.disabled = Boolean(choices.hidden);
      });
      textarea.disabled = Boolean(text.hidden);
      textarea.required = !text.hidden;
      mode.textContent = text.hidden ? "用文字回答" : "返回选项";
      if (!text.hidden) textarea.focus();
    };
    const submit = (event: Event) => {
      event.preventDefault();
      const data = new FormData(form);
      show(
        `已提交本地样例：${data.get(text.hidden ? "answer" : "freeAnswer")}。没有发送给 Agent。`,
      );
    };
    const cancel = () => show("已取消本地样例问题，保留填写内容供查看。");
    const cancelButton = root.querySelector<HTMLButtonElement>("[data-question-cancel]")!;
    mode.addEventListener("click", changeMode);
    form.addEventListener("submit", submit);
    cancelButton.addEventListener("click", cancel);
    onCleanup(() => {
      mode.removeEventListener("click", changeMode);
      form.removeEventListener("submit", submit);
      cancelButton.removeEventListener("click", cancel);
    });
  },
});

export const ChatQuestionConflictStory = defineStory({
  id: "chat-question-conflict",
  title: "问答 · 长内容与冲突提示",
  group: "对话组件",
  component: "ChatQuestion",
  variant: "静态冲突提示",
  description:
    "展示长问题、长选项和冲突反馈的静态组合；按钮未接业务操作，不验证异步提交或输入保留。",
  covers: ["long question", "long options", "static conflict feedback"],
  render: () => (
    <ChatQuestion
      question="当前服务仍然返回 503。如果宿主暂时无法重启，你希望保留现场继续排查，还是先查看已经完成的组件源码和验证说明？"
      questionId="conflict-question"
      feedback="问题已被更新，这份回答尚未提交。内容已保留，你可以复制后查看新问题。"
      actions={[
        <Button>查看新问题</Button>,
        <Button variant="quiet" size="small">
          复制回答
        </Button>,
      ]}
    >
      <ChoiceGroup
        id="long-answer"
        name="longAnswer"
        label="你的回答"
        hideLabel
        defaultValue="keep"
        options={[
          {
            value: "keep",
            label: "保留服务的当前状态和日志，继续定位激活失败的原因，暂时不要重启正在运行的宿主",
          },
          { value: "source", label: "先查看组件源码和测试说明，服务运行问题稍后处理" },
        ]}
      />
    </ChatQuestion>
  ),
});

export const ChoiceGroupStory = defineStory({
  id: "choice-group",
  title: "单选组 · 直接比较选项",
  group: "表单输入",
  component: "ChoiceGroup",
  description: "适合少量需要直接比较的选项。使用原生 radio 保留方向键、Tab、表单重置与必填校验。",
  render: () => (
    <form className="workshop-stack workshop-constrained">
      <ChoiceGroup
        id="startup-choice"
        name="startup"
        label="启动时打开什么？"
        defaultValue="last"
        options={[
          {
            value: "last",
            label: "上次的工作",
            description: "回到离开前的位置，继续未完成的内容。",
          },
          { value: "new", label: "空白页面", description: "从一个新的工作区开始。" },
          {
            value: "team",
            label: "团队概览",
            description: "当前工作区未连接团队。",
            disabled: true,
          },
        ]}
      />
      <Button type="reset" variant="outline">
        重置选择
      </Button>
    </form>
  ),
});
