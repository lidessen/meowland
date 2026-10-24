import { h, type Props, type Context } from "meowjsx";
import { Icon } from "../icons/icon";

export interface SpinnerProps extends Props {
  label: string;
  className?: Props["className"];
}
/** An indeterminate loading indicator with a label that says what is loading. */
export function Spinner(
  { label, className, ...props }: SpinnerProps,
  context: Context<typeof Spinner>,
) {
  return (
    <span {...props} className={className} role={"status"} ref={[context.parts.root, props.ref]}>
      {
        <span aria-hidden={"true"} ref={[context.parts.icon]}>
          {<Icon name="loader-circle" />}
        </span>
      }
      {<span ref={[context.parts.label]}>{label}</span>}
    </span>
  );
}
Spinner.meta = { name: "spinner", parts: ["root", "icon", "label"] } as const;
