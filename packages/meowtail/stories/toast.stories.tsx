import { h, signal, type Child } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Stack } from "meowtail";
import { Toast } from "../src/components/toast";
export const ToastStory = defineStory({
  id: "toast-feedback",
  title: "通知 · 宿主控制显示",
  component: "Toast",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "通知由宿主显示和关闭，不创建全局队列或自动定时器。",
  render() {
    const toast = signal<Child>(null);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            toast.value = (
              <Toast
                message="已保存本地示例。"
                actions={
                  <Button
                    variant="quiet"
                    onClick={() => {
                      toast.value = null;
                    }}
                  >
                    撤销
                  </Button>
                }
              />
            );
          }}
        >
          显示通知
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            toast.value = null;
          }}
        >
          关闭通知
        </Button>
        {toast}
      </Stack>
    );
  },
});
