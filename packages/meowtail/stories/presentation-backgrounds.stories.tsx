import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Inline, Input, Stack } from "meowtail";
import {
  Presentation,
  PresentationLayout,
  type SlideBackground,
  type SlideDefinition,
} from "meowtail/presentation";
import coast from "../../../examples/presentation/assets/coast-delivery.jpg";

export const PresentationBackgroundsStory = defineStory({
  id: "presentation-backgrounds",
  title: "演示背景 · 让画面服务于阅读",
  group: "演示与媒体",
  component: "Presentation",
  variant: "默认、逐页覆盖与动态背景",
  description: "同一页内容骨架搭配渐变、裁切图片与可读遮罩；背景变化保留草稿和焦点。",
  covers: [
    "deck background",
    "page override",
    "theme reset",
    "cover and contain",
    "foreground",
    "failed image fallback",
    "background signal identity",
  ],
  render: () => {
    const deckBackground = signal<SlideBackground>({
      fill: "linear-gradient(125deg, #e7eee6 0%, #f7f1df 55%, #dfebea 100%)",
      foreground: "dark",
    });
    const dynamicBackground = signal<SlideBackground | undefined>({
      fill: "#f0e8dc",
      image: { src: `${coast}?variant=light`, fit: "contain", position: "right" },
      overlay: "linear-gradient(90deg, #f0e8dc, rgba(240, 232, 220, .86))",
      foreground: "dark",
    });
    const draft = signal("");
    let dark = false;
    let dynamicMounts = 0;
    const slides: readonly SlideDefinition[] = [
      {
        id: "deck",
        title: "共享渐变",
        render: () => (
          <PresentationLayout footer={<small>渐变属于整场默认；下一页可以完整覆盖。</small>}>
            <Stack justify="center" gap="relaxed">
              <small>为观点留出阅读空间</small>
              <h1>背景提供气氛，内容保持主角</h1>
              <p>先确定文字的明暗和位置，再选择背景。</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "cover",
        title: "图片与阅读遮罩",
        background: {
          fill: "#173d36",
          image: { src: coast, position: "top right" },
          overlay:
            "linear-gradient(90deg, rgba(12, 34, 31, .92), rgba(12, 34, 31, .7) 48%, rgba(12, 34, 31, .12))",
          foreground: "light",
        },
        render: () => (
          <PresentationLayout
            footer={<small>原创海岸插画来自图片等待演示；此处作为装饰背景。</small>}
          >
            <Stack justify="center" gap="relaxed">
              <small>图像铺满画布，阅读区保留深色遮罩</small>
              <h1>
                让文字与风景
                <br />
                各有清晰的位置
              </h1>
              <p>cover 可以裁切；重点不交给背景中的细节。</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "contain",
        title: "完整图像与底色",
        background: {
          fill: "#e8eee8",
          image: { src: coast, fit: "contain", position: "right" },
          overlay:
            "linear-gradient(90deg, #e8eee8 0%, rgba(232, 238, 232, .96) 42%, rgba(232, 238, 232, .12))",
          foreground: "dark",
        },
        render: () => (
          <PresentationLayout
            columns="equal"
            footer={<small>contain 保留完整图片比例；空白区域使用本页底色。</small>}
          >
            <Stack justify="center" gap="relaxed">
              <h2>先保留完整图像，再安排阅读区域</h2>
              <p>背景是装饰；需要观众核对的图表仍放在正文区域，并提供说明。</p>
            </Stack>
            <div />
          </PresentationLayout>
        ),
      },
      {
        id: "theme",
        title: "显式主题背景",
        background: "theme",
        render: () => (
          <PresentationLayout>
            <Stack justify="center" gap="relaxed">
              <small>这一页回到标准主题</small>
              <h1>
                暂停视觉变化，
                <br />
                让一句话留下来
              </h1>
              <p>显式 theme 不继承整场渐变、图片或遮罩。</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "dark",
        title: "深色底与浅色字",
        background: { fill: "#142c35", foreground: "light" },
        render: () => (
          <PresentationLayout
            footer={<small>foreground="light" 指文字颜色，背景由作者明确提供。</small>}
          >
            <Stack justify="center" gap="relaxed">
              <small>一次停顿</small>
              <h1>
                颜色只改变画面，
                <br />
                不改变信息的次序
              </h1>
              <p>深色底配浅色正文，控件继续使用共享主题。</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "fallback",
        title: "无图片时仍可阅读",
        background: {
          fill: "#153a34",
          image: { src: "/missing-presentation-background.jpg" },
          overlay: "linear-gradient(135deg, rgba(12, 25, 34, .55), rgba(12, 25, 34, .15))",
          foreground: "light",
        },
        render: () => (
          <PresentationLayout
            footer={<small>故意缺失的图片用于验证；底色、遮罩和文字明暗保持原约定。</small>}
          >
            <Stack justify="center" gap="relaxed">
              <small>图片不可用的状态</small>
              <h1>
                没有图，
                <br />
                这页也应读得清楚
              </h1>
              <p>不要让底色的可读性依赖一张必定成功加载的图片。</p>
            </Stack>
          </PresentationLayout>
        ),
      },
      {
        id: "dynamic",
        title: "变化背景，保留输入",
        background: dynamicBackground,
        render: () => {
          dynamicMounts += 1;
          return (
            <PresentationLayout
              footer={<small>背景 Signal 只更新装饰，当前内容实例继续存在。</small>}
            >
              <Stack justify="center" gap="relaxed" data-background-content-mount={dynamicMounts}>
                <h2>画面可以改变，草稿继续留在这里</h2>
                <p>先输入，再用按钮切换底色；内容、输入与焦点不因背景更新重建。</p>
                <Input
                  aria-label="背景草稿"
                  placeholder="写下一句要保留的草稿"
                  value={draft}
                  onInput={(event: Event) => {
                    draft.value = (event.currentTarget as HTMLInputElement).value;
                  }}
                />
                <Inline>
                  <Button
                    data-background-cycle
                    onClick={() => {
                      dark = !dark;
                      dynamicBackground.value = dark
                        ? {
                            fill: "#142f33",
                            image: { src: `${coast}?variant=dark` },
                            overlay: "linear-gradient(90deg, #142f33, rgba(20, 47, 51, .85))",
                            foreground: "light",
                          }
                        : {
                            fill: "#f0e8dc",
                            image: {
                              src: `${coast}?variant=light`,
                              fit: "contain",
                              position: "right",
                            },
                            overlay: "linear-gradient(90deg, #f0e8dc, rgba(240, 232, 220, .86))",
                            foreground: "dark",
                          };
                    }}
                  >
                    切换背景
                  </Button>
                  <Button
                    variant="outline"
                    data-background-inherit
                    onClick={() => {
                      dynamicBackground.value = undefined;
                    }}
                  >
                    继承整场背景
                  </Button>
                  <Button
                    variant="outline"
                    data-background-deck
                    onClick={() => {
                      deckBackground.value = { fill: "#e3edf2", foreground: "dark" };
                    }}
                  >
                    更新整场底色
                  </Button>
                </Inline>
              </Stack>
            </PresentationLayout>
          );
        },
      },
    ];
    return (
      <div style={{ height: "min(900px, calc(100dvh - 90px))" }}>
        <Presentation
          title="常用演示背景"
          slides={slides}
          background={deckBackground}
          active={false}
        />
      </div>
    );
  },
  async ready({ root }) {
    await root.ownerDocument.fonts.ready;
  },
});
