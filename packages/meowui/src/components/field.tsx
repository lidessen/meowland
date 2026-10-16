import {
  defineComponent,
  type Child,
  type ComponentContract,
  type Props,
  type VNode,
} from "meowjsx";

export const fieldContract = {
  name: "field",
  parts: ["root", "label", "description", "error", "control"],
} as const satisfies ComponentContract;

export interface FieldProps extends Props {
  label: Child;
  description?: Child;
  error?: Child;
  htmlFor?: string;
  descriptionId?: string;
  errorId?: string;
  invalid?: boolean;
  className?: string;
}

export const Field = defineComponent<
  FieldProps,
  typeof fieldContract.name,
  (typeof fieldContract.parts)[number]
>(
  fieldContract,
  (
    { label, description, error, htmlFor, descriptionId, errorId, invalid, children, className },
    context,
  ) => {
    const hasDescription =
      description !== undefined && description !== null && description !== false;
    const hasError = error !== undefined && error !== null && error !== false;
    const resolvedDescriptionId = hasDescription
      ? (descriptionId ?? (htmlFor ? `${htmlFor}-description` : undefined))
      : undefined;
    const resolvedErrorId = hasError
      ? (errorId ?? (htmlFor ? `${htmlFor}-error` : undefined))
      : undefined;
    const describedBy = [resolvedDescriptionId, resolvedErrorId].filter(Boolean).join(" ");
    const invalidState = invalid ?? hasError;
    const control = enhanceControl(children, {
      describedBy,
      invalid: invalidState,
      setInvalid: invalid !== undefined || hasError,
    });

    return context.part(
      "root",
      "div",
      { className, "data-invalid": invalidState ? "true" : undefined },
      context.part("label", "label", { htmlFor }, label),
      hasDescription
        ? context.part(
            "description",
            "span",
            resolvedDescriptionId ? { id: resolvedDescriptionId } : null,
            description,
          )
        : null,
      context.part("control", "div", null, control),
      hasError
        ? context.part("error", "span", resolvedErrorId ? { id: resolvedErrorId } : null, error)
        : null,
    );
  },
);

function enhanceControl(
  children: Child | undefined,
  options: { describedBy: string; invalid: boolean; setInvalid: boolean },
): Child {
  if (!children || Array.isArray(children) || !isVNode(children)) return children;

  const existingDescribedBy = children.props["aria-describedby"];
  const describedBy =
    options.describedBy && typeof existingDescribedBy === "string"
      ? `${existingDescribedBy} ${options.describedBy}`
      : options.describedBy || existingDescribedBy;
  const props: Props = { ...children.props };
  if (describedBy) props["aria-describedby"] = describedBy;
  if (options.setInvalid) props["aria-invalid"] = options.invalid ? "true" : "false";

  return { ...children, props };
}

function isVNode(value: Child): value is VNode {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "type" in value &&
    "props" in value
  );
}
