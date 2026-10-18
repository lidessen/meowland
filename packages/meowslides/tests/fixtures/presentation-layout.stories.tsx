import { h } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Presentation,
  PresentationLayout,
  type PresentationLayoutProps,
  type SlideDefinition,
} from "meowslides";
import { AspectRatio, Stack } from "meowtail";

const combinations = [
  { id: "both", header: true, footer: true },
  { id: "header", header: true, footer: false },
  { id: "footer", header: false, footer: true },
  { id: "neither", header: false, footer: false },
] as const;
const columns: readonly PresentationLayoutProps["columns"][] = [
  "single",
  "equal",
  "wide-start",
  "wide-end",
];
const slides: readonly SlideDefinition[] = combinations.flatMap((combination) =>
  columns.map((column) => ({
    id: `${combination.id}-${column}`,
    title: `${combination.id}-${column}`,
    render: () => (
      <PresentationLayout
        columns={column}
        header={
          combination.header ? (
            <h2>长标题与两行说明仍然占据自然高度，然后把其余空间分配给内容区域</h2>
          ) : undefined
        }
        footer={combination.footer ? <small>来源、条件与补充说明保持自然高度。</small> : undefined}
      >
        <Stack justify="center" data-layout-first>
          <h3>主要内容</h3>
          <p>占位图与短说明先确定区域。</p>
          {combination.id === "neither" && column === "equal" ? (
            <AspectRatio
              ratio={4 / 3}
              style={{ border: "1px dashed currentColor", display: "grid", placeItems: "center" }}
            >
              <span>图片占位 · 4:3</span>
            </AspectRatio>
          ) : null}
        </Stack>
        {column !== "single" ? (
          <Stack justify="center" data-layout-second>
            <h3>补充内容</h3>
            <p>较长说明保留在自己的区域中，列比不会随着宿主窗口变化而改变。</p>
          </Stack>
        ) : null}
      </PresentationLayout>
    ),
  })),
);

export const PresentationLayoutBoundaries = defineStory({
  id: "presentation-layout-boundaries",
  title: "Presentation layout boundary fixture",
  render: () => (
    <div style={{ height: "calc(100dvh - 90px)" }}>
      <Presentation title="Layout boundaries" slides={slides} active={false} />
    </div>
  ),
});
