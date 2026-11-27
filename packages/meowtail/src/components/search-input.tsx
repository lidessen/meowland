import { h, type Props, type Context } from "meowjsx";
import { unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";

export interface SearchInputProps extends Props {
  /** Accessible name; placeholder text is only a hint. */
  label: string;
  value?: MaybeSignal<string>;
  name?: string;
  disabled?: MaybeSignal<boolean>;
  readOnly?: MaybeSignal<boolean>;
  onInput?: (event: Event) => void;
  className?: Props["className"];
  inputClassName?: Props["className"];
}

/**
 * A text input for search, with a search icon. Native search editing and form semantics; filtering
 * belongs to the consumer.
 */
export function SearchInput(
  {
    label,
    className,
    inputClassName,
    children: _children,
    ref,
    disabled,
    readOnly,
    onInput,
    ...props
  }: SearchInputProps,
  context: Context<typeof SearchInput>,
) {
  return (
    <div className={className} ref={context.parts.root}>
      <span aria-hidden="true" ref={context.parts.icon}>
        <Icon name="search" />
      </span>
      <input
        {...props}
        disabled={disabled}
        readOnly={readOnly}
        onInput={(event: Event) => {
          if (!unwrap(disabled) && !unwrap(readOnly)) onInput?.(event);
        }}
        type="search"
        aria-label={label}
        className={inputClassName}
        ref={[context.parts.control, ref]}
      />
    </div>
  );
}
SearchInput.meta = { name: "search-input", parts: ["root", "icon", "control"] } as const;
