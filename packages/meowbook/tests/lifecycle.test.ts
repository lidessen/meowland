import { expect, test } from "bun:test";
import { cleanupScope } from "../src/web/lifecycle";
test("cleanup is reverse, idempotent, continues after errors and handles late registration", () => {
  const calls: string[] = [];
  const scope = cleanupScope(() => calls.push("error"));
  scope.add(() => calls.push("first"));
  scope.add(() => {
    calls.push("second");
    throw new Error("cleanup");
  });
  scope.dispose();
  scope.dispose();
  scope.add(() => calls.push("late"));
  expect(calls).toEqual(["second", "error", "first", "late"]);
});
