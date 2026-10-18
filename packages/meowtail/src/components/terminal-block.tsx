import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
import { OutputBlock } from "./output-block";
import { StateDot } from "./state-dot";
import { Pill } from "./pill";

export const terminalBlockContract = {
  name: "terminal-block",
  parts: [
    "root",
    "prompt",
    "promptLine",
    "cwd",
    "runState",
    "runStateLabel",
    "command",
    "status",
    "span",
  ],
} as const satisfies ComponentContract;
export interface TerminalBlockProps extends Props {
  command: string;
  cwd?: string;
  output?: string;
  running?: boolean;
  exitCode?: number | null;
  signal?: string;
  maxLines?: number;
  copyText?: string;
  onCopy?: (text: string) => Promise<void>;
}
export interface TerminalSpan {
  text: string;
  color?: number;
  bold: boolean;
}
/** Basic SGR styling only. Unknown controls remain literal; copying uses the original bytes. */
export function terminalSpans(text: string): TerminalSpan[][] {
  const rows: TerminalSpan[][] = [[]];
  let color: number | undefined;
  let bold = false;
  const append = (value: string) =>
    value.split("\n").forEach((part, index) => {
      if (index) rows.push([]);
      rows[rows.length - 1]!.push({ text: part, color, bold });
    });
  // ANSI SGR sequences intentionally begin with the ESC control byte.
  // eslint-disable-next-line no-control-regex
  const sgr = /\u001b\[([0-9;]*)m/g;
  let position = 0;
  for (const match of text.matchAll(sgr)) {
    append(text.slice(position, match.index));
    const codes = match[1] === "" ? [0] : match[1]!.split(";").map(Number);
    if (
      codes.every(
        (code) =>
          [0, 1, 22, 39].includes(code) || (code >= 30 && code <= 37) || (code >= 90 && code <= 97),
      )
    ) {
      for (const code of codes) {
        if (code === 0) {
          color = undefined;
          bold = false;
        } else if (code === 1) bold = true;
        else if (code === 22) bold = false;
        else if (code === 39) color = undefined;
        else color = code;
      }
    } else append(match[0]);
    position = match.index! + match[0].length;
  }
  append(text.slice(position));
  if (rows.length > 1 && rows[rows.length - 1]!.every((span) => span.text === "")) rows.pop();
  return rows;
}
export const TerminalBlock = defineComponent<
  TerminalBlockProps,
  "terminal-block",
  (typeof terminalBlockContract.parts)[number]
>(
  terminalBlockContract,
  (
    {
      command,
      cwd,
      output = "",
      running = false,
      exitCode,
      signal,
      maxLines,
      copyText,
      onCopy,
      ...props
    },
    context,
  ) => {
    const status = running
      ? "Running"
      : signal
        ? `Signal ${signal}`
        : exitCode === 0
          ? "Completed"
          : typeof exitCode === "number"
            ? `Exit code ${exitCode}`
            : "Unknown exit status";
    const failed =
      !running && (Boolean(signal) || (typeof exitCode === "number" && exitCode !== 0));
    const state = running ? "ongoing" : failed ? "error" : exitCode === 0 ? "done" : "warning";
    const rows = output ? terminalSpans(output) : [];
    const hasBody = !running || rows.some((row) => row.some((span) => span.text.trim() !== ""));
    const commandLines = (command.endsWith("\n") ? command.slice(0, -1) : command).split("\n");
    const directory =
      cwd
        ?.replace(/[/\\]+$/, "")
        .split(/[/\\]/)
        .pop() ||
      cwd ||
      "$";
    return context.part(
      "root",
      "div",
      { ...props, "data-terminal-body": hasBody ? "true" : "false" },
      <OutputBlock
        title={
          <div>
            {context.part("prompt", "div", {}, [
              context.part("runStateLabel", "span", {}, status),
              ...commandLines.map((line, index) =>
                context.part("promptLine", "div", {}, [
                  index === 0
                    ? context.part("runState", "span", {}, <StateDot state={state} />)
                    : null,
                  context.part(
                    "cwd",
                    "span",
                    index === 0 && cwd ? { title: cwd } : {},
                    index === 0 ? directory : "$",
                  ),
                  context.part("command", "span", { title: line }, line || "\u200b"),
                ]),
              ),
            ])}
            {!running && (failed || exitCode !== 0)
              ? context.part(
                  "status",
                  "span",
                  {
                    "data-terminal-error": failed ? "true" : undefined,
                  },
                  <Pill style="color:inherit">{status}</Pill>,
                )
              : null}
          </div>
        }
        copyText={copyText ?? output}
        maxLines={maxLines}
        onCopy={onCopy}
        emptyText={running ? "Waiting for output" : "No output"}
        rows={
          rows.length
            ? rows.map((row) =>
                row.map((span) =>
                  context.part(
                    "span",
                    "span",
                    {
                      "data-ansi-color": span.color,
                      "data-ansi-bold": span.bold ? "true" : undefined,
                    },
                    span.text,
                  ),
                ),
              )
            : []
        }
      />,
    );
  },
);
