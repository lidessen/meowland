import { h, signal, mapSignal } from "meowjsx";
import { defineStory } from "meowbook";
import { Skeleton, Button, Stack, Container } from "meowui";
export const Skeletons = defineStory({
  id: "skeleton",
  title: "加载占位 · 保留内容结构",
  component: "Skeleton",
  variant: "加载与结果",
  group: "浮层与反馈",
  groupOrder: 30,
  description: "占位本身不播报。容器表达加载状态，并保留文字说明；按钮模拟本地加载完成。",
  covers: ["Skeleton", "loading", "aria-busy"],
  render: () => {
    const loading = signal(true);
    return (
      <Container width="content">
        <Stack>
          <section aria-label="项目摘要" aria-busy={loading}>
            {mapSignal(loading, (value) =>
              value ? (
                <Stack>
                  <p>正在读取项目摘要…</p>
                  <Skeleton shape="circle" />
                  <Skeleton style={{ width: "70%" }} />
                  <Skeleton />
                  <Skeleton shape="block" />
                </Stack>
              ) : (
                <div>
                  <h3>网站改版</h3>
                  <p>设计稿已整理完成，下一步核对窄屏布局。</p>
                </div>
              ),
            )}
          </section>
          <Button
            variant="outline"
            onClick={() => {
              loading.value = !loading.value;
            }}
          >
            {mapSignal(loading, (value) => (value ? "模拟加载完成" : "重新演示加载"))}
          </Button>
        </Stack>
      </Container>
    );
  },
});
