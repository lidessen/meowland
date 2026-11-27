import { h, keyed, type Props, type Context } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { createListbox, isTypeaheadKey } from "../behaviors";
import { Icon } from "../icons/icon";
import { elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";

export interface ChoiceOption {
  value: string;
  label: string;
  /** One supporting line under the label in the list, such as a model's context size. */
  description?: string;
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
  /** A Signal stays live, so a choice can follow a pending submit. */
  disabled?: MaybeSignal<boolean>;
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
  const highlighted = signal<string | null>(null);
  const activeOption = derived(() => {
    const available = readOptions().filter((option) => !option.disabled && matches(option));
    return (
      available.find((option) => option.value === highlighted.value)?.value ??
      available.find((option) => option.value === readValue())?.value ??
      available[0]?.value ??
      null
    );
  });
  const listbox = createListbox({
    id,
    focus: "real",
    loop: true,
    highlighted,
    items: () =>
      readOptions().flatMap((option, index) => {
        const el = panel()?.querySelector<HTMLElement>(`[data-choice-index="${index}"]`);
        return el
          ? [{ key: option.value, label: option.label, disabled: option.disabled, el }]
          : [];
      }),
  });
  const reconcile = () => {
    highlighted.value = activeOption.value;
    return listbox.reconcile();
  };
  const focusOption = (key: string | null) => {
    queueMicrotask(() => {
      if (!disposed && open.value && key !== null) listbox.highlight(key);
    });
  };
  const openList = (edge?: "first" | "last", typeahead?: KeyboardEvent) => {
    query.value = "";
    const available = readOptions().filter((option) => !option.disabled);
    highlighted.value =
      edge === "first"
        ? (available[0]?.value ?? null)
        : edge === "last"
          ? (available.at(-1)?.value ?? null)
          : (available.find((option) => option.value === readValue())?.value ?? null);
    open.value = true;
    queueMicrotask(() => {
      if (disposed || !open.value) return;
      const key = reconcile();
      if (searchable) searchElement?.focus();
      else if (typeahead && triggerElement) {
        const Keyboard = triggerElement.ownerDocument.defaultView!.KeyboardEvent;
        highlighted.value = null;
        listbox.keydown(new Keyboard("keydown", { key: typeahead.key, cancelable: true }));
        if (highlighted.value === null && key !== null) listbox.highlight(key);
      } else if (key !== null) listbox.highlight(key);
    });
  };
  const close = (restore = true) => {
    open.value = false;
    query.value = "";
    if (restore) trigger()?.focus();
  };
  const choose = (index: number) => {
    const option = readOptions()[index];
    if (unwrap(disabled) || !option || option.disabled) return;
    if (value === undefined) local.value = option.value;
    invalid.value = undefined;
    validation.value = "";
    onValueChange?.(option.value);
    if (nativeElement) nativeElement.value = readValue();
    close();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Tab" && open.value) {
      close(false);
      return;
    }
    if (
      unwrap(disabled) ||
      event.isComposing ||
      event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    const inSearch = event.target === searchElement;
    if (inSearch && !["ArrowDown", "ArrowUp", "Escape", "Tab", "Enter"].includes(event.key)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (!open.value) {
      if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList(
          event.key === "Home"
            ? "first"
            : event.key === "End"
              ? "last"
              : event.key === "ArrowUp" &&
                  !readOptions().some((option) => option.value === readValue() && !option.disabled)
                ? "last"
                : undefined,
        );
      } else if (isTypeaheadKey(event)) {
        event.preventDefault();
        if (searchable) {
          openList();
          query.value = event.key;
        } else openList(undefined, event);
      }
      return;
    }
    if (inSearch && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const enabled = enabledOptions();
      const index = event.key === "ArrowUp" ? enabled.at(-1) : enabled[0];
      if (index !== undefined) focusOption(readOptions()[index]!.value);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (inSearch) {
        const enabled = enabledOptions();
        if (enabled.length === 1) choose(enabled[0]!);
        else if (enabled[0] !== undefined) focusOption(readOptions()[enabled[0]]!.value);
      } else {
        const index = readOptions().findIndex((option) => option.value === highlighted.value);
        if (index >= 0) choose(index);
      }
    } else {
      reconcile();
      listbox.keydown(event);
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
    listbox.dispose();
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
                  else {
                    highlighted.value = null;
                    queueMicrotask(() => {
                      if (!disposed && open.value) {
                        const key = reconcile();
                        if (key !== null) listbox.highlight(key);
                      }
                    });
                  }
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
                    tabIndex={derived(() =>
                      open.value &&
                      row.value.kind === "option" &&
                      activeOption.value === row.value.option.value
                        ? 0
                        : -1,
                    )}
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
                    onFocus={() => {
                      if (row.value.kind === "option") highlighted.value = row.value.option.value;
                    }}
                    onClick={() => {
                      if (row.value.kind === "option") choose(row.value.index);
                    }}
                    ref={[context.parts.option]}
                  >
                    <span ref={[context.parts.optionLabel]}>
                      {derived(() => (row.value.kind === "option" ? row.value.option.label : ""))}
                    </span>
                    <span
                      hidden={derived(
                        () => row.value.kind !== "option" || !row.value.option.description,
                      )}
                      ref={[context.parts.description]}
                    >
                      {derived(() =>
                        row.value.kind === "option" ? (row.value.option.description ?? "") : "",
                      )}
                    </span>
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
    "optionLabel",
    "description",
    "native",
    "validation",
    "search",
    "empty",
  ],
} as const;
