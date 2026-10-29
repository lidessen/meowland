import { expect, test } from "bun:test";
import { commandMatches } from "../../../src/index";

test("every query term must appear in the label, group or keywords", () => {
  const command = { id: "t", label: "Open terminal", group: "Workspace", keywords: ["shell"] };
  expect(commandMatches(command, "")).toBe(true);
  expect(commandMatches(command, "open")).toBe(true);
  expect(commandMatches(command, "  OPEN   work ")).toBe(true);
  expect(commandMatches(command, "shell term")).toBe(true);
  expect(commandMatches(command, "open file")).toBe(false);
  // Plain containment, not fuzzy ranking.
  expect(commandMatches(command, "otl")).toBe(false);
});
