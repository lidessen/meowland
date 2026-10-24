import { h, type Child, type Props, type Context } from "meowjsx";
import { signal } from "meowjsx/signal";
import { CodeBlock } from "./code-block";

export type JsonBlockProps = Props & {
  label?: string;
  defaultOpen?: boolean;
  onCopy?: (text: string) => Promise<void>;
} & ({ text: string; payload?: never } | { payload: unknown; text?: never });
/**
 * A collapsible block that shows a JSON value as a tree. Serialization and rendering wait for
 * expansion. Invalid text remains verbatim.
 */
export function JsonBlock(
  { text, payload, label = "JSON", defaultOpen = false, onCopy, ...props }: JsonBlockProps,
  context: Context<typeof JsonBlock>,
) {
  const body = signal<Child>(null);
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
      error ? <p ref={[context.parts.error]}>{error}</p> : null,
      <CodeBlock code={content} language="json" onCopy={onCopy} />,
    ];
  };
  if (defaultOpen) load();
  return (
    <details
      {...props}
      open={defaultOpen}
      onToggle={(event: Event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) load();
      }}
      ref={[context.parts.root, props.ref]}
    >
      {[
        <summary ref={[context.parts.summary]}>{label}</summary>,
        <div ref={[context.parts.body]}>{body}</div>,
      ]}
    </details>
  );
}
JsonBlock.meta = { name: "json-block", parts: ["root", "summary", "body", "error"] } as const;
