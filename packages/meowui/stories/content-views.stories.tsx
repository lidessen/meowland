import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Stack } from "../src/components/stack";
import { WebBlock } from "../src/components/web-block";
import { JsonBlock } from "../src/components/json-block";
import { JsonTree } from "../src/components/json-tree";
import { ImageLightbox } from "../src/components/image-lightbox";

const sampleImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#edf3fe"/><circle cx="320" cy="180" r="100" fill="#4176e6"/></svg>',
  );
export const ContentViewsStory = defineStory({
  id: "content-views",
  title: "内容查看 · 来源、JSON 与图片",
  group: "内容",
  render: () => (
    <Stack>
      <WebBlock
        kind="search"
        answer="来源由宿主提供；组件不会发起检索。"
        sources={[
          { title: "Example", url: "https://example.com", snippet: "一条可核对的来源说明。" },
          { url: "javascript:alert(1)", title: "不可导航的来源" },
        ]}
      />
      <JsonTree
        data={{ name: "Meowland", options: { theme: "DeepSeek", enabled: true }, items: [1, 2, 3] }}
      />
      <JsonBlock text={'{"broken":'} />
      <ImageLightbox src={sampleImage} alt="蓝色圆形示例" caption="图片预览 · Escape 返回原按钮" />
    </Stack>
  ),
});

export const JsonTreeStatesStory = defineStory({
  id: "json-tree-states",
  title: "JSON 查看 · 属性、展开与复制反馈",
  group: "内容",
  render: () => (
    <Stack>
      <JsonTree
        label="结果"
        data={{
          path: "/workspace/meowland/src/main.ts",
          count: 3,
          enabled: true,
          empty: null,
          nested: { text: "<内容>\n第二行", items: [1, 2] },
        }}
      />
      <JsonTree
        label="复制失败示例"
        data={{ message: "可以选择文本复制" }}
        onCopy={async () => {
          throw new Error("clipboard unavailable");
        }}
      />
    </Stack>
  ),
});
