import { type Child, type Props, type Context, h } from "meowjsx";
import { elementId } from "../shared/element-id";

export interface FieldGroupProps extends Props {
  legend: Child;
  description?: Child;
  descriptionId?: string;
  disabled?: boolean;
  className?: Props["className"];
}
/** A titled set of related fields, as a native fieldset. */
export function FieldGroup(
  { legend, description, descriptionId, disabled, children, className, ...props }: FieldGroupProps,
  context: Context<typeof FieldGroup>,
) {
  const hasDescription = description !== undefined && description !== null && description !== false;
  const resolvedDescriptionId = hasDescription
    ? (descriptionId ?? `${elementId("field-group")}-description`)
    : undefined;
  return (
    <fieldset
      {...props}
      disabled={disabled}
      className={className}
      aria-describedby={
        [props["aria-describedby"], resolvedDescriptionId].filter(Boolean).join(" ") || undefined
      }
      ref={[context.parts.root, props.ref]}
    >
      <legend ref={[context.parts.legend]}>{legend}</legend>
      {hasDescription ? (
        <p id={resolvedDescriptionId} ref={[context.parts.description]}>
          {description}
        </p>
      ) : null}
      <div ref={[context.parts.content]}>{children}</div>
    </fieldset>
  );
}
FieldGroup.meta = {
  name: "field-group",
  parts: ["root", "legend", "description", "content"],
} as const;
