import {
  defineComponent,
  h,
  type Child,
  type ComponentContract,
  type Props,
} from "meowjsx";
import { copyTextToClipboard } from "../clipboard";
import { Icon } from "../icons/icon";

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };
export const jsonTreeContract = {
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
} as const satisfies ComponentContract;
export interface JsonTreeProps extends Props {
  data: JsonValue;
  label?: string;
  defaultOpen?: boolean;
  onCopy?: (text: string) => Promise<void>;
}

/** Children are materialized only when their branch is first expanded. */
export const JsonTree = defineComponent<
  JsonTreeProps,
  "json-tree",
  (typeof jsonTreeContract.parts)[number]
>(jsonTreeContract, ({ data, label = "JSON", defaultOpen = true, onCopy, ...props }, context) => {
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
      if (alive) feedback.value = "已复制";
    } catch {
      if (alive) feedback.value = "复制失败";
    }
  };
  const copyButton = context.part(
    "copy",
    "button",
    {
      type: "button",
      onClick: (event: Event) => {
        event.stopPropagation();
        void copy();
      },
      "aria-label": `复制 ${label}`,
    },
    <Icon name="copy" size={12} />,
  );
  const summary = container
    ? `${Array.isArray(data) ? "Array" : "Object"}(${Object.keys(data).length})`
    : JSON.stringify(data);
  const row = [
    context.part("property", "span", {}, label),
    context.part("punctuation", "span", {}, ": "),
    context.part(
      "value",
      "span",
      { "data-json-type": container ? "object" : data === null ? "null" : typeof data },
      summary,
    ),
  ];
  return context.part("root", "div", props, [
    container ? (
      <details
        open={defaultOpen}
        onToggle={(event: Event) => {
          if ((event.currentTarget as HTMLDetailsElement).open) load();
        }}
      >
        {context.part("summary", "summary", {}, [
          context.part(
            "expander",
            "span",
            { "aria-hidden": "true" },
            <Icon name="chevron-right" size={12} />,
          ),
          ...row,
        ])}
        {context.part("children", "div", {}, children)}
      </details>
    ) : (
      context.part("summary", "div", {}, row)
    ),
    copyButton,
    context.part("feedback", "span", { role: "status", "aria-live": "polite" }, feedback),
  ]);
});
