import { defineComponent, type ComponentContract, type Props } from "meowjsx";
export const shortcutKeysContract = {
  name: "shortcut-keys",
  parts: ["root", "key"],
} as const satisfies ComponentContract;
export interface ShortcutKeysProps extends Props {
  keys: readonly string[];
  variant?: "plain" | "tooltip";
  className?: string;
}
/** Effective key labels belong to the command owner, including platform differences. */
export const ShortcutKeys = defineComponent<ShortcutKeysProps, "shortcut-keys", "root" | "key">(
  shortcutKeysContract,
  ({ keys, variant = "plain", className, ...props }, context) =>
    context.part(
      "root",
      "span",
      { ...props, className, "data-variant": variant },
      ...keys.map((key) =>
        context.part("key", "kbd", { "data-separator": key === "+" ? "true" : undefined }, key),
      ),
    ),
);
