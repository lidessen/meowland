import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Alert, Stack, Container } from "meowtail";
export const Alerts = defineStory({
  id: "alert",
  title: "提示 · 结果与下一步",
  component: "Alert",
  variant: "信息与紧急反馈",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "颜色表达语义，播报紧急度由 role 独立指定。这些均为本地演示消息。",
  covers: ["Alert", "status", "error"],
  render: () => (
    <Container width="content">
      <Stack>
        <Alert title="仅保存在本机">当前草稿尚未发布，可继续修改。</Alert>
        <Alert title="草稿已保存" tone="success">
          下次打开时可以继续编辑。
        </Alert>
        <Alert title="连接暂时中断" tone="warning">
          已保留当前输入，恢复连接后可以继续发送。
        </Alert>
        <Alert title="文件无法读取" tone="danger" role="alert">
          文件可能已移动，请重新选择文件后再试。
        </Alert>
      </Stack>
    </Container>
  ),
});
