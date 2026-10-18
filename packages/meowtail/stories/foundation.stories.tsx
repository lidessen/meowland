import { h } from "meowjsx/runtime";
import { signal } from "meowjsx";
import { uiTokens } from "meowtail/theme";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogHeader,
  DialogPanel,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Input,
  Select,
  Textarea,
  Card,
  Stack,
  Grid,
  Container,
  Inline,
  LayoutItem,
} from "meowtail";
import { defineStory } from "meowbook";

export const ButtonsStory = defineStory({
  id: "buttons",
  title: "按钮 · 操作层级",
  group: "基础控件",
  groupOrder: 10,
  component: "Button",
  variant: "操作层级",
  description: "四种真实按钮变体及禁用状态。可用 Tab 查看焦点；禁用按钮不能触发操作。",
  covers: ["Button", "primary / quiet / outline / danger", "disabled", "keyboard focus"],
  render: () => (
    <Container width="narrow">
      <Stack data-button-composition>
        <Stack as="header" gap="compact">
          <h2 style={{ margin: 0, fontSize: uiTokens.fontTitle, fontWeight: 600 }}>
            准备好交付这次修改
          </h2>
          <span style={{ color: uiTokens.mutedForeground }}>
            主要操作明确，辅助操作退后一步。所有操作只在本地演示。
          </span>
        </Stack>
        <Inline gap="compact">
          <Button data-action="已保存本地示例">保存修改</Button>
          <Button variant="outline" data-action="差异示例已选择">
            查看差异
          </Button>
          <Button variant="quiet" data-action="继续编辑">
            继续编辑
          </Button>
        </Inline>
        <Stack as="section" gap="compact" aria-label="尚不可用的操作">
          <span style={{ color: uiTokens.mutedForeground, fontSize: uiTokens.fontCaption }}>
            尚未选择提交目标
          </span>
          <Inline gap="compact">
            <Button disabled>提交修改</Button>
            <Button variant="outline" disabled>
              预览提交
            </Button>
            <Button variant="quiet" disabled>
              撤销
            </Button>
            <Button variant="danger" disabled>
              删除
            </Button>
          </Inline>
        </Stack>
        <span
          style={{ color: uiTokens.mutedForeground, fontSize: uiTokens.fontCaption }}
          role="status"
          data-feedback
        >
          选择一个操作，查看即时反馈。
        </span>
        <Inline as="section" gap="normal" aria-label="丢弃草稿演示">
          <LayoutItem grow>
            <Stack gap="compact">
              <h2 style={{ margin: 0, fontSize: uiTokens.fontBody, fontWeight: 600 }}>重新开始</h2>
              <span style={{ color: uiTokens.mutedForeground, fontSize: uiTokens.fontCaption }}>
                仅演示丢弃操作，不会删除真实文件。
              </span>
            </Stack>
          </LayoutItem>
          <LayoutItem shrink={false}>
            <Button variant="danger" data-action="已演示丢弃草稿；没有删除真实文件">
              丢弃本地草稿
            </Button>
          </LayoutItem>
        </Inline>
      </Stack>
    </Container>
  ),
  setup({ root, report, onCleanup }) {
    const clicked = (event: Event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>("[data-action]");
      if (button) {
        const message = button.dataset.action ?? "";
        root.querySelector("[data-feedback]")!.textContent = message;
        report(message);
      }
    };
    root.addEventListener("click", clicked);
    onCleanup(() => root.removeEventListener("click", clicked));
  },
});

export const ButtonSizesStory = defineStory({
  id: "button-sizes",
  title: "按钮 · 尺寸与长文本",
  group: "基础控件",
  groupOrder: 10,
  component: "Button",
  variant: "尺寸与长文本",
  description: "小、默认、大尺寸及较长操作名称，观察窄画布上的换行与点击范围。",
  covers: ["Button", "IconButton", "small / default / large", "long label"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      {(["small", "default", "large"] as const).map((size, index) => (
        <section className="workshop-stack">
          <h2 className="workshop-section-title">
            {["紧凑工具栏", "常规操作", "重点入口"][index]}
          </h2>
          <div className="workshop-row">
            <Button size={size}>保存修改</Button>
            <Button size={size} variant="outline">
              查看工作成果
            </Button>
            <IconButton size={size} label={`${size} 搜索`}>
              <Icon name="search" />
            </IconButton>
            <IconButton size={size} label={`${size} 关闭`} disabled>
              <Icon name="x" />
            </IconButton>
          </div>
        </section>
      ))}
      <Button size="large" variant="quiet">
        查看当前项目中等待审阅的全部工作成果
      </Button>
    </div>
  ),
});

export const FieldsStory = defineStory({
  id: "fields",
  title: "输入 · 正常与长标签",
  group: "表单输入",
  groupOrder: 20,
  component: "Input",
  variant: "标签与说明",
  description: "原生输入行为与 Field 的标签关联；长标签、辅助说明和多行内容共同展示。",
  covers: ["Field", "Input", "Textarea", "Select", "label association", "long text"],
  render: () => {
    const delivery = signal("review");
    return (
      <form className="workshop-stack workshop-constrained" data-project-form novalidate>
        <Field
          label="项目名称"
          htmlFor="workshop-project"
          description="仅为本地演示，不会保存到服务。"
        >
          <Input id="workshop-project" name="project" value="Meowland" required />
        </Field>
        <Field
          label="交付方式"
          htmlFor="workshop-delivery"
          description="推荐先审阅差异，再决定是否提交。"
        >
          <Select
            id="workshop-delivery"
            name="delivery"
            aria-describedby="workshop-delivery-description"
            value={delivery}
            required
            onChange={(event) => {
              delivery.value = (event.currentTarget as HTMLSelectElement).value;
            }}
          >
            <option value="draft">保留草稿</option>
            <option value="review">先审阅差异</option>
            <option value="export">导出结果</option>
          </Select>
          <div className="workshop-foundation-field-action">
            <Button
              variant="quiet"
              size="small"
              onClick={() => {
                delivery.value = "review";
              }}
            >
              使用推荐设置
            </Button>
          </div>
        </Field>
        <Field
          label="补充这次工作需要遵循的约束，以及完成后希望如何检查结果"
          htmlFor="workshop-notes"
        >
          <Textarea id="workshop-notes" rows={4} placeholder="写下约束，也可以粘贴较长内容……" />
        </Field>
        <div className="workshop-row">
          <Button type="submit">保存项目</Button>
          <Button type="reset" variant="quiet">
            恢复初始值
          </Button>
        </div>
        <p className="workshop-feedback" id="project-feedback" role="status">
          修改名称后保存；留空可查看验证反馈。
        </p>
      </form>
    );
  },
  setup({ root, report, onCleanup }) {
    const form = root.querySelector<HTMLFormElement>("[data-project-form]")!;
    const input = root.querySelector<HTMLInputElement>("#workshop-project")!;
    // This fixture opts into native form reset; value is otherwise a live property.
    input.defaultValue = input.value;
    for (const option of root.querySelectorAll<HTMLOptionElement>("#workshop-delivery option"))
      option.defaultSelected = option.selected;
    const feedback = root.querySelector<HTMLElement>("#project-feedback")!;
    const submit = (event: Event) => {
      event.preventDefault();
      const valid = !!input.value.trim();
      input.setAttribute("aria-invalid", String(!valid));
      input.setCustomValidity(valid ? "" : "请输入项目名称");
      input.setAttribute("aria-describedby", "workshop-project-description project-feedback");
      feedback.textContent = valid
        ? `已保存「${input.value.trim()}」（仅本地示例）。`
        : "请输入项目名称，不能只包含空格。";
      if (!valid) input.focus();
      report(feedback.textContent);
    };
    const reset = () => {
      input.removeAttribute("aria-invalid");
      input.setCustomValidity("");
      feedback.textContent = "已恢复初始值。";
    };
    form.addEventListener("submit", submit);
    form.addEventListener("reset", reset);
    onCleanup(() => {
      form.removeEventListener("submit", submit);
      form.removeEventListener("reset", reset);
    });
  },
});

export const FieldErrorsStory = defineStory({
  id: "field-errors",
  title: "输入 · 错误与禁用",
  group: "表单输入",
  groupOrder: 20,
  component: "Input",
  variant: "错误与禁用",
  description: "错误说明由真实 Field 关联到控件；禁用输入保持可读。此例为固定错误状态。",
  covers: ["Field error", "aria-invalid", "aria-describedby", "Input disabled", "Textarea error"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <Field label="项目名称" htmlFor="workshop-invalid" error="请输入项目名称，不能只包含空格。">
        <Input id="workshop-invalid" value="" />
      </Field>
      <Field label="工作目录" htmlFor="workshop-disabled" description="执行过程中不能更换目录。">
        <Input id="workshop-disabled" value="/workspace/meowland" disabled />
      </Field>
      <Field
        label="执行环境"
        htmlFor="workshop-disabled-select"
        description="工作进行中，暂时不能切换。"
      >
        <Select id="workshop-disabled-select" disabled>
          <option>本地工作区</option>
        </Select>
      </Field>
      <Field
        label="补充说明"
        htmlFor="workshop-invalid-notes"
        error="说明超出当前示例允许的长度，请精简后继续。"
      >
        <Textarea id="workshop-invalid-notes" rows={3}>
          需要补充的一段较长说明。
        </Textarea>
      </Field>
    </div>
  ),
});

export const BadgesStory = defineStory({
  id: "badges",
  title: "标签 · 状态与长名称",
  group: "基础控件",
  groupOrder: 10,
  component: "Badge",
  variant: "状态与长名称",
  description: "展示 Badge 的实际呈现。标签使用文字表达状态，不依赖颜色区分。",
  covers: [
    "Badge",
    "neutral / accent / success / warning / danger",
    "small / default",
    "long label",
  ],
  render: () => (
    <div className="workshop-stack">
      <h2 className="workshop-section-title">常规标签</h2>
      <div className="workshop-row">
        <Badge tone="neutral">未开始</Badge>
        <Badge tone="accent">处理中</Badge>
        <Badge tone="success">已完成</Badge>
        <Badge tone="warning">等待输入</Badge>
        <Badge tone="danger">失败</Badge>
        <Badge>一个需要在窄屏查看的较长状态说明</Badge>
      </div>
      <h2 className="workshop-section-title">紧凑标签</h2>
      <div className="workshop-row">
        <Badge size="small">未开始</Badge>
        <Badge size="small" tone="accent">
          处理中
        </Badge>
        <Badge size="small" tone="success">
          已完成
        </Badge>
        <Badge size="small" tone="warning">
          等待输入
        </Badge>
        <Badge size="small" tone="danger">
          失败
        </Badge>
      </div>
    </div>
  ),
});

export const EmptyStateStory = defineStory({
  id: "empty-state",
  title: "空态 · 说明与下一步",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "EmptyState",
  variant: "说明与下一步",
  description: "真实空态组件与操作入口。按钮只在本地记录操作，不创建真实工作。",
  covers: ["EmptyState", "title / copy / action"],
  render: () => (
    <div className="workshop-foundation-empty-grid">
      <section className="workshop-foundation-empty-sample">
        <h2 className="workshop-section-title">尚无内容 · 提供下一步</h2>
        <EmptyState
          title="还没有工作成果"
          copy="和 Assistant 说说你想推进的事，完成的成果会出现在这里。"
          action={<Button data-empty-start>开始对话</Button>}
        />
        <p className="workshop-feedback" data-feedback role="status" />
      </section>
      <section className="workshop-foundation-empty-sample">
        <h2 className="workshop-section-title">已经处理完 · 无需操作</h2>
        <EmptyState title="当前没有等待审阅的修改" />
      </section>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const button = root.querySelector<HTMLButtonElement>("[data-empty-start]");
    const click = () => {
      const message = "已选择开始对话。此组件样例不会创建真实会话。";
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    button?.addEventListener("click", click);
    onCleanup(() => button?.removeEventListener("click", click));
  },
});

export const CompactEmptyStateStory = defineStory({
  id: "empty-state-compact",
  title: "空态 · 局部阅读与编辑区域",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "EmptyState",
  variant: "局部空态与邻接控件",
  description: "整页与局部空态共用结构；局部说明保持阅读尺度，操作与对应空区域相邻。",
  render: () => (
    <Stack>
      <Field label="目录筛选" htmlFor="compact-empty-filter">
        <Input id="compact-empty-filter" placeholder="输入文件名" />
      </Field>
      <Grid minColumnWidth="normal">
        <Card>
          <EmptyState
            size="compact"
            title="选择一个文件"
            copy="从左侧文件列表选择后，在这里查看完整内容与本地编辑草稿。"
          />
        </Card>
        <Card>
          <EmptyState
            size="compact"
            title="当前没有文件变化"
            copy="工作目录与暂存区均无可显示的变化。仍可查看历史记录，长路径不会改变空态的阅读范围。"
            action={<Button variant="outline">查看历史</Button>}
          />
        </Card>
      </Grid>
      <EmptyState
        title="工作区还是空的"
        copy="打开已有目录，或创建第一个文件。"
        action={<Button>创建文件</Button>}
      />
    </Stack>
  ),
});

export const DialogStory = defineStory({
  id: "dialog",
  title: "弹窗 · 键盘与焦点回返",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "Dialog",
  variant: "确认与返回",
  description:
    "使用真实 dialog.showModal。打开后焦点进入弹窗，Escape 或取消关闭，焦点回到打开按钮。",
  covers: ["Dialog", "DialogPanel / Header / Actions", "showModal", "Escape", "focus return"],
  render: () => (
    <div className="workshop-stack workshop-constrained">
      <header className="workshop-composition-header">
        <h2>结束前，留一次确认</h2>
        <p className="workshop-note">用 Escape 或取消返回；危险操作保留明确的文字。</p>
      </header>
      <Button data-open-dialog>打开确认弹窗</Button>
      <p className="workshop-feedback" data-feedback role="status">
        当前工作仍在进行。
      </p>
      <Dialog labelledBy="workshop-dialog-title" describedBy="workshop-dialog-description">
        <DialogPanel
          header={
            <DialogHeader
              title="结束当前工作？"
              titleId="workshop-dialog-title"
              description="这是本地演示，不会影响真实任务。可以取消并继续查看组件。"
              descriptionId="workshop-dialog-description"
            />
          }
        >
          <DialogActions>
            <Button variant="quiet" data-close-dialog="cancel" autofocus>
              取消
            </Button>
            <Button variant="danger" data-close-dialog="confirm">
              结束工作
            </Button>
          </DialogActions>
        </DialogPanel>
      </Dialog>
    </div>
  ),
  setup({ root, report, onCleanup }) {
    const trigger = root.querySelector<HTMLButtonElement>("[data-open-dialog]");
    const dialog = root.querySelector<HTMLDialogElement>("dialog");
    if (!trigger || !dialog) return;
    const open = () => {
      dialog.returnValue = "";
      dialog.showModal();
      report("弹窗已打开");
    };
    const click = (event: Event) => {
      const target = (event.target as Element).closest<HTMLElement>("[data-close-dialog]");
      if (target) dialog.close(target.dataset.closeDialog);
    };
    const close = () => {
      trigger.focus();
      const message =
        dialog.returnValue === "confirm"
          ? "本地示例已结束。重置样例可重新开始。"
          : "已返回，当前工作继续。";
      root.querySelector("[data-feedback]")!.textContent = message;
      report(message);
    };
    trigger.addEventListener("click", open);
    dialog.addEventListener("click", click);
    dialog.addEventListener("close", close);
    onCleanup(() => {
      trigger.removeEventListener("click", open);
      dialog.removeEventListener("click", click);
      dialog.removeEventListener("close", close);
      if (dialog.open) dialog.close();
    });
  },
});
