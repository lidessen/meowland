import { defineComponent, h, type ComponentContract, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const spinnerContract = {
  name: "spinner",
  parts: ["root", "icon", "label"],
} as const satisfies ComponentContract;
export interface SpinnerProps extends Props {
  label: string;
  className?: string;
}
/** An indeterminate loading indicator with a label that says what is loading. */
export const Spinner = defineComponent<SpinnerProps, "spinner", "root" | "icon" | "label">(
  spinnerContract,
  ({ label, className, ...props }, context) =>
    context.part(
      "root",
      "span",
      { ...props, className, role: "status" },
      context.part("icon", "span", { "aria-hidden": "true" }, <Icon name="loader-circle" />),
      context.part("label", "span", null, label),
    ),
);
