import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { CodeBlock } from "./code-block";

export const jsonBlockContract = {
  name: "json-block",
  parts: ["root", "summary", "body", "error"],
} as const satisfies ComponentContract;
export type JsonBlockProps = Props & {
  label?: string;
  defaultOpen?: boolean;
  onCopy?: (text: string) => Promise<void>;
} & ({ text: string; payload?: never } | { payload: unknown; text?: never });
/** Serialization and rendering wait for expansion. Invalid text remains verbatim. */
export const JsonBlock = defineComponent<
  JsonBlockProps,
  "json-block",
  (typeof jsonBlockContract.parts)[number]
>(
  jsonBlockContract,
  ({ text, payload, label = "JSON", defaultOpen = false, onCopy, ...props }, context) => {
    const body = context.signal<Child>(null);
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      let content = text ?? "";
      let error = "";
      if (text !== undefined) {
        try {
          JSON.parse(text);
        } catch {
          error = "JSON 格式无效，显示原文。";
        }
      } else {
        try {
          content = JSON.stringify(payload, null, 2) ?? String(payload);
        } catch {
          content = String(payload);
          error = "无法序列化为 JSON，显示值的文本表示。";
        }
      }
      body.value = [
        error ? context.part("error", "p", {}, error) : null,
        <CodeBlock code={content} language="json" onCopy={onCopy} />,
      ];
    };
    if (defaultOpen) load();
    return context.part(
      "root",
      "details",
      {
        ...props,
        open: defaultOpen,
        onToggle: (event: Event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) load();
        },
      },
      [context.part("summary", "summary", {}, label), context.part("body", "div", {}, body)],
    );
  },
);
