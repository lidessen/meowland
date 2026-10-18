import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Field,
  Grid,
  Inline,
  Input,
  PageFrame,
  PageHeader,
  Popover,
  Stack,
  Toolbar,
} from "meowtail";

export const WorkspaceCompositionStory = defineStory({
  id: "workspace-composition",
  title: "工作区组合 · 固定页头、表单与动态正文",
  group: "导航与布局",
  groupOrder: 40,
  component: "PageFrame",
  variant: "共享布局与控件组合",
  description: "同一组公共组件组合成可滚动表单；窄短窗口仍能返回工具栏，浮层不随正文裁切。",
  covers: [
    "fixed header",
    "layout scroll owner",
    "nested grid",
    "dynamic content",
    "form draft",
    "toolbar",
    "popover",
  ],
  render: () => {
    const expanded = signal(false);
    const draft = signal("");
    const feedback = signal("尚未检查本地草稿。");
    return (
      <div style={{ height: "min(640px, calc(100dvh - 90px))" }} data-workspace-composition>
        <PageFrame
          variant="workspace"
          scrollOwner="layout"
          toolbar={
            <Toolbar label="组合工作区工具栏">
              <Button
                variant="outline"
                onClick={() => {
                  expanded.value = !expanded.value;
                }}
              >
                {mapSignal(expanded, (value) => (value ? "收起检查项" : "展开检查项"))}
              </Button>
              <Popover
                id="workspace-review-options"
                trigger={(bindings) => (
                  <Button {...bindings} variant="quiet">
                    检查选项
                  </Button>
                )}
              >
                <Stack gap="compact" align="start">
                  <span>窗口变化后继续核对当前草稿。</span>
                  <Button
                    size="small"
                    onClick={() => {
                      feedback.value = "已检查当前本地草稿。";
                    }}
                  >
                    检查当前草稿
                  </Button>
                </Stack>
              </Popover>
            </Toolbar>
          }
          header={<PageHeader title="核对共享组件中的阅读、输入与末尾动作" />}
        >
          <Container width="content">
            <Stack>
              <Grid minColumnWidth="compact">
                <Card>
                  <CardHeader>
                    <CardTitle>保留当前输入</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Field label="组合草稿" htmlFor="workspace-composition-draft">
                      <Input
                        id="workspace-composition-draft"
                        value={draft}
                        onInput={(event: Event) => {
                          draft.value = (event.currentTarget as HTMLInputElement).value;
                        }}
                      />
                    </Field>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>核对内容边界</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>标题、表单与说明共享主题默认尺度；页面宽度改变时保留同一输入节点。</p>
                  </CardContent>
                </Card>
              </Grid>
              <Stack gap="compact" data-workspace-composition-content>
                {mapSignal(expanded, (value) =>
                  Array.from({ length: value ? 28 : 10 }, (_, index) => (
                    <p>
                      检查项 {index + 1}
                      ：动态内容沿自然文流增长，正文区域承接滚动，工具栏和页头保持原位置。
                    </p>
                  )),
                )}
              </Stack>
              <Inline as="footer">
                <Button
                  onClick={() => {
                    feedback.value = "已检查当前本地草稿。";
                  }}
                >
                  检查末尾草稿
                </Button>
                <span role="status">{feedback}</span>
              </Inline>
            </Stack>
          </Container>
        </PageFrame>
      </div>
    );
  },
});
