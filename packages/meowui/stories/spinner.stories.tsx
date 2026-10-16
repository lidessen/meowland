import { h, signal, mapSignal } from "meowjsx";
import { defineStory } from "meowbook";
import { Spinner, Button, Stack } from "meowui";
export const Spinners = defineStory({
  id: "spinner",
  title: "处理中 · 可读的等待",
  component: "Spinner",
  variant: "等待与就绪",
  group: "浮层与反馈",
  groupOrder: 30,
  description:
    "图形旁保留正在做什么的文字，不虚构百分比；减少动态效果时停止旋转。按钮切换本地演示状态。",
  covers: ["Spinner", "status", "reduced-motion"],
  render: () => {
    const loading = signal(true);
    return (
      <Stack align="start">
        {mapSignal(loading, (value) =>
          value ? <Spinner label="正在整理文件列表…" /> : <p role="status">文件列表已就绪。</p>,
        )}
        <Button
          variant="outline"
          onClick={() => {
            loading.value = !loading.value;
          }}
        >
          {mapSignal(loading, (value) => (value ? "模拟处理完成" : "重新演示等待"))}
        </Button>
      </Stack>
    );
  },
});
