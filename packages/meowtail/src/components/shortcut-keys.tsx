import { type Props, type Context, h } from "meowjsx";

export interface ShortcutKeysProps extends Props {
  keys: readonly string[];
  variant?: "plain" | "tooltip";
  className?: Props["className"];
}
/**
 * A keyboard shortcut, shown as keys. Effective key labels belong to the command owner, including
 * platform differences.
 */
export function ShortcutKeys(
  { keys, variant = "plain", className, ...props }: ShortcutKeysProps,
  context: Context<typeof ShortcutKeys>,
) {
  return (
    <span
      {...props}
      className={className}
      data-variant={variant}
      ref={[context.parts.root, props.ref]}
    >
      {keys.map((key) => (
        <kbd data-separator={key === "+" ? "true" : undefined} ref={[context.parts.key]}>
          {key}
        </kbd>
      ))}
    </span>
  );
}
ShortcutKeys.meta = { name: "shortcut-keys", parts: ["root", "key"] } as const;
