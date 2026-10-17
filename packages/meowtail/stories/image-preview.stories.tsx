import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { ImagePreview } from "../src/components/image-preview";
import { Stack } from "../src/components/stack";
import { Button } from "../src/components/button";

const sample =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#edf3fe"/><circle cx="320" cy="180" r="100" fill="#4176e6"/></svg>',
  );
export const ImagePreviewStory = defineStory({
  id: "image-preview",
  title: "图片预览 · 加载与失败",
  group: "内容",
  render: () => (
    <Stack>
      <p>图片显示不增加点击目标；宿主可独立提供打开或移除操作。</p>
      <ImagePreview src={sample} alt="蓝色圆形" loading="eager" />
      <ImagePreview src="/image-preview-delayed.svg" alt="延迟加载图片" loading="eager" />
      <ImagePreview src="data:image/png,invalid" alt="无法加载的图片" loading="eager" />
      <Button variant="quiet">宿主操作</Button>
    </Stack>
  ),
});
