import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Icon, ProcessGroup, ProcessStep, StatusDot, Tag } from "meowtail";
import { SchemePair } from "./scheme-pair";

export const ProcessGroupNarrowStory = defineStory({
  id: "process-group-narrow",
  title: "过程组 · 窄行与长序列",
  group: "对话组件",
  groupOrder: 30,
  component: "ProcessGroup",
  variant: "窄行与长序列",
  description: "窄容器中名称与状态点保留首行，动作摘要独占第二行；长序列状态点可换行。",
  covers: [
    "ProcessGroup narrow summary",
    "title never wraps",
    "separate outcome row",
    "many step dots",
  ],
  render() {
    return (
      <SchemePair width={340}>
        {() => (
          <ProcessGroup
            title="过程 · 13 步"
            status="调用本地能力、访问记忆与知识、管理任务等"
            trailing={Array.from({ length: 12 }, () => (
              <StatusDot state="success" size={6} />
            ))}
          >
            <ProcessStep icon={<Icon name="terminal" />} meta="2.0s">
              执行命令 <code>go test ./server/...</code>
            </ProcessStep>
          </ProcessGroup>
        )}
      </SchemePair>
    );
  },
});

export const ProcessGroupStory = defineStory({
  id: "process-group",
  title: "过程组 · 折叠的步骤记录",
  group: "对话组件",
  groupOrder: 30,
  component: "ProcessGroup",
  variant: "展开、收起与进行中",
  description:
    "过程组把助手做过的事收成一行：名称与步数、结果、每一步的状态点。展开后每步一行，路径用等宽字体，时长安静地靠右。",
  covers: [
    "ProcessGroup open/closed",
    "ProcessStep icon/meta/code",
    "trailing status dots",
    "running and failed steps",
    "light and dark",
  ],
  render() {
    return (
      <SchemePair width={460}>
        {() => (
          <div style={{ display: "grid", gap: "14px" }}>
            <ProcessGroup
              open
              title="过程 · 3 步"
              status="已完成 · 4.2s"
              trailing={[
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
              ]}
            >
              <ProcessStep icon={<Icon name="search" />} meta="12 处">
                搜索内容 <code>workflow-prototype</code>
              </ProcessStep>
              <ProcessStep icon={<Icon name="file-text" />} meta="1.1s">
                读取文件 <code>docs/records/2026-09-16-workflow-prototype.md</code>
              </ProcessStep>
              <ProcessStep icon={<Icon name="file-text" />} meta="0.9s">
                读取文件 <code>…workflow-prototype-second-trial.md</code>
              </ProcessStep>
            </ProcessGroup>
            <ProcessGroup
              title="过程 · 4 步"
              status="1 步运行中"
              trailing={[
                <StatusDot state="success" size={6} />,
                <StatusDot state="success" size={6} />,
                <StatusDot state="danger" size={6} />,
                <StatusDot state="processing" size={6} />,
              ]}
            >
              <ProcessStep icon={<Icon name="terminal" />} meta="2.0s">
                执行命令 <code>go test ./server/...</code>
              </ProcessStep>
            </ProcessGroup>
            <ProcessGroup open title="过程 · 1 步" status="结果未确认">
              <ProcessStep icon={<Icon name="folder-open" />} meta={<Tag>未核对</Tag>}>
                查看目录{" "}
                <code>
                  apps/meowland/web/src/a/very/long/path/that/keeps/going/and/going/index.ts
                </code>
              </ProcessStep>
            </ProcessGroup>
          </div>
        )}
      </SchemePair>
    );
  },
});
