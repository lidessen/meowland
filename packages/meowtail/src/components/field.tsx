import { type Child, type Props, type VNode, type Context, h } from "meowjsx";
import { derived, isSignal, mapSignal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { elementId } from "../shared/element-id";

export interface FieldProps extends Props {
  label: Child;
  description?: Child;
  error?: Child;
  /**
   * Id of the labelled control. When omitted, Field uses the single child control's own `id`,
   * or generates one and gives it to that control.
   */
  htmlFor?: string;
  descriptionId?: string;
  errorId?: string;
  /** Explicit state takes precedence over the live error message. */
  invalid?: MaybeSignal<boolean>;
  className?: Props["className"];
}

/** A labelled form control with optional help text and an error message. */
export function Field(
  {
    label,
    description,
    error,
    htmlFor,
    descriptionId,
    errorId,
    invalid,
    children,
    className,
    ref,
    ...props
  }: FieldProps,
  context: Context<typeof Field>,
) {
  // Field takes over the control id only when the host supplies none; a live id stays the host's.
  const ownControl = htmlFor === undefined ? soleControl(children) : undefined;
  const ownControlId = ownControl?.props.id;
  const generatedId = ownControl && ownControlId === undefined ? elementId("field") : undefined;
  const controlId = htmlFor ?? (typeof ownControlId === "string" ? ownControlId : generatedId);
  const hasDescription = isSignal(description)
    ? mapSignal(description, hasMessage)
    : hasMessage(description);
  const hasError = isSignal(error) ? mapSignal(error, hasMessage) : hasMessage(error);
  const mountDescription = isSignal(description) || hasDescription;
  const mountError = isSignal(error) || hasError;
  const resolvedDescriptionId = mountDescription
    ? (descriptionId ?? (controlId ? `${controlId}-description` : undefined))
    : undefined;
  const resolvedErrorId = mountError
    ? (errorId ?? (controlId ? `${controlId}-error` : undefined))
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
    id: generatedId,
  });

  return (
    <div
      {...props}
      className={className}
      data-invalid={
        isSignal(invalidState)
          ? mapSignal(invalidState, (value) => (value ? "true" : undefined))
          : invalidState
            ? "true"
            : undefined
      }
      ref={[context.parts.root, ref]}
    >
      <label htmlFor={controlId} ref={context.parts.label}>
        {label}
      </label>
      {mountDescription ? (
        <span
          id={resolvedDescriptionId}
          hidden={
            isSignal(hasDescription)
              ? mapSignal(hasDescription, (value) => !value)
              : !hasDescription
          }
          ref={context.parts.description}
        >
          {description}
        </span>
      ) : null}
      <div ref={context.parts.control}>{control}</div>
      {mountError ? (
        <span
          id={resolvedErrorId}
          hidden={isSignal(hasError) ? mapSignal(hasError, (value) => !value) : !hasError}
          ref={context.parts.error}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
Field.meta = {
  name: "field",
  parts: ["root", "label", "description", "error", "control"],
} as const;

function enhanceControl(
  children: Child | undefined,
  options: {
    describedBy: MaybeSignal<string>;
    invalid: MaybeSignal<boolean>;
    setInvalid: boolean;
    /** Set only when Field generated the control id. */
    id?: string;
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
  if (options.id !== undefined) props.id = options.id;
  if (describedBy) props["aria-describedby"] = describedBy;
  if (options.setInvalid)
    props["aria-invalid"] = isSignal(options.invalid)
      ? mapSignal(options.invalid, (value) => (value ? "true" : "false"))
      : options.invalid
        ? "true"
        : "false";

  return { ...children, props };
}

function soleControl(children: Child | undefined): VNode | undefined {
  return children && !Array.isArray(children) && isVNode(children) ? children : undefined;
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
