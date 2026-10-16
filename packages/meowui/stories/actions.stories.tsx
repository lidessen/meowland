import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { AddButton, Button, Icon, IconButton } from "meowui";

export const ActionMatrixStory = defineStory({
  id: "actions-matrix",
  title: "操作 · 尺寸、层级与不可用",
  group: "基础控件",
  groupOrder: 10,
  component: "Button",
  variant: "尺寸与层级",
  description:
    "同一操作对照三种尺寸和六种层级：主要（黑白）、次要、安静、强调软底（关于当前活动）、停止（打断运行中的工作）与确认危险操作。按钮可用键盘触发；禁用控件跳过 Tab，不产生回执。",
  covers: [
    "Button all variant × size",
    "disabled",
    "IconButton all size",
    "AddButton default/custom",
    "keyboard activation",
  ],
  render() {
    const feedback = signal("选择操作；这里的回执只发生在本地。");
    const actions = [
      ["primary", "保存修改"],
      ["outline", "查看差异"],
      ["quiet", "稍后处理"],
      ["danger", "丢弃草稿"],
      ["accent", "查看进展"],
      ["stop", "停止处理"],
    ] as const;
    return (
      <div className="workshop-stack workshop-constrained">
        {(["small", "default", "large"] as const).map((size) => (
          <section className="workshop-stack">
            <h2 className="workshop-section-title">
              {{ small: "紧凑工具栏", default: "常规操作", large: "重点操作" }[size]}
            </h2>
            <div className="workshop-foundation-action-grid">
              {actions.map(([variant, label]) => (
                <Button
                  size={size}
                  variant={variant}
                  onClick={() => {
                    feedback.value = `已选择：${label}（${size}）`;
                  }}
                >
                  {label}
                </Button>
              ))}
              <IconButton
                size={size}
                label={`${size} 搜索`}
                onClick={() => {
                  feedback.value = `已选择搜索（${size}）`;
                }}
              >
                <Icon name="search" />
              </IconButton>
            </div>
            <div className="workshop-foundation-action-grid">
              {actions.map(([variant, label]) => (
                <Button size={size} variant={variant} disabled>
                  {label}
                </Button>
              ))}
              <IconButton size={size} label={`${size} 搜索不可用`} disabled>
                <Icon name="search" />
              </IconButton>
            </div>
          </section>
        ))}
        <section className="workshop-stack">
          <h2 className="workshop-section-title">添加入口</h2>
          <div className="workshop-row">
            <AddButton
              onClick={() => {
                feedback.value = "已选择添加";
              }}
            />
            <AddButton
              variant="outline"
              size="small"
              onClick={() => {
                feedback.value = "已选择添加附件";
              }}
            >
              添加附件
            </AddButton>
            <AddButton variant="quiet" size="large" disabled>
              等待工作完成后添加
            </AddButton>
          </div>
        </section>
        <p role="status" className="workshop-feedback">
          {feedback}
        </p>
      </div>
    );
  },
});
