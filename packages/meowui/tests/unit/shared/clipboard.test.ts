import { expect, test } from "bun:test";
import { copyTextToClipboard } from "../../../src/clipboard";

test("native clipboard preserves text and reports permission failures", async () => {
  const values: string[] = [];
  const doc = {
    defaultView: {
      navigator: {
        clipboard: {
          writeText: async (value: string) => {
            values.push(value);
          },
        },
      },
    },
  } as unknown as Document;
  await copyTextToClipboard("  line\n", doc);
  expect(values).toEqual(["  line\n"]);
  doc.defaultView!.navigator.clipboard.writeText = async () => {
    throw new Error("denied");
  };
  await expect(copyTextToClipboard("text", doc)).rejects.toThrow("denied");
});

test("HTTP fallback copies exact text and restores focus/selection on success or failure", async () => {
  for (const succeeds of [true, false]) {
    const calls: unknown[] = [];
    const savedRange = {};
    const textarea = {
      value: "",
      style: {},
      select: () => calls.push("select"),
      setSelectionRange: (...args: unknown[]) => calls.push(args),
      remove: () => calls.push("remove"),
    };
    const doc = {
      defaultView: { navigator: {} },
      activeElement: {
        selectionStart: 2,
        selectionEnd: 5,
        selectionDirection: "backward",
        focus: (options: unknown) => calls.push(options),
        setSelectionRange: (...args: unknown[]) => calls.push(args),
      },
      getSelection: () => ({
        rangeCount: 1,
        getRangeAt: () => ({ cloneRange: () => savedRange }),
        removeAllRanges: () => calls.push("clear ranges"),
        addRange: (range: unknown) => calls.push(range),
      }),
      createElement: () => textarea,
      body: { append: () => calls.push("append") },
      execCommand: (command: string) => {
        calls.push([command, textarea.value]);
        return succeeds;
      },
    } as unknown as Document;
    const pending = copyTextToClipboard("  raw\ntext  ", doc);
    if (succeeds) await pending;
    else await expect(pending).rejects.toThrow("Clipboard copy unavailable");
    expect(calls).toContainEqual(["copy", "  raw\ntext  "]);
    expect(calls.slice(-5)).toEqual([
      "remove",
      { preventScroll: true },
      [2, 5, "backward"],
      "clear ranges",
      savedRange,
    ]);
  }
});
