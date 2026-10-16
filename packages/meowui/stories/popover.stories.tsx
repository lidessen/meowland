import { h, signal, mapSignal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Field,
  Input,
  Popover,
  ChoiceSelect,
  Dialog,
  DialogPanel,
  DialogHeader,
  Stack,
} from "meowui";

export const PopoverEscapeStory = defineStory({
  id: "popover-escape",
  title: "浮层 · 子控件与模态关闭",
  group: "浮层与反馈",
  component: "Popover",
  covers: ["Popover", "child DOM Escape", "Dialog", "unmount"],
  render() {
    let dialog: HTMLDialogElement | undefined;
    const childOpen = signal(false);
    const mounted = signal(true);
    const parentKeys = signal(0);
    const childKeys = signal(0);
    let closeFromCallback = false;
    return (
      <Stack gap="normal">
        <Button onClick={() => dialog?.showModal()}>打开浮层对话框</Button>
        <Dialog
          id="escape-dialog"
          labelledBy="escape-title"
          ref={(node: HTMLDialogElement) => {
            dialog = node;
          }}
        >
          <DialogPanel
            header={
              <DialogHeader
                title="局部编辑与返回"
                titleId="escape-title"
                actions={
                  <Button variant="quiet" onClick={() => dialog?.close()}>
                    关闭对话框
                  </Button>
                }
              />
            }
          >
            <Stack gap="normal">
              <p>输入控件先处理自己的 Escape；未处理时再关闭当前浮层。</p>
              <Popover
                id="escape-parent"
                onKeyDown={(event) => {
                  if (event.key === "Escape") parentKeys.value++;
                }}
                trigger={(bindings) => <Button {...bindings}>打开父浮层</Button>}
              >
                <Stack gap="normal">
                  <Field label="局部草稿">
                    <Input aria-label="局部草稿" />
                  </Field>
                  {mapSignal(mounted, (shown) =>
                    shown ? (
                      <Popover
                        id="escape-child"
                        open={childOpen}
                        onOpenChange={(next) => {
                          childOpen.value = next;
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            childKeys.value++;
                            if (closeFromCallback) childOpen.value = false;
                          }
                        }}
                        trigger={(bindings) => <Button {...bindings}>打开子浮层</Button>}
                      >
                        <Stack gap="normal">
                          <Input aria-label="子浮层草稿" />
                          <Button
                            onClick={() => {
                              closeFromCallback = true;
                            }}
                          >
                            回调关闭子浮层
                          </Button>
                          <Button
                            onClick={() => {
                              childOpen.value = false;
                            }}
                          >
                            关闭子浮层
                          </Button>
                          <Button
                            onClick={() => {
                              mounted.value = false;
                            }}
                          >
                            移除子浮层
                          </Button>
                        </Stack>
                      </Popover>
                    ) : (
                      <Button
                        onClick={() => {
                          childOpen.value = false;
                          mounted.value = true;
                        }}
                      >
                        恢复子浮层
                      </Button>
                    ),
                  )}
                </Stack>
              </Popover>
              <output id="escape-callbacks">
                父层 {parentKeys} · 子层 {childKeys}
              </output>
            </Stack>
          </DialogPanel>
        </Dialog>
      </Stack>
    );
  },
});

export const PopoverStory = defineStory({
  id: "popover",
  title: "浮层 · 就地编辑与返回",
  group: "浮层与反馈",
  groupOrder: 30,
  component: "Popover",
  variant: "就地编辑与嵌套",
  description: "在当前操作旁展开内容；可嵌套、受控开闭，Escape 返回上层。",
  covers: ["Popover", "controlled", "nested", "edge positioning", "focus return"],
  render() {
    const controlled = signal(false);
    const retained = signal(false);
    const redirected = signal(false);
    let external: HTMLElement | undefined;
    const paneTitle = signal("选择设置");
    let inPane = false;
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>留在手边的设置</h2>
          <p>修改显示方式，然后回到正在阅读的内容。</p>
        </header>
        <div className="workshop-actions">
          <Popover
            id="display-popover"
            role="dialog"
            labelledBy="display-title"
            trigger={(bindings) => (
              <Button variant="outline" {...bindings}>
                显示设置
              </Button>
            )}
          >
            <div className="workshop-section">
              <header className="workshop-composition-header">
                <h2 id="display-title">显示设置</h2>
                <p>只影响当前预览。</p>
              </header>
              <Field label="显示名称" htmlFor="popover-name">
                <Input id="popover-name" value="工作视图" />
              </Field>
              <Popover
                id="nested-popover"
                role="dialog"
                labelledBy="nested-title"
                align="end"
                trigger={(bindings) => (
                  <Button variant="quiet" {...bindings}>
                    更多设置
                  </Button>
                )}
              >
                <div className="workshop-section">
                  <h3 id="nested-title" className="workshop-section-title">
                    阅读宽度
                  </h3>
                  <p className="workshop-note">保留正文空间，让辅助操作退到一旁。</p>
                  <Input aria-label="宽度备注" placeholder="写下偏好…" />
                </div>
              </Popover>
            </div>
          </Popover>
          <Popover
            id="controlled-popover"
            open={controlled}
            onOpenChange={(next) => {
              controlled.value = next;
            }}
            role="dialog"
            labelledBy="controlled-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                打开受控面板
              </Button>
            )}
          >
            <div className="workshop-section">
              <h3 id="controlled-title" className="workshop-section-title">
                由宿主管理开闭
              </h3>
              <p className="workshop-note">关闭后回到触发位置。</p>
              <Button
                onClick={() => {
                  controlled.value = false;
                }}
              >
                关闭受控面板
              </Button>
            </div>
          </Popover>
          <Button
            variant="quiet"
            ref={(element: HTMLElement) => {
              external = element;
            }}
          >
            外部操作
          </Button>
          <Popover
            id="retained-popover"
            open={retained}
            onOpenChange={(next) => {
              if (next) retained.value = true;
            }}
            role="dialog"
            labelledBy="retained-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                保持受控面板
              </Button>
            )}
          >
            <h3 id="retained-title">宿主保留当前面板</h3>
            <Input aria-label="保留面板草稿" value="等待宿主处理" />
          </Popover>
          <Popover
            id="redirected-popover"
            open={redirected}
            onOpenChange={(next) => {
              redirected.value = next;
              if (!next) external?.focus();
            }}
            role="dialog"
            labelledBy="redirected-title"
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                关闭后继续外部操作
              </Button>
            )}
          >
            <h3 id="redirected-title">宿主指定后续焦点</h3>
            <p>关闭后继续访问外部动作。</p>
          </Popover>
          <Popover
            id="pane-popover"
            role="dialog"
            labelledBy="pane-title"
            onKeyDown={(event) => {
              if (event.key === "Escape" && inPane) {
                event.preventDefault();
                inPane = false;
                paneTitle.value = "选择设置";
              }
            }}
            onOpenChange={() => {
              inPane = false;
              paneTitle.value = "选择设置";
            }}
            trigger={(bindings) => (
              <Button variant="quiet" {...bindings}>
                分层设置
              </Button>
            )}
          >
            <div className="workshop-section">
              <h3 id="pane-title">{paneTitle}</h3>
              <Button
                onClick={() => {
                  inPane = true;
                  paneTitle.value = "设置详情";
                }}
              >
                进入详情
              </Button>
            </div>
          </Popover>
        </div>
      </div>
    );
  },
});

export const ChoiceSelectStory = defineStory({
  id: "choice-select",
  title: "选择 · 自定义弹层与键盘",
  group: "表单输入",
  groupOrder: 20,
  component: "ChoiceSelect",
  variant: "键盘与表单",
  description: "Popover 承载单选；方向键、字符定位和原生表单校验保持连续。",
  covers: ["ChoiceSelect", "Popover", "keyboard", "required", "form reset"],
  render() {
    const feedback = signal("配置仅在本地演示，不会发布内容。");
    const controlled = signal("draft");
    return (
      <form
        className="workshop-stack workshop-constrained"
        onSubmit={(event: SubmitEvent) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget as HTMLFormElement);
          feedback.value = `已提交：${data.get("delivery")} · ${data.get("environment")}`;
        }}
      >
        <header className="workshop-composition-header">
          <h2>准备交付</h2>
          <p>选项就在当前位置展开，长名称可以完整阅读。</p>
        </header>
        <Field
          label="交付目标"
          htmlFor="custom-delivery"
          description="方向键移动，Enter 确认，Escape 返回。"
        >
          <ChoiceSelect
            id="custom-delivery"
            name="delivery"
            defaultValue="review"
            options={[
              { value: "draft", label: "保留为本地草稿", group: "当前项目" },
              { value: "review", label: "交给项目负责人审阅完整修改与验证记录", group: "当前项目" },
              { value: "remote", label: "远端项目 · 尚未连接", group: "其他位置", disabled: true },
              { value: "archived", label: "归入项目存档", group: "其他位置" },
            ]}
          />
        </Field>
        <Field
          label="发布环境"
          htmlFor="custom-environment"
          description="必选，提交时使用原生表单校验。"
        >
          <ChoiceSelect
            id="custom-environment"
            name="environment"
            required
            placeholder="选择环境…"
            options={[
              { value: "local", label: "仅本地预览" },
              { value: "staging", label: "测试环境" },
            ]}
          />
        </Field>
        <Field label="可搜索模型" htmlFor="searchable-model">
          <ChoiceSelect
            id="searchable-model"
            searchable
            searchPlaceholder="搜索模型名称或 ID"
            defaultValue=""
            options={[
              { value: "", label: "跟随运行器默认" },
              { value: "gpt-6-astra", label: "GPT-6-Astra · gpt-6-astra" },
              { value: "gpt-6-sol", label: "GPT-6-Sol · gpt-6-sol" },
              { value: "gpt-6-luna", label: "GPT-6-Luna · gpt-6-luna" },
            ]}
          />
        </Field>
        <Field
          label="受控选择"
          htmlFor="custom-controlled"
          description="表单重置保留调用方当前选项。"
        >
          <ChoiceSelect
            id="custom-controlled"
            name="controlled"
            value={controlled}
            onValueChange={(next) => {
              controlled.value = next;
            }}
            options={[
              { value: "draft", label: "保留草稿" },
              { value: "review", label: "提交审阅" },
            ]}
          />
        </Field>
        <div className="workshop-actions">
          <Button type="submit">提交配置</Button>
          <Button variant="quiet" type="reset">
            恢复默认
          </Button>
        </div>
        <p role="status" className="workshop-feedback">
          {feedback}
        </p>
      </form>
    );
  },
});
