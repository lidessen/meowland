import { h, mapSignal, signal } from "meowjsx";
import { defineStory, type StoryContext } from "meowbook";
import { Button } from "meowtail";
import { createSunshineLesson } from "./lesson";
async function ready({ root }: StoryContext) {
  await Promise.all(
    Array.from(root.querySelectorAll("img"), async (image) => {
      if (!image.complete || !image.naturalWidth) await image.decode();
    }),
  );
  await root.ownerDocument.fonts.ready;
}
export const Cover = defineStory({
  id: "sunshine-welcome-cover",
  title: "Sunshine / Welcome · cover",
  group: "Courseware",
  render: () => createSunshineLesson({ active: false }).view,
  ready,
});
export const Question = defineStory({
  id: "sunshine-welcome-question",
  title: "Sunshine / Welcome · think before feedback",
  group: "Courseware",
  render: () =>
    createSunshineLesson({ active: false, initialPosition: { slideId: "choose", step: 0 } }).view,
  ready,
});
export const Feedback = defineStory({
  id: "sunshine-welcome-feedback",
  title: "Sunshine / Welcome · teacher reference",
  group: "Courseware",
  render: () =>
    createSunshineLesson({ active: false, initialPosition: { slideId: "choose", step: 3 } }).view,
  ready,
});
export const Words = defineStory({
  id: "sunshine-welcome-words",
  title: "Sunshine / Welcome · vocabulary",
  group: "Courseware",
  render: () =>
    createSunshineLesson({ active: false, initialPosition: { slideId: "words-people", step: 2 } })
      .view,
  ready,
});
export const Interactive = defineStory({
  id: "sunshine-welcome-interactive",
  title: "Sunshine / Welcome · interactive foreground preview",
  group: "Courseware",
  render: () => {
    const active = signal(false);
    return (
      <div className="sunshine-lesson preview-shell">
        <div className="preview-gate">
          <span>Preview starts inactive.</span>
          <Button
            onClick={() => {
              active.value = !active.value;
            }}
          >
            {mapSignal(active, (value) => (value ? "Deactivate preview" : "Activate preview"))}
          </Button>
        </div>
        {createSunshineLesson({ active }).view}
      </div>
    );
  },
  ready,
});
