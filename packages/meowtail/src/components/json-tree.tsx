import { h, type Child, type Props, type Context } from "meowjsx";
import { copyTextToClipboard } from "../clipboard";
import { Icon } from "../icons/icon";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface JsonTreeProps extends Props {
  data: JsonValue;
  label?: string;
  defaultOpen?: boolean;
  onCopy?: (text: string) => Promise<void>;
}

/**
 * A JSON value as an expandable tree. Children are materialized only when their branch is first
 * expanded.
 */
export function JsonTree(
  { data, label = "JSON", defaultOpen = true, onCopy, ...props }: JsonTreeProps,
  context: Context<typeof JsonTree>,
) {
  const container = data !== null && typeof data === "object";
  const feedback = context.signal("");
  const children = context.signal<Child>(null);
  let loaded = false;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });
  const load = () => {
    if (loaded || !container) return;
    loaded = true;
    children.value = Object.entries(data).map(([key, value]) => (
      <JsonTree data={value} label={key} defaultOpen={false} onCopy={onCopy} />
    ));
  };
  if (defaultOpen) load();
  const copy = async () => {
    try {
      await (onCopy ?? copyTextToClipboard)(JSON.stringify(data, null, 2));
      if (alive) feedback.value = "Copied";
    } catch {
      if (alive) feedback.value = "Copy failed";
    }
  };
  const copyButton = (
    <button
      type={"button"}
      onClick={(event: Event) => {
        event.stopPropagation();
        void copy();
      }}
      aria-label={`Copy ${label}`}
      ref={[context.parts.copy]}
    >
      {<Icon name="copy" size={12} />}
    </button>
  );
  const summary = container
    ? `${Array.isArray(data) ? "Array" : "Object"}(${Object.keys(data).length})`
    : JSON.stringify(data);
  const row = [
    <span ref={[context.parts.property]}>{label}</span>,
    <span ref={[context.parts.punctuation]}>{": "}</span>,
    <span
      data-json-type={container ? "object" : data === null ? "null" : typeof data}
      ref={[context.parts.value]}
    >
      {summary}
    </span>,
  ];
  return (
    <div {...props} ref={[context.parts.root, props.ref]}>
      {[
        container ? (
          <details
            open={defaultOpen}
            onToggle={(event: Event) => {
              if ((event.currentTarget as HTMLDetailsElement).open) load();
            }}
          >
            {
              <summary ref={[context.parts.summary]}>
                {[
                  <span aria-hidden={"true"} ref={[context.parts.expander]}>
                    {<Icon name="chevron-right" size={12} />}
                  </span>,
                  ...row,
                ]}
              </summary>
            }
            {<div ref={[context.parts.children]}>{children}</div>}
          </details>
        ) : (
          <div ref={[context.parts.summary]}>{row}</div>
        ),
        copyButton,
        <span role={"status"} aria-live={"polite"} ref={[context.parts.feedback]}>
          {feedback}
        </span>,
      ]}
    </div>
  );
}
JsonTree.meta = {
  name: "json-tree",
  parts: [
    "root",
    "summary",
    "children",
    "property",
    "punctuation",
    "expander",
    "value",
    "copy",
    "feedback",
  ],
} as const;
