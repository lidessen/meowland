import { type Context, h } from "meowjsx";
import { nativeToggleBindings, type CheckboxProps } from "./checkbox";

export interface SwitchProps extends CheckboxProps {}

/** A native checkbox with switch semantics; form reset and keyboard remain native. */
export function Switch(
  { label, className, ...props }: SwitchProps,
  context: Context<typeof Switch>,
) {
  const inputProps = nativeToggleBindings(props);
  return (
    <label className={className} ref={[context.parts.root]}>
      <input {...inputProps} role={"switch"} ref={[context.parts.input, inputProps.ref]} />
      {
        <span aria-hidden={"true"} ref={[context.parts.track]}>
          {<span ref={[context.parts.thumb]} />}
        </span>
      }
      {<span ref={[context.parts.label]}>{label}</span>}
    </label>
  );
}
Switch.meta = { name: "switch", parts: ["root", "input", "track", "thumb", "label"] } as const;
