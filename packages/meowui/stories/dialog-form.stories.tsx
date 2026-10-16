import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Dialog,
  DialogPanel,
  DialogHeader,
  DialogActions,
  Field,
  Icon,
  IconButton,
  Input,
} from "meowui";

export const DialogFormStory = defineStory({
  id: "dialog-form",
  title: "弹窗 · 编辑与长内容",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "Dialog",
  variant: "编辑与长内容",
  description:
    "原生 form method=dialog 提交并返回。长内容保持在弹窗中可读，标题、说明、关闭和保存各有角色。",
  covers: [
    "DialogPanel form",
    "DialogHeader eyebrow/actions/long title",
    "DialogActions",
    "native validation",
    "Escape/focus return",
    "long content",
  ],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Button data-edit-open>编辑交付说明</Button>
      <p role="status" data-edit-feedback className="workshop-feedback">
        尚未修改本地样例。
      </p>
      <Dialog labelledBy="edit-title" describedBy="edit-description">
        <DialogPanel
          as="form"
          method="dialog"
          header={
            <DialogHeader
              eyebrow="交付前检查"
              title="为这次组件设计与交互改进填写可核对的说明"
              titleId="edit-title"
              description="内置示例；保存只关闭弹窗并显示本地回执。"
              descriptionId="edit-description"
              actions={
                <IconButton label="关闭编辑" data-edit-close>
                  <Icon name="x" />
                </IconButton>
              }
            />
          }
        >
          <Field label="说明标题" htmlFor="edit-name">
            <Input id="edit-name" name="title" value="校准组件比例与主题边界" required autofocus />
          </Field>
          <section className="workshop-document" aria-label="交付说明样例">
            {[
              "交付内容：本次样例包含按钮、输入框与确认弹窗，提供两套主题以及各自的浅色和深色外观。",
              "核对范围：请在桌面和窄屏中检查长标题、表单提示与操作位置，并记录使用键盘时遇到的问题。",
              "当前限制：这里没有连接项目服务，保存仅更新本页回执；刷新页面后，这条说明不会保留。",
              "后续工作：将确认后的组件接入实际页面，再验证加载、失败与恢复过程。未完成的检查应留在交付记录中。",
            ].map((copy) => (
              <p>{copy}</p>
            ))}
          </section>
          <DialogActions>
            <Button variant="quiet" data-edit-close>
              取消
            </Button>
            <Button type="submit" value="save">
              保存说明
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
    </div>
  ),
  setup({ root, onCleanup, report }) {
    const dialog = root.querySelector<HTMLDialogElement>("dialog")!;
    const trigger = root.querySelector<HTMLButtonElement>("[data-edit-open]")!;
    const open = () => {
      dialog.returnValue = "";
      dialog.showModal();
    };
    const click = (event: Event) => {
      if ((event.target as Element).closest("[data-edit-close]")) dialog.close("cancel");
    };
    const closed = () => {
      const message = dialog.returnValue === "save" ? "已保存本地说明。" : "已取消编辑，返回原处。";
      root.querySelector("[data-edit-feedback]")!.textContent = message;
      trigger.focus();
      report(message);
    };
    trigger.addEventListener("click", open);
    dialog.addEventListener("click", click);
    dialog.addEventListener("close", closed);
    onCleanup(() => {
      trigger.removeEventListener("click", open);
      dialog.removeEventListener("click", click);
      dialog.removeEventListener("close", closed);
      if (dialog.open) dialog.close();
    });
  },
});
