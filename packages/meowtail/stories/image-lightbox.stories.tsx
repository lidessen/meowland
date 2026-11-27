import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ImageLightbox } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

const sample =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#edf3fe"/><circle cx="320" cy="180" r="100" fill="#4176e6"/></svg>',
  );

export const ImageLightboxStory = defineStory({
  id: "image-lightbox",
  title: "Image Lightbox · Focused viewing",
  component: "ImageLightbox",
  group: "Content and inspection",
  groupOrder: 70,
  description: "Open a single image in a modal viewer and return focus to its trigger on close.",
  covers: ["open and close", "caption", "image failure"],
  render: () => {
    const status = signal("The preview has not been closed yet.");
    return (
      <Specimens>
        <Specimen label="Image with caption" align="start">
          <ImageLightbox
            src={sample}
            alt="Blue circle on a pale background"
            caption="A simple graphic for inspection."
            trigger="Open graphic"
            onClose={() => {
              status.value = "Preview closed.";
            }}
          />
          <Note>{status}</Note>
        </Specimen>
        <Specimen label="Unavailable image" align="start">
          <ImageLightbox
            src="data:image/png,invalid"
            alt="Unavailable image"
            trigger="Open unavailable image"
          />
        </Specimen>
      </Specimens>
    );
  },
});
