import { defineComponent, type ComponentContract } from "meowjsx";
import { nativeToggleBindings, type CheckboxProps } from "./checkbox";

export const switchContract = {
  name: "switch",
  parts: ["root", "input", "track", "thumb", "label"],
} as const satisfies ComponentContract;

export interface SwitchProps extends CheckboxProps {}

/** A native checkbox with switch semantics; form reset and keyboard remain native. */
export const Switch = defineComponent<
  SwitchProps,
  typeof switchContract.name,
  (typeof switchContract.parts)[number]
>(switchContract, ({ label, className, ...props }, context) =>
  context.part(
    "root",
    "label",
    { className },
    context.part("input", "input", { ...nativeToggleBindings(props), role: "switch" }),
    context.part("track", "span", { "aria-hidden": "true" }, context.part("thumb", "span", null)),
    context.part("label", "span", null, label),
  ),
);
