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
  title: "Image preview · Loading and failure",
  group: "Content",
  render: () => (
    <Stack>
      <p>
        Displaying an image adds no click target; the host can provide open or remove actions
        separately.
      </p>
      <ImagePreview src={sample} alt="Blue circle" loading="eager" />
      <ImagePreview src="/image-preview-delayed.svg" alt="Delayed-loading image" loading="eager" />
      <ImagePreview src="data:image/png,invalid" alt="Image that fails to load" loading="eager" />
      <Button variant="quiet">Host action</Button>
    </Stack>
  ),
});
