import { h, type Props, type MaybeSignal, type Context } from "meowjsx";

/** Native options, selection, keyboard interaction and form behavior. */
export interface SelectProps extends Props {
  value?: MaybeSignal<string>;
  name?: string;
  disabled?: MaybeSignal<boolean>;
  required?: boolean;
  multiple?: boolean;
  size?: number;
  onChange?: (event: Event) => void;
  className?: Props["className"];
}

/** A native select menu, themed. */
export function Select({ children, ...props }: SelectProps, context: Context<typeof Select>) {
  return (
    <select {...props} ref={[context.parts.root, props.ref]}>
      {children}
    </select>
  );
}
Select.meta = { name: "select", parts: ["root"] } as const;
