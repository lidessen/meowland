import { defineComponent, type Child, type ComponentContract, type Props } from "meowjsx";

export const fieldGroupContract = {
  name: "field-group",
  parts: ["root", "legend", "description", "content"],
} as const satisfies ComponentContract;
export interface FieldGroupProps extends Props {
  legend: Child;
  description?: Child;
  descriptionId?: string;
  disabled?: boolean;
  className?: string;
}
let nextFieldGroupId = 0;
/** A titled set of related fields, as a native fieldset. */
export const FieldGroup = defineComponent<
  FieldGroupProps,
  "field-group",
  (typeof fieldGroupContract.parts)[number]
>(
  fieldGroupContract,
  ({ legend, description, descriptionId, disabled, children, className, ...props }, context) => {
    const hasDescription =
      description !== undefined && description !== null && description !== false;
    const resolvedDescriptionId = hasDescription
      ? (descriptionId ?? `field-group-${++nextFieldGroupId}-description`)
      : undefined;
    return context.part(
      "root",
      "fieldset",
      {
        ...props,
        disabled,
        className,
        "aria-describedby":
          [props["aria-describedby"], resolvedDescriptionId].filter(Boolean).join(" ") || undefined,
      },
      context.part("legend", "legend", null, legend),
      hasDescription
        ? context.part("description", "p", { id: resolvedDescriptionId }, description)
        : null,
      context.part("content", "div", null, children),
    );
  },
);
