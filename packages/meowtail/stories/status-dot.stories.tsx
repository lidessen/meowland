import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Inline, StatusDot, Tag, type StatusDotState } from "meowtail";
import { SchemePair } from "./scheme-pair";

const states: readonly [StatusDotState, string, string][] = [
  ["processing", "处理中 / 正在推进", "accent · 脉冲"],
  ["success", "已连接 / 已启用 / 目标完成", "success · 实心"],
  ["returned", "执行已返回", "success · 空心，返回不等于目标完成"],
  ["warning", "待你回答 / 提醒", "warning · 唯一会打断你的颜色"],
  ["danger", "未完成 / 不可读", "danger"],
  ["unknown", "状态待核 / 未检测到", "空心 · 不假装知道"],
  ["idle", "待命", "实心灰 · 已知的安静状态"],
];

export const StatusDotStory = defineStory({
  id: "status-dot",
  title: "状态点 · 状态语义",
  group: "基础控件",
  groupOrder: 12,
  component: "StatusDot",
  variant: "状态语义",
  description:
    "一个点只表达一种状态：accent 脉冲是正在发生，绿色是已返回或已连接，橙色是待你，红色是失败，空心灰点是尚未核实。点本身不带文字，旁边必须有说明。",
  covers: [
    "StatusDot all states",
    "halo processing/success",
    "size 6/8/10",
    "inline with text",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair>
        {() => (
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "grid", gap: "10px" }}>
              {states.map(([state, label, note]) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <StatusDot state={state} />
                  <strong style={{ fontWeight: "500" }}>{label}</strong>
                  <span style={{ color: "var(--ui-subtle-foreground)" }}>{note}</span>
                </div>
              ))}
            </div>
            <Inline align="center" gap="compact">
              <span style={{ fontSize: "12.5px", color: "var(--ui-muted-foreground)" }}>
                带光晕（页面里唯一领头的状态）
              </span>
              <StatusDot state="processing" halo />
              <StatusDot state="success" size={7} halo />
            </Inline>
            <Inline align="center" gap="compact">
              <span style={{ fontSize: "12.5px", color: "var(--ui-muted-foreground)" }}>
                尺寸 6 / 8 / 10
              </span>
              <StatusDot state="processing" size={6} />
              <StatusDot state="processing" />
              <StatusDot state="processing" size={10} />
              <StatusDot state="returned" size={10} />
            </Inline>
            <Inline align="center" gap="compact">
              <Tag>3 步</Tag>
              <StatusDot state="success" size={6} />
              <StatusDot state="success" size={6} />
              <StatusDot state="warning" size={6} />
            </Inline>
          </div>
        )}
      </SchemePair>
    );
  },
});
