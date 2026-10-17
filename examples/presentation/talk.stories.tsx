import { h, mapSignal, signal } from "meowjsx";
import { defineStory, type StoryContext } from "meowbook";
import { Button } from "meowtail";
import { createImageTalk, createMusicDemo } from "./talk";

async function ready({ root }: StoryContext) {
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map(async (image) => {
      if (image.complete && image.naturalWidth) return;
      await image.decode();
    }),
  );
  await root.ownerDocument.fonts.ready;
}
export const Opening = defineStory({
  id: "image-talk-opening",
  title: "Image waiting · opening",
  group: "Presentation",
  render: () => createImageTalk({ active: false }).view,
  ready,
});
export const Experiment = defineStory({
  id: "image-talk-experiment",
  title: "Image waiting · experiment / step 3 / 71 Mbit/s",
  group: "Presentation",
  render: () =>
    createImageTalk({
      active: false,
      initialPosition: { slideId: "experiment", step: 3 },
      speed: 71,
    }).view,
  ready,
});
export const Evidence = defineStory({
  id: "image-talk-evidence",
  title: "Image waiting · evidence / paused",
  group: "Presentation",
  render: () =>
    createImageTalk({ active: false, initialPosition: { slideId: "evidence", step: 1 } }).view,
  ready,
});
export const Interactive = defineStory({
  id: "image-talk-interactive",
  title: "Image waiting · explicit activity permission",
  group: "Presentation",
  render: () => {
    const active = signal(false);
    return (
      <div className="image-talk preview-shell">
        <div className="preview-gate">
          <span>Review starts inactive. Activate only this foreground canvas.</span>
          <Button
            onClick={() => {
              active.value = !active.value;
            }}
          >
            {mapSignal(active, (value) => (value ? "Deactivate preview" : "Activate preview"))}
          </Button>
        </div>
        {createImageTalk({ active }).view}
      </div>
    );
  },
  ready,
});
export const OptionalMusic = defineStory({
  id: "image-talk-music",
  title: "Optional music · initially inactive",
  group: "Presentation",
  render: () => {
    const active = signal(false);
    return (
      <div className="image-talk preview-shell">
        <div className="preview-gate">
          <span>Separate audio check.</span>
          <Button
            onClick={() => {
              active.value = !active.value;
            }}
          >
            {mapSignal(active, (value) => (value ? "Deactivate preview" : "Activate preview"))}
          </Button>
        </div>
        {createMusicDemo(active)}
      </div>
    );
  },
  ready,
});
