import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, WorkCard } from "meowui";
import { SchemePair } from "./scheme-pair";

export const WorkCardStory = defineStory({
  id: "work-card",
  title: "工作卡片 · 对话里的任务入口",
  group: "对话组件",
  groupOrder: 31,
  component: "WorkCard",
  variant: "状态与详情入口",
  description:
    "工作卡片是对话中一件工作的入口：标题保留发布时的表达，状态行说明现在的进展，整张卡片打开详情。目标完成才用实心点，执行返回只是空心。",
  covers: [
    "WorkCard processing/returned/success/warning/unknown",
    "long title",
    "detail fact",
    "keyboard activation",
    "light and dark",
  ],
  render() {
    const opened = signal("尚未打开");
    const open = (name: string) => () => {
      opened.value = `已打开：${name}`;
    };
    return (
      <SchemePair width={480}>
        {() => (
          <div style={{ display: "grid", gap: "12px" }}>
            <WorkCard
              title="整理 workflow 原型试验记录"
              state="processing"
              status="正在推进：校对记录格式"
              detail="已关联 1 项成果"
              onClick={open("整理记录")}
            />
            <WorkCard
              title="补齐发布说明"
              state="returned"
              status="后台已返回 · 待公开答复"
              onClick={open("发布说明")}
            />
            <WorkCard
              title="核对 Kimi provider 试用结果"
              state="warning"
              status="待你回答"
              icon={<Icon name="list-checks" />}
              onClick={open("Kimi")}
            />
            <WorkCard
              title="迁移旧的 Notes 数据并保留全部历史记录与附件，同时清理已经替换的接口和配置项"
              state="success"
              status="目标已完成"
              onClick={open("迁移")}
            />
            <WorkCard
              title="尚未开始的目标"
              state="unknown"
              status="目标已登记"
              action="查看工作"
              onClick={open("登记")}
            />
            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--ui-subtle-foreground)" }}>
              {opened}
            </p>
          </div>
        )}
      </SchemePair>
    );
  },
});
