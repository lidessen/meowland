import {
  defineComponent,
  derived,
  isSignal,
  mapSignal,
  unwrap,
  type Child,
  type ComponentContract,
  type MaybeSignal,
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
  /** Explicit state takes precedence over the live error message. */
  invalid?: MaybeSignal<boolean>;
  className?: string;
}

/** A labelled form control with optional help text and an error message. */
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
    const hasDescription = isSignal(description)
      ? mapSignal(description, hasMessage)
      : hasMessage(description);
    const hasError = isSignal(error) ? mapSignal(error, hasMessage) : hasMessage(error);
    const mountDescription = isSignal(description) || hasDescription;
    const mountError = isSignal(error) || hasError;
    const resolvedDescriptionId = mountDescription
      ? (descriptionId ?? (htmlFor ? `${htmlFor}-description` : undefined))
      : undefined;
    const resolvedErrorId = mountError
      ? (errorId ?? (htmlFor ? `${htmlFor}-error` : undefined))
      : undefined;
    const readDescribedBy = () =>
      [
        unwrap(hasDescription) ? resolvedDescriptionId : undefined,
        unwrap(hasError) ? resolvedErrorId : undefined,
      ]
        .filter(Boolean)
        .join(" ");
    const describedBy =
      isSignal(hasDescription) || isSignal(hasError) ? derived(readDescribedBy) : readDescribedBy();
    const invalidState = invalid ?? hasError;
    const control = enhanceControl(children, {
      describedBy,
      invalid: invalidState,
      setInvalid: invalid !== undefined || error !== undefined,
    });

    return context.part(
      "root",
      "div",
      {
        className,
        "data-invalid": isSignal(invalidState)
          ? mapSignal(invalidState, (value) => (value ? "true" : undefined))
          : invalidState
            ? "true"
            : undefined,
      },
      context.part("label", "label", { htmlFor }, label),
      mountDescription
        ? context.part(
            "description",
            "span",
            {
              id: resolvedDescriptionId,
              hidden: isSignal(hasDescription)
                ? mapSignal(hasDescription, (value) => !value)
                : !hasDescription,
            },
            description,
          )
        : null,
      context.part("control", "div", null, control),
      mountError
        ? context.part(
            "error",
            "span",
            {
              id: resolvedErrorId,
              hidden: isSignal(hasError) ? mapSignal(hasError, (value) => !value) : !hasError,
            },
            error,
          )
        : null,
    );
  },
);

function enhanceControl(
  children: Child | undefined,
  options: {
    describedBy: MaybeSignal<string>;
    invalid: MaybeSignal<boolean>;
    setInvalid: boolean;
  },
): Child {
  if (!children || Array.isArray(children) || !isVNode(children)) return children;

  const existingDescribedBy = children.props["aria-describedby"];
  const readDescribedBy = () => {
    const existing = unwrap(existingDescribedBy);
    const own = unwrap(options.describedBy);
    if (!own) return existing;
    return typeof existing === "string"
      ? [...new Set(`${existing} ${own}`.split(/\s+/).filter(Boolean))].join(" ")
      : own;
  };
  const describedBy =
    isSignal(existingDescribedBy) || isSignal(options.describedBy)
      ? derived(readDescribedBy)
      : readDescribedBy();
  const props: Props = { ...children.props };
  if (describedBy) props["aria-describedby"] = describedBy;
  if (options.setInvalid)
    props["aria-invalid"] = isSignal(options.invalid)
      ? mapSignal(options.invalid, (value) => (value ? "true" : "false"))
      : options.invalid
        ? "true"
        : "false";

  return { ...children, props };
}

function hasMessage(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false && value !== "";
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
