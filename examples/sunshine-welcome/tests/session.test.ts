import { expect, test } from "bun:test";
import { createSunshineLesson } from "../lesson";

test("lesson factories keep classroom responses and navigation independent in the same module", () => {
  const first = createSunshineLesson({ initialPosition: { slideId: "choose", step: 3 } });
  const second = createSunshineLesson();
  first.choice.value = "B";
  first.reason.value = "Ask first.";
  first.matches.value = ["homeless", "blind", "", "", "", ""];
  first.readingChoices.value = ["food"];
  first.pairGroup.value = "homeless";
  first.pairIdea.value = "We could ask a service.";
  first.exitWord.value = "deaf";
  first.exitAction.value = "Ask which communication helps.";
  first.position.value = { slideId: "take-action", step: 1 };
  expect(second.position.value).toEqual({ slideId: "welcome", step: 0 });
  expect(second.choice.value).toBe("");
  expect(second.reason.value).toBe("");
  expect(second.matches.value).toEqual(Array(6).fill(""));
  expect(second.readingChoices.value).toEqual([]);
  expect(second.pairGroup.value).toBe("");
  expect(second.pairIdea.value).toBe("");
  expect(second.exitWord.value).toBe("");
  expect(second.exitAction.value).toBe("");
  second.choice.value = "A";
  second.readingChoices.value = ["shelter"];
  expect(first.choice.value).toBe("B");
  expect(first.readingChoices.value).toEqual(["food"]);
});
