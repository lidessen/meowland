import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";

export interface AutocompleteSuggestion {
  /** The text written into the field when the suggestion is accepted; unique in the list. */
  value: string;
  /** Shown instead of the value when given. */
  label?: string;
  description?: string;
}

export interface AutocompleteProps extends Props {
  /** Id of the text input; also the base for the list ids. Generated when omitted. */
  id?: string;
  /** Controlled text. Omit it to keep a local draft that starts at defaultValue. */
  value?: MaybeSignal<string>;
  defaultValue?: string;
  /** Called for every edit and for an accepted suggestion. */
  onValueChange?: (value: string) => void;
  /** Host-filtered suggestions for the current text; the component never filters or fetches. */
  suggestions: MaybeSignal<readonly AutocompleteSuggestion[]>;
  /** Called after an accepted suggestion's value is written to the text. */
  onAccept?: (suggestion: AutocompleteSuggestion) => void;
  /** The host is looking up suggestions. Pass it (also as false) to enable the empty message. */
  loading?: MaybeSignal<boolean>;
  loadingMessage?: string;
  /** Accessible name of the suggestion list. */
  listLabel?: string;
  /**
   * Shown when `loading` is given and false, the text is not empty and there are no suggestions.
   */
  emptyMessage?: string;
  name?: string;
  disabled?: MaybeSignal<boolean>;
  required?: boolean;
  placeholder?: string;
  className?: Props["className"];
}

/**
 * A text field that offers host suggestions without constraining the text. Focus stays in the
 * input; the list is a popup listbox driven by the arrow keys.
 */
export function Autocomplete(
  {
    id = elementId("autocomplete"),
    value,
    defaultValue = "",
    onValueChange,
    suggestions,
    onAccept,
    loading,
    loadingMessage = "Loading suggestions",
    listLabel = "Suggestions",
    emptyMessage,
    name,
    disabled = false,
    required = false,
    placeholder,
    className,
    ref,
    ...props
  }: AutocompleteProps,
  context: Context<typeof Autocomplete>,
) {
  const local = signal(defaultValue);
  const current = value !== undefined ? value : local;
  const listId = `${id}-list`;
  // The reader asked for the list; it shows only when there is something to show.
  const wanted = signal(false);
  const active = signal<string | undefined>(undefined);
  let input: HTMLInputElement | undefined;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });

  const optionIds = new Map<string, string>();
  const optionId = (key: string) => {
    let known = optionIds.get(key);
    if (!known) optionIds.set(key, (known = elementId(`${id}-option`)));
    return known;
  };
  const list = () => unwrap(suggestions);
  const showEmpty = derived(
    () =>
      emptyMessage !== undefined &&
      loading !== undefined &&
      !unwrap(loading) &&
      list().length === 0 &&
      unwrap(current).trim() !== "",
  );
  const open = derived(
    () =>
      wanted.value &&
      !unwrap(disabled) &&
      (list().length > 0 || Boolean(unwrap(loading)) || showEmpty.value),
  );
  // An active value that left the list is no longer active.
  const activeValue = derived(() =>
    open.value && list().some((item) => item.value === active.value) ? active.value : undefined,
  );

  const write = (text: string) => {
    if (value === undefined) local.value = text;
    onValueChange?.(text);
  };
  const close = () => {
    wanted.value = false;
    active.value = undefined;
  };
  const accept = (suggestion: AutocompleteSuggestion) => {
    write(suggestion.value);
    // A controlled host that ignores the change still sees the input match its own value.
    if (input) input.value = unwrap(current);
    close();
    onAccept?.(suggestion);
  };
  const reveal = (key: string) => {
    queueMicrotask(() => {
      if (!alive || !input) return;
      elementByIdInRoot(input, optionId(key))?.scrollIntoView?.({ block: "nearest" });
    });
  };
  const move = (step: 1 | -1 | "first" | "last") => {
    const items = list();
    if (items.length === 0) return;
    const index = items.findIndex((item) => item.value === activeValue.value);
    const next =
      step === "first"
        ? 0
        : step === "last"
          ? items.length - 1
          : index < 0
            ? step === 1
              ? 0
              : items.length - 1
            : (index + step + items.length) % items.length;
    active.value = items[next]!.value;
    reveal(items[next]!.value);
  };

  const keydown = (event: KeyboardEvent) => {
    if (event.isComposing || unwrap(disabled)) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open.value) {
        wanted.value = true;
        if (event.altKey) return;
      }
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if ((event.key === "Home" || event.key === "End") && activeValue.value !== undefined) {
      event.preventDefault();
      move(event.key === "Home" ? "first" : "last");
    } else if (event.key === "Enter") {
      const chosen = list().find((item) => item.value === activeValue.value);
      // Without an active option Enter belongs to the form.
      if (!chosen) return;
      event.preventDefault();
      accept(chosen);
    } else if (event.key === "Escape") {
      if (!open.value) return;
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      close();
    }
  };

  return (
    <div className={className} ref={[context.parts.root]}>
      {h(Popover, {
        id: `${id}-popup`,
        triggerId: id,
        open,
        onOpenChange: (next: boolean) => {
          if (!next) close();
        },
        matchTriggerWidth: true,
        trigger: (bindings: PopoverTriggerBindings) => (
          <input
            {...props}
            id={bindings.id}
            type="text"
            role="combobox"
            name={name}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={derived(() => String(open.value))}
            aria-controls={listId}
            aria-activedescendant={derived(() =>
              activeValue.value === undefined ? undefined : optionId(activeValue.value),
            )}
            value={current}
            onInput={(event: Event) => {
              write((event.currentTarget as HTMLInputElement).value);
              active.value = undefined;
              wanted.value = true;
            }}
            onKeyDown={keydown}
            onBlur={() => close()}
            ref={[
              context.parts.input,
              ref,
              (element: HTMLInputElement) => {
                input = element;
                const form = element.form;
                if (!form) return;
                let timer: ReturnType<typeof setTimeout> | undefined;
                // Native reset restores the attribute default; the owner signal follows it.
                const reset = (event: Event) => {
                  clearTimeout(timer);
                  timer = setTimeout(() => {
                    if (!alive || event.defaultPrevented) return;
                    // A controlled host learns about the reset through the usual callback.
                    write(defaultValue);
                    element.value = unwrap(current);
                    close();
                  }, 0);
                };
                form.addEventListener("reset", reset);
                return () => {
                  clearTimeout(timer);
                  form.removeEventListener("reset", reset);
                };
              },
            ]}
          />
        ),
        children: [
          <div id={listId} role="listbox" aria-label={listLabel} ref={context.parts.list}>
            {keyed(
              suggestions,
              (item) => item.value,
              (item) => (
                <div
                  id={optionId(item.value.value)}
                  role="option"
                  aria-selected={derived(() => String(activeValue.value === item.value.value))}
                  // Keep focus in the input; a pointer choice does not blur it.
                  onMouseDown={(event: MouseEvent) => event.preventDefault()}
                  onClick={() => accept(item.value)}
                  ref={context.parts.option}
                >
                  <span ref={context.parts.label}>
                    {derived(() => item.value.label ?? item.value.value)}
                  </span>
                  <span
                    hidden={derived(() => !item.value.description)}
                    ref={context.parts.description}
                  >
                    {derived(() => item.value.description ?? "")}
                  </span>
                </div>
              ),
            )}
          </div>,
          <p
            role="status"
            hidden={derived(() => !unwrap(loading) && !showEmpty.value)}
            ref={context.parts.status}
          >
            {derived(() => (unwrap(loading) ? loadingMessage : (emptyMessage ?? "")))}
          </p>,
        ],
      })}
    </div>
  );
}
Autocomplete.meta = {
  name: "autocomplete",
  parts: ["root", "input", "list", "option", "label", "description", "status"],
} as const;
