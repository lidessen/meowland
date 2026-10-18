import { defineStory, type StoryContext } from "meowbook";
import { createPandaLesson } from "./lesson";
async function ready({ root }: StoryContext) {
  await root.ownerDocument.fonts.ready;
  await Promise.all(Array.from(root.querySelectorAll("img"), (image) => image.decode()));
}
export const Cover = defineStory({
  id: "protecting-pandas-cover",
  title: "Protecting pandas · cover",
  group: "Courseware",
  render: () => createPandaLesson({ active: false }).view,
  ready,
});
export const Problems = defineStory({
  id: "protecting-pandas-problems",
  title: "Protecting pandas · evidence before an answer",
  group: "Courseware",
  render: () =>
    createPandaLesson({ active: false, initialPosition: { slideId: "problems", step: 0 } }).view,
  ready,
});
export const Action = defineStory({
  id: "protecting-pandas-act",
  title: "Protecting pandas · personal action",
  group: "Courseware",
  render: () =>
    createPandaLesson({ active: false, initialPosition: { slideId: "act", step: 0 } }).view,
  ready,
});
