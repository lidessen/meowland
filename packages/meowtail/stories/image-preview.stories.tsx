import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { ImagePreview } from "../src/components/image-preview";
import { Stack } from "../src/components/stack";
import { Button } from "../src/components/button";

const sample =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7d7fe"/><stop offset="0.6" stop-color="#fbe4d8"/><stop offset="1" stop-color="#fde8c8"/></linearGradient></defs><rect width="640" height="360" fill="url(#sky)"/><circle cx="452" cy="138" r="46" fill="#fff7ed"/><path d="M0 268c84-44 164-62 248-38s150 30 240-10 152-18 152-18v158H0Z" fill="#818cf8" fill-opacity="0.35"/><path d="M0 306c96-30 190-36 286-12s176 18 262-8 92-10 92-10v84H0Z" fill="#6366f1" fill-opacity="0.45"/></svg>',
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
      <ImagePreview src={sample} alt="Evening hills" loading="eager" />
      <ImagePreview src="/image-preview-delayed.svg" alt="Delayed-loading image" loading="eager" />
      <ImagePreview src="data:image/png,invalid" alt="Image that fails to load" loading="eager" />
      <div>
        <Button variant="outline">Host action</Button>
      </div>
    </Stack>
  ),
});
