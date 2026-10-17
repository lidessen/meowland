import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogPanel,
  Field,
  Icon,
  IconButton,
  Input,
  Stack,
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "meowtail";

export const DialogLayoutStory = defineStory({
  id: "dialog-layout",
  title: "弹窗布局 · 固定标题与正文滚动",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "DialogPanel",
  variant: "自然高度与宿主约束",
  description: "短表单自然取高，长正文与宿主受限窗口共用页壳；表单仍使用原生提交和取消。",
  covers: ["fixed header", "layout scroll owner", "intrinsic height", "host height", "native form"],
  render() {
    return (
      <Stack align="start">
        {(["short", "long", "limited", "workspace"] as const).map((kind) => {
          let dialog: HTMLDialogElement | undefined;
          const name = {
            short: "短表单",
            long: "长正文",
            limited: "受限高度",
            workspace: "完整工作区",
          }[kind];
          return (
            <div>
              <Button
                size={kind === "limited" ? "small" : "default"}
                onClick={() => {
                  dialog?.showModal();
                }}
              >
                打开{name}
              </Button>
              <Dialog
                labelledBy={`${kind}-title`}
                style={
                  kind === "limited"
                    ? { maxHeight: "40svh" }
                    : kind === "workspace"
                      ? { height: "100dvh", maxHeight: "none" }
                      : undefined
                }
                ref={(element: HTMLDialogElement) => {
                  dialog = element;
                }}
              >
                <DialogPanel
                  as="form"
                  method="dialog"
                  header={
                    <DialogHeader
                      title={`${name} · 当前对象与关闭动作`}
                      titleId={`${kind}-title`}
                      actions={
                        <IconButton
                          label={`关闭${name}`}
                          onClick={() => {
                            dialog?.close("cancel");
                          }}
                        >
                          <Icon name="x" />
                        </IconButton>
                      }
                    />
                  }
                >
                  <Stack gap="compact">
                    <Field label={`${name}草稿`} htmlFor={`${kind}-draft`}>
                      <Input id={`${kind}-draft`} name="draft" value="保留当前输入" required />
                    </Field>
                    {kind !== "short" ? (
                      Array.from({ length: 24 }, (_, i) => (
                        <p>
                          正文 {i + 1}
                          ：读取内容、修改草稿与关闭窗口保持独立，标题和关闭入口始终属于同一顶部区域。
                        </p>
                      ))
                    ) : (
                      <p>短表单只使用内容所需的高度。</p>
                    )}
                  </Stack>
                  <Button
                    type="submit"
                    value="save"
                    size={kind === "limited" ? "small" : "default"}
                  >
                    保存{name}
                  </Button>
                </DialogPanel>
              </Dialog>
            </div>
          );
        })}
      </Stack>
    );
  },
});

export const CatalogFrameStory = defineStory({
  id: "page-frame-catalog",
  title: "页壳 · 换行标题与目录筛选",
  group: "导航与布局",
  groupOrder: 40,
  component: "PageFrame",
  variant: "自然页头与剩余正文",
  description: "标题、说明、刷新与分类共享自然高度；正文独立领取余量，不以百分比裁切页头控件。",
  render() {
    const selected = signal("all");
    return (
      <div style={{ height: "calc(100dvh - 90px)", minHeight: 0 }}>
        <PageFrame
          scrollOwner="layout"
          header={
            <Stack gap="compact">
              <PageHeader
                title="扩展目录"
                description="查看已授权的能力与页面，分类不会改变内容的身份。"
                actions={<Button variant="outline">刷新目录</Button>}
              />
              <SegmentedControl
                id="catalog-kind"
                label="目录分类"
                value={selected}
                onValueChange={(value) => {
                  selected.value = value;
                }}
                options={[
                  { value: "all", label: "全部" },
                  { value: "local", label: "本地" },
                  { value: "enabled", label: "已启用" },
                ]}
              />
            </Stack>
          }
        >
          <Stack>
            {Array.from({ length: 20 }, (_, index) => (
              <p>目录内容 {index + 1}：主区域保留自己的滚动范围。</p>
            ))}
          </Stack>
        </PageFrame>
      </div>
    );
  },
});
