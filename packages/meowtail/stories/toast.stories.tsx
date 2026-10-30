import { h, type Child } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Button, Stack } from "meowtail";
import { Toast } from "../src/components/toast";
export const ToastStory = defineStory({
  id: "toast-feedback",
  title: "Toast · Host-controlled visibility",
  group: "Feedback and labels",
  groupOrder: 80,
  component: "Toast",
  description:
    "The host shows and dismisses toasts; no global queue or automatic timer is created.",
  render() {
    const toast = signal<Child>(null);
    return (
      <Stack align="start">
        <Button
          onClick={() => {
            toast.value = (
              <Toast
                message="Saved the local sample."
                actions={
                  <Button
                    variant="quiet"
                    onClick={() => {
                      toast.value = null;
                    }}
                  >
                    Undo
                  </Button>
                }
              />
            );
          }}
        >
          Show toast
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            toast.value = null;
          }}
        >
          Dismiss toast
        </Button>
        {toast}
      </Stack>
    );
  },
});
