import { expect, test } from "bun:test";
import { createRuntime, h } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import {
  ChatComposer,
  composerQueryLimit,
  findComposerTrigger,
  insertComposerSuggestion,
  type ComposerTrigger,
} from "../../../src/chat";

const triggers = [{ char: "@" }, { char: "/", position: "start" as const }];

test("a trigger opens only at the start of the caret's word", () => {
  expect(findComposerTrigger("@ta", 3, triggers)).toEqual({ index: 0, char: "@", query: "ta" });
  expect(findComposerTrigger("Ship after @t-1", 15, triggers)).toEqual({
    index: 11,
    char: "@",
    query: "t-1",
  });
  expect(findComposerTrigger("line\n@", 6, triggers)).toEqual({ index: 5, char: "@", query: "" });
  // Mid-word characters are prose: an email address, a path.
  expect(findComposerTrigger("me@example", 10, triggers)).toBeNull();
  expect(findComposerTrigger("a/b", 3, triggers)).toBeNull();
  // The caret decides the word, not the end of the text.
  expect(findComposerTrigger("@one two", 4, triggers)?.query).toBe("one");
  expect(findComposerTrigger("@one two", 8, triggers)).toBeNull();
  expect(findComposerTrigger("@", 0, triggers)).toBeNull();
});

test("a start trigger needs only whitespace before it in the whole draft", () => {
  expect(findComposerTrigger("/mo", 3, triggers)).toEqual({ index: 0, char: "/", query: "mo" });
  expect(findComposerTrigger("  \n/mo", 6, triggers)?.index).toBe(3);
  expect(findComposerTrigger("Run /mo", 7, triggers)).toBeNull();
});

test("a query past the limit does not open a list", () => {
  const long = `@${"x".repeat(composerQueryLimit)}`;
  expect(findComposerTrigger(long, long.length, triggers)?.query.length).toBe(composerQueryLimit);
  expect(findComposerTrigger(`${long}x`, long.length + 1, triggers)).toBeNull();
});

test("accepting replaces the trigger text and places the caret after it", () => {
  const match = { index: 11, char: "@", query: "pag" };
  expect(
    insertComposerSuggestion(
      "Follow up @pag",
      { ...match, index: 10 },
      { id: "t-105", label: "Paginate" },
    ),
  ).toEqual({
    text: "Follow up @t-105 ",
    caret: 17,
  });
  // Existing whitespace after the query is reused, not doubled.
  expect(
    insertComposerSuggestion("Ship after @pag now", match, { id: "t-105", label: "x" }),
  ).toEqual({
    text: "Ship after @t-105 now",
    caret: 17,
  });
  // A custom insert and a path that keeps drilling.
  expect(
    insertComposerSuggestion(
      "#sr",
      { index: 0, char: "#", query: "sr" },
      { id: "src", label: "src", insert: "#src/", trailingSpace: false },
    ),
  ).toEqual({ text: "#src/", caret: 5 });
  // A command that acts removes its text and the space that followed it.
  expect(
    insertComposerSuggestion(
      "/cle rest",
      { index: 0, char: "/", query: "cle" },
      { id: "clear", label: "Clear", insert: "" },
    ),
  ).toEqual({ text: "rest", caret: 0 });
});

test("a composer with triggers wires list semantics only while the list is open", () => {
  const trigger: ComposerTrigger = { char: "@", label: "Tasks", suggest: () => [] };
  const web = createWebRenderer(createRuntime());
  const html = web.renderToHtml(<ChatComposer triggers={[trigger]} inputLabel="Task" />);
  expect(html).toContain('aria-autocomplete="list"');
  expect(html).toContain('aria-haspopup="listbox"');
  expect(html).not.toContain("aria-controls");
  expect(html).not.toContain("aria-activedescendant");
  expect(html).toMatch(/role="status" aria-live="polite"/);
  expect(html).toMatch(/<div id="chat-composer-\d+-surface"/);
  const plain = web.renderToHtml(<ChatComposer inputLabel="Plain" />);
  expect(plain).not.toContain("aria-autocomplete");
  expect(plain).not.toContain('role="listbox"');
  expect(plain).not.toContain("-surface");
});
