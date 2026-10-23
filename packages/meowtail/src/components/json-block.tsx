import { defineComponent, h, type Child, type Props } from "meowjsx";
import { CodeBlock } from "./code-block";
import { jsonBlockContract } from "./json-block.contract";
export type JsonBlockProps = Props & {
  label?: string;
  defaultOpen?: boolean;
  onCopy?: (text: string) => Promise<void>;
} & ({ text: string; payload?: never } | { payload: unknown; text?: never });
/**
 * A collapsible block that shows a JSON value as a tree. Serialization and rendering wait for
 * expansion. Invalid text remains verbatim.
 */
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
          error = "Invalid JSON; showing the original text.";
        }
      } else {
        try {
          content = JSON.stringify(payload, null, 2) ?? String(payload);
        } catch {
          content = String(payload);
          error = "Cannot serialize to JSON; showing the value's text representation.";
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
