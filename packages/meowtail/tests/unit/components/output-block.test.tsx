import { expect, test } from "bun:test";
import { createRuntime, h, type Props } from "meowjsx";
import { createWebRenderer } from "meowjsx/web";
import { OutputBlock, outputWindow } from "../../../src/components/output-block";
import { ReadBlock } from "../../../src/components/read-block";
import { DiffBlock, diffBlockText } from "../../../src/components/diff-block";
import { SearchBlock, searchBlockText } from "../../../src/components/search-block";
import { TerminalBlock, terminalSpans } from "../../../src/components/terminal-block";
import { installMeowUI } from "../../../src/registry";

test("output cap keeps head and tail, with a native expandable middle", () => {
  expect(outputWindow(23, 16)).toEqual({ head: 8, tail: 8, hidden: 7 });
  expect(outputWindow(23, Infinity).hidden).toBe(0);
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <OutputBlock
      title="result"
      rows={Array.from({ length: 23 }, (_, i) => String(i))}
      copyText="raw"
    />,
  );
  expect(html).toContain("<details");
  expect(html).toContain("Show the 7 hidden middle lines");
  expect(html).toContain("Hide the middle lines");
});

test("output copy retains raw payload independently of cap and deduplicates pending requests", async () => {
  for (const failure of [false, true]) {
    const runtime = createRuntime();
    let button: Props = {};
    runtime.use({
      render({ vnode }, next) {
        if (vnode.type === "button") button = vnode.props;
        return next(vnode);
      },
    });
    const values: string[] = [];
    const raw = "\u001b[31m  raw\nline  \n";
    createWebRenderer(runtime).renderToHtml(
      <OutputBlock
        title="test"
        rows={["display"]}
        copyText={raw}
        onCopy={async (text) => {
          values.push(text);
          if (failure) throw new Error("denied");
        }}
      />,
    );
    const copy = button.onClick as () => Promise<void>;
    const pending = copy();
    await copy();
    await pending;
    expect(values).toEqual([raw]);
  }
});

test("read window keeps supplied numbers and escapes payload markup", () => {
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <ReadBlock
      label="file"
      totalLines={100}
      lines={[{ number: 42, text: "<script>  text", highlighted: true }]}
    />,
  );
  expect(html).toContain("Showing 1 / 100 lines");
  expect(html).toContain("42");
  expect(html).toContain('data-read-highlight="true"');
  expect(html).toContain("&lt;script&gt;  text");
});

test("semantic diff and search copy preserve signs, paths and line numbers", () => {
  const files = [
    {
      path: "a.ts",
      lines: [
        { kind: "removed" as const, text: "  old" },
        { kind: "added" as const, text: "  new" },
      ],
    },
  ];
  expect(diffBlockText(files)).toBe("a.ts\n-  old\n+  new");
  const html = createWebRenderer(createRuntime()).renderToHtml(<DiffBlock files={files} />);
  expect(html).toContain('data-diff-kind="added"');
  expect(html).toContain('data-diff-kind="removed"');
  const props = {
    kind: "matches" as const,
    total: 9,
    truncated: true,
    files: [{ path: "a.ts", matches: [{ lineNumber: 42, line: "  match" }] }],
  };
  expect(searchBlockText(props)).toBe("a.ts\n42:   match");
  expect(createWebRenderer(createRuntime()).renderToHtml(<SearchBlock {...props} />)).toContain(
    "results truncated",
  );
});

test("terminal SGR state crosses lines, resets and preserves unsupported controls", () => {
  const rows = terminalSpans("\u001b[31;1mred\nred\u001b[0m plain\n");
  expect(rows).toHaveLength(2);
  expect(rows.flat().find((span) => span.text === "red")).toEqual({
    text: "red",
    color: 31,
    bold: true,
  });
  expect(rows[1]!.find((span) => span.text === " plain")?.color).toBeUndefined();
  expect(
    terminalSpans("\u001b[38;5;12mtext")
      .flat()
      .map((span) => span.text)
      .join(""),
  ).toBe("\u001b[38;5;12mtext");
  const html = createWebRenderer(createRuntime()).renderToHtml(
    <TerminalBlock command="echo a" output="a\n" />,
  );
  expect(html).toContain("Unknown exit status");
  expect(html).not.toContain("Completed");
});

test("terminal presents one truthful call state and preserves multiline prompt whitespace", () => {
  const html = (props: Parameters<typeof TerminalBlock>[0]) => {
    const runtime = createRuntime();
    installMeowUI(runtime);
    return createWebRenderer(runtime).renderToHtml(<TerminalBlock {...props} />);
  };
  const running = html({
    command: "cd src\n  echo  spaced\n",
    cwd: "/workspace/meowland",
    running: true,
  });
  expect(running).toContain('data-state="ongoing"');
  expect(running).toContain('data-terminal-body="false"');
  expect(running).toContain('title="/workspace/meowland"');
  expect(running).toContain('data-meowui-part="terminal-block/cwd">meowland');
  expect(running).toContain("  echo  spaced");
  expect(running.match(/data-meowui-part="terminal-block\/runState"/g)).toHaveLength(1);
  expect(running.match(/data-meowui-part="terminal-block\/promptLine"/g)).toHaveLength(2);
  const settled = html({ command: "echo done", exitCode: 0, output: "done\n" });
  expect(settled).toContain('data-state="done"');
  const stopped = html({ command: "sleep 30", exitCode: 0, signal: "SIGTERM" });
  expect(stopped).toContain('data-state="error"');
  expect(stopped).toContain("Signal SIGTERM");
  const unknown = html({ command: "echo result", output: "result\n" });
  expect(unknown).toContain('data-state="warning"');
  expect(unknown).toContain("Unknown exit status");
  expect(unknown).not.toContain('data-state="done"');
});
