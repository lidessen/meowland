import { h, keyed, type Props, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { Icon } from "../icons/icon";
import { elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";

export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ChoiceSelectProps extends Props {
  /** Plain arrays are fixed for the mount. A signal keeps the open list mounted. */
  options: MaybeSignal<readonly ChoiceOption[]>;
  hidden?: MaybeSignal<boolean>;
  value?: MaybeSignal<string>;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: Props["className"];
  placement?: "top" | "bottom";
  align?: "start" | "end";
  matchTriggerWidth?: boolean;
}

/** Single-choice listbox. Form participation remains native; data fetching belongs to callers. */
export function ChoiceSelect(
  {
    options,
    hidden,
    value,
    defaultValue = "",
    onValueChange,
    name,
    id = elementId("choice"),
    disabled = false,
    required = false,
    placeholder = "Select an option",
    searchable = false,
    searchPlaceholder = "Search options",
    emptyMessage = "No matching options",
    className,
    placement = "bottom",
    align = "start",
    matchTriggerWidth = true,
    ...props
  }: ChoiceSelectProps,
  context: Context<typeof ChoiceSelect>,
) {
  const local = signal(defaultValue);
  const current = value !== undefined ? value : local;
  const readValue = () => unwrap(current);
  const readOptions = () => unwrap(options);
  const open = signal(false);
  const invalid = signal<string | undefined>(undefined);
  const validation = signal("");
  const query = signal("");
  let searchElement: HTMLInputElement | null = null;
  let triggerElement: HTMLButtonElement | null = null;
  let nativeElement: HTMLSelectElement | null = null;
  let panelId = `${id}-panel`;
  let disposed = false;
  let typed = "";
  let lastTyped = 0;
  const matches = (option: ChoiceOption) =>
    `${option.label} ${option.value}`
      .toLocaleLowerCase()
      .includes(query.value.trim().toLocaleLowerCase());
  const hasResults = derived(() => readOptions().some(matches));
  const caption = derived(
    () => readOptions().find((option) => option.value === readValue())?.label ?? placeholder,
  );
  const enabledOptions = () =>
    readOptions()
      .map((option, index) => (option.disabled || !matches(option) ? -1 : index))
      .filter((index) => index >= 0);
  const trigger = () => triggerElement;
  const panel = () => (triggerElement ? elementByIdInRoot(triggerElement, panelId) : null);
  const focusOption = (index: number) => {
    queueMicrotask(() => {
      if (disposed || !open.value) return;
      panel()?.querySelector<HTMLElement>(`[data-choice-index="${index}"]`)?.focus();
    });
  };
  const initialIndex = (last = false) => {
    const enabled = enabledOptions();
    const index = readOptions().findIndex(
      (option) => option.value === readValue() && !option.disabled,
    );
    return index >= 0 ? index : (enabled[last ? enabled.length - 1 : 0] ?? -1);
  };
  const close = (restore = true) => {
    open.value = false;
    query.value = "";
    if (restore) trigger()?.focus();
  };
  const choose = (index: number) => {
    const option = readOptions()[index];
    if (disabled || !option || option.disabled) return;
    if (value === undefined) local.value = option.value;
    invalid.value = undefined;
    validation.value = "";
    onValueChange?.(option.value);
    if (nativeElement) nativeElement.value = readValue();
    close();
  };
  const search = (key: string, active: number) => {
    const enabled = enabledOptions();
    const now = Date.now();
    typed = now - lastTyped > 700 ? key : typed + key;
    lastTyped = now;
    const query = [...typed].every((letter) => letter === key) ? key : typed;
    const start = enabled.indexOf(active);
    for (let step = 1; step <= enabled.length; step++) {
      const index = enabled[(start + step) % enabled.length]!;
      if (readOptions()[index]!.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) {
        focusOption(index);
        break;
      }
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (disabled || event.isComposing) return;
    const enabled = enabledOptions();
    const inSearch = event.target === searchElement;
    if (inSearch && !["ArrowDown", "ArrowUp", "Escape", "Tab", "Enter"].includes(event.key)) return;
    const active = Number((event.target as HTMLElement).dataset.choiceIndex ?? -1);
    if (event.key === "Tab") {
      close();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!open.value) {
        query.value = "";
        open.value = true;
        if (searchable) {
          queueMicrotask(() => {
            if (!disposed && open.value) searchElement?.focus();
          });
          return;
        }
        focusOption(
          event.key === "Home"
            ? (enabled[0] ?? -1)
            : event.key === "End"
              ? (enabled.at(-1) ?? -1)
              : initialIndex(event.key === "ArrowUp"),
        );
        return;
      }
      const position = enabled.indexOf(active);
      const next = inSearch
        ? event.key === "ArrowUp"
          ? enabled.at(-1)
          : enabled[0]
        : event.key === "Home"
          ? enabled[0]
          : event.key === "End"
            ? enabled.at(-1)
            : enabled[
                (position + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length
              ];
      focusOption(next ?? -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (inSearch) {
        if (enabled.length === 1) choose(enabled[0]!);
        else focusOption(enabled[0] ?? -1);
        return;
      }
      if (open.value && active >= 0) choose(active);
      else {
        query.value = "";
        open.value = true;
        if (searchable)
          queueMicrotask(() => {
            if (!disposed && open.value) searchElement?.focus();
          });
        else focusOption(initialIndex());
      }
    } else if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.isComposing
    ) {
      event.preventDefault();
      open.value = true;
      if (searchable) {
        query.value = event.key;
        queueMicrotask(() => {
          if (!disposed && open.value) searchElement?.focus();
        });
        return;
      }
      search(event.key, active);
    }
  };

  const nativeRef = (native: HTMLSelectElement) => {
    nativeElement = native;
    queueMicrotask(() => {
      if (disposed || !native.isConnected) return;
      // Native reset restores defaultSelected, not the live value property.
      for (const option of native.options) option.defaultSelected = option.value === defaultValue;
      native.value = readValue();
      const form = native?.form;
      if (!form) return;
      let resetTimer: ReturnType<typeof setTimeout> | undefined;
      const reset = (event: Event) => {
        clearTimeout(resetTimer);
        // A reset event's microtask checkpoint can precede the browser's
        // default reset action. Reconcile only after that action completes.
        resetTimer = setTimeout(() => {
          if (disposed || event.defaultPrevented) return;
          if (value === undefined) local.value = defaultValue;
          native.value = readValue();
          invalid.value = undefined;
          validation.value = "";
          open.value = false;
        }, 0);
      };
      form.addEventListener("reset", reset);
      context.onCleanup(() => {
        clearTimeout(resetTimer);
        form.removeEventListener("reset", reset);
      });
    });
  };
  context.onCleanup(() => {
    disposed = true;
  });

  type ChoiceRow =
    | { kind: "group"; key: string; label: string }
    | { kind: "option"; key: string; option: ChoiceOption; index: number };
  const rows = derived(() => {
    const items = readOptions();
    const next: ChoiceRow[] = [];
    items.forEach((option, index) => {
      if (option.group && option.group !== items[index - 1]?.group)
        next.push({ kind: "group", key: `group:${option.group}:${index}`, label: option.group });
      next.push({ kind: "option", key: `option:${option.value}`, option, index });
    });
    return next;
  });
  return (
    <div className={className} hidden={hidden} ref={[context.parts.root]}>
      {h(Popover, {
        id: `${id}-panel`,
        triggerId: id,
        open,
        onOpenChange: (next: boolean) => {
          if (next) query.value = "";
          open.value = next;
        },
        matchTriggerWidth,
        placement,
        align,
        role: searchable ? "dialog" : "listbox",
        labelledBy: id,
        onKeyDown: keydown,
        trigger: (bindings: PopoverTriggerBindings) => {
          panelId = bindings["aria-controls"];
          return (
            <button
              {...props}
              {...bindings}
              type={"button"}
              disabled={disabled}
              aria-haspopup={searchable ? "dialog" : "listbox"}
              aria-required={required ? "true" : undefined}
              aria-invalid={props["aria-invalid"] ?? invalid}
              aria-describedby={[props["aria-describedby"], `${id}-value`, `${id}-validation`]
                .filter(Boolean)
                .join(" ")}
              onKeyDown={keydown}
              onClick={(event: MouseEvent) => {
                bindings.onClick(event);
                if (open.value) {
                  if (searchable)
                    queueMicrotask(() => {
                      if (!disposed && open.value) searchElement?.focus();
                    });
                  else focusOption(initialIndex());
                }
              }}
              ref={[
                context.parts.trigger,
                props.ref,
                (element: HTMLButtonElement) => {
                  triggerElement = element;
                },
              ]}
            >
              {
                <span id={`${id}-value`} ref={[context.parts.value]}>
                  {caption}
                </span>
              }
              {
                <span aria-hidden={"true"} ref={[context.parts.indicator]}>
                  {h(Icon, { name: "chevron-down" })}
                </span>
              }
            </button>
          );
        },
        children: [
          searchable ? (
            <input
              type={"search"}
              value={query}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={`${id}-list`}
              maxLength={256}
              onInput={(event: Event) => {
                query.value = (event.currentTarget as HTMLInputElement).value;
              }}
              ref={[
                context.parts.search,
                (element: HTMLInputElement) => {
                  searchElement = element;
                },
              ]}
            />
          ) : null,
          <div
            id={`${id}-list`}
            role={searchable ? "listbox" : undefined}
            aria-labelledby={searchable ? id : undefined}
            ref={[context.parts.list]}
          >
            {keyed(
              rows,
              (row) => row.key,
              (row) => {
                if (row.value.kind === "group") {
                  return (
                    <div
                      role={"presentation"}
                      hidden={derived(() => {
                        const label = row.value.kind === "group" ? row.value.label : "";
                        return !readOptions().some(
                          (candidate) => candidate.group === label && matches(candidate),
                        );
                      })}
                      ref={[context.parts.group]}
                    >
                      {derived(() => (row.value.kind === "group" ? row.value.label : ""))}
                    </div>
                  );
                }
                return (
                  <button
                    type={"button"}
                    role={"option"}
                    tabIndex={-1}
                    disabled={derived(
                      () => row.value.kind === "option" && Boolean(row.value.option.disabled),
                    )}
                    hidden={derived(() =>
                      row.value.kind === "option" ? !matches(row.value.option) : true,
                    )}
                    aria-disabled={derived(() =>
                      row.value.kind === "option" && row.value.option.disabled ? "true" : undefined,
                    )}
                    aria-selected={derived(() =>
                      String(row.value.kind === "option" && readValue() === row.value.option.value),
                    )}
                    data-choice-index={derived(() =>
                      row.value.kind === "option" ? row.value.index : -1,
                    )}
                    onClick={() => {
                      if (row.value.kind === "option") choose(row.value.index);
                    }}
                    ref={[context.parts.option]}
                  >
                    {derived(() => (row.value.kind === "option" ? row.value.option.label : ""))}
                  </button>
                );
              },
            )}
          </div>,
          searchable ? (
            <p hidden={hasResults} role={"status"} ref={[context.parts.empty]}>
              {emptyMessage}
            </p>
          ) : null,
        ],
      })}
      {
        <select
          id={`${id}-native`}
          name={name}
          form={props.form}
          value={derived(() => readValue())}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden={"true"}
          aria-labelledby={id}
          onChange={(event: Event) => {
            const next = (event.currentTarget as HTMLSelectElement).value;
            choose(readOptions().findIndex((option) => option.value === next));
          }}
          onInvalid={(event: Event) => {
            event.preventDefault();
            invalid.value = "true";
            validation.value = (event.currentTarget as HTMLSelectElement).validationMessage;
            trigger()?.focus();
          }}
          ref={[context.parts.native, nativeRef]}
        >
          {h("option", { value: "" }, placeholder)}
          {keyed(
            derived(() => readOptions()),
            (option) => option.value,
            (option) =>
              h(
                "option",
                {
                  value: derived(() => option.value.value),
                  disabled: derived(() => Boolean(option.value.disabled)),
                  defaultSelected: option.value.value === defaultValue,
                },
                derived(() => option.value.label),
              ),
          )}
        </select>
      }
      {
        <span id={`${id}-validation`} role={"alert"} ref={[context.parts.validation]}>
          {validation}
        </span>
      }
    </div>
  );
}
ChoiceSelect.meta = {
  name: "choice-select",
  parts: [
    "root",
    "trigger",
    "value",
    "indicator",
    "list",
    "group",
    "option",
    "native",
    "validation",
    "search",
    "empty",
  ],
} as const;
