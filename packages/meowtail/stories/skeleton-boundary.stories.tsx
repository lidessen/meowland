import { h, mapSignal, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Field,
  Icon,
  Inline,
  Input,
  SkeletonBoundary,
  Stack,
} from "meowtail";
import { SchemePair } from "./scheme-pair";

const copy = {
  loading: "正在更新项目资料",
  name: "项目名称",
  project: "Meowland 工作空间",
  note: "资料更新期间保留内容的尺寸和排列。加载完成后继续编辑当前草稿。",
  start: "开始加载",
  finish: "加载完成",
  append: "补充内容",
  extra: "新增资料会跟随当前加载状态呈现。",
};
const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="72" viewBox="0 0 96 72"><rect width="96" height="72" rx="10" fill="#cbd5e1"/><circle cx="72" cy="21" r="9" fill="#f8fafc"/><path d="M0 61 31 28 52 49 68 35 96 65V72H0Z" fill="#64748b"/></svg>',
  );

export const SkeletonBoundaryStory = defineStory({
  id: "skeleton-boundary",
  title: "加载边界 · 保留已有内容",
  component: "SkeletonBoundary",
  variant: "已有内容与动态加载",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "浅色默认可编辑，深色默认加载；切换后输入节点和草稿保持不变。操作放在边界外。",
  covers: [
    "SkeletonBoundary",
    "Signal loading",
    "preserved input",
    "image and icon",
    "light and dark",
  ],
  render: () => (
    <SchemePair>
      {(scheme) => {
        const active = signal(scheme === "dark");
        const appended = signal(false);
        const id = scheme === "light" ? "skeleton-boundary-demo" : "skeleton-boundary-other";
        return (
          <Stack gap="normal">
            <SkeletonBoundary id={id} active={active} label={copy.loading}>
              <Card>
                <CardHeader>
                  <CardTitle>{copy.project}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Stack gap="normal">
                    <Inline align="center">
                      <img src={image} width={96} height={72} alt="项目封面" />
                      <Stack gap="compact">
                        <Inline align="center" gap="compact">
                          <Icon name="folder" />
                          <span>设计资源</span>
                        </Inline>
                        <span>{copy.note}</span>
                      </Stack>
                    </Inline>
                    <Field label={copy.name} htmlFor={`${id}-name`}>
                      <Input id={`${id}-name`} value={copy.project} />
                    </Field>
                    {mapSignal(appended, (value) =>
                      value ? <p data-testid={`${id}-extra`}>{copy.extra}</p> : null,
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </SkeletonBoundary>
            <Inline>
              <Button
                data-testid={`${id}-start`}
                variant="outline"
                onClick={() => {
                  active.value = true;
                }}
              >
                {copy.start}
              </Button>
              <Button
                data-testid={`${id}-finish`}
                variant="outline"
                onClick={() => {
                  active.value = false;
                }}
              >
                {copy.finish}
              </Button>
              <Button
                data-testid={`${id}-append`}
                variant="quiet"
                onClick={() => {
                  appended.value = true;
                }}
              >
                {copy.append}
              </Button>
            </Inline>
          </Stack>
        );
      }}
    </SchemePair>
  ),
});
