import {
  defineComponent,
  h,
  unwrap,
  type ComponentContract,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Popover, type PopoverTriggerBindings } from "./popover";
import { Icon } from "../icons/icon";
import { elementByIdInRoot } from "../shared/dom-root";

export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}
export const choiceSelectContract = {
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
} as const satisfies ComponentContract;

export interface ChoiceSelectProps extends Props {
  options: readonly ChoiceOption[];
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
  className?: string;
  placement?: "top" | "bottom";
  align?: "start" | "end";
  matchTriggerWidth?: boolean;
}

let nextChoiceId = 0;

/** Single-choice listbox. Form participation remains native; data fetching belongs to callers. */
export const ChoiceSelect = defineComponent<
  ChoiceSelectProps,
  typeof choiceSelectContract.name,
  (typeof choiceSelectContract.parts)[number]
>(
  choiceSelectContract,
  (
    {
      options,
      value,
      defaultValue = "",
      onValueChange,
      name,
      id = `choice-${++nextChoiceId}`,
      disabled = false,
      required = false,
      placeholder = "请选择",
      searchable = false,
      searchPlaceholder = "搜索选项",
      emptyMessage = "没有匹配的选项",
      className,
      placement = "bottom",
      align = "start",
      matchTriggerWidth = true,
      ...props
    },
    context,
  ) => {
    const selected = context.signal(value === undefined ? defaultValue : unwrap(value));
    const open = context.signal(false);
    const caption = context.signal(placeholder);
    const invalid = context.signal<string | undefined>(undefined);
    const validation = context.signal("");
    const query = context.signal("");
    const hasResults = context.signal(true);
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
    const enabledOptions = () =>
      options
        .map((option, index) => (option.disabled || !matches(option) ? -1 : index))
        .filter((index) => index >= 0);
    context.effect(() => {
      hasResults.value = options.some(matches);
    });
    context.effect(() => {
      if (value !== undefined) selected.value = unwrap(value);
    });
    context.effect(() => {
      caption.value =
        options.find((option) => option.value === selected.value)?.label ?? placeholder;
    });
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
      const index = options.findIndex(
        (option) => option.value === selected.value && !option.disabled,
      );
      return index >= 0 ? index : (enabled[last ? enabled.length - 1 : 0] ?? -1);
    };
    const close = (restore = true) => {
      open.value = false;
      query.value = "";
      if (restore) trigger()?.focus();
    };
    const choose = (index: number) => {
      const option = options[index];
      if (disabled || !option || option.disabled) return;
      if (value === undefined) selected.value = option.value;
      invalid.value = undefined;
      validation.value = "";
      onValueChange?.(option.value);
      if (nativeElement) nativeElement.value = selected.value;
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
        if (options[index]!.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase())) {
          focusOption(index);
          break;
        }
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (disabled || event.isComposing) return;
      const enabled = enabledOptions();
      const inSearch = event.target === searchElement;
      if (inSearch && !["ArrowDown", "ArrowUp", "Escape", "Tab", "Enter"].includes(event.key))
        return;
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
                  (position + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) %
                    enabled.length
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
        native.value = selected.value;
        const form = native?.form;
        if (!form) return;
        let resetTimer: ReturnType<typeof setTimeout> | undefined;
        const reset = (event: Event) => {
          clearTimeout(resetTimer);
          // A reset event's microtask checkpoint can precede the browser's
          // default reset action. Reconcile only after that action completes.
          resetTimer = setTimeout(() => {
            if (disposed || event.defaultPrevented) return;
            if (value === undefined) selected.value = defaultValue;
            native.value = selected.value;
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

    return context.part(
      "root",
      "div",
      { className },
      h(Popover, {
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
          return context.part(
            "trigger",
            "button",
            {
              ...props,
              ...bindings,
              type: "button",
              disabled,
              ref: (element: HTMLButtonElement) => {
                triggerElement = element;
              },
              "aria-haspopup": searchable ? "dialog" : "listbox",
              "aria-required": required ? "true" : undefined,
              "aria-invalid": props["aria-invalid"] ?? invalid,
              "aria-describedby": [props["aria-describedby"], `${id}-value`, `${id}-validation`]
                .filter(Boolean)
                .join(" "),
              onKeyDown: keydown,
              onClick: (event: MouseEvent) => {
                bindings.onClick(event);
                if (open.value) {
                  if (searchable)
                    queueMicrotask(() => {
                      if (!disposed && open.value) searchElement?.focus();
                    });
                  else focusOption(initialIndex());
                }
              },
            },
            context.part("value", "span", { id: `${id}-value` }, caption),
            context.part(
              "indicator",
              "span",
              { "aria-hidden": "true" },
              h(Icon, { name: "chevron-down" }),
            ),
          );
        },
        children: [
          searchable
            ? context.part("search", "input", {
                type: "search",
                value: query,
                placeholder: searchPlaceholder,
                "aria-label": searchPlaceholder,
                "aria-controls": `${id}-list`,
                maxLength: 256,
                ref: (element: HTMLInputElement) => {
                  searchElement = element;
                },
                onInput: (event: Event) => {
                  query.value = (event.currentTarget as HTMLInputElement).value;
                },
              })
            : null,
          context.part(
            "list",
            "div",
            {
              id: `${id}-list`,
              role: searchable ? "listbox" : undefined,
              "aria-labelledby": searchable ? id : undefined,
            },
            ...options.flatMap((option, index) => {
              const isSelected = context.signal("false");
              const hidden = context.signal(false);
              context.effect(() => {
                isSelected.value = String(selected.value === option.value);
                hidden.value = !matches(option);
              });
              const item = context.part(
                "option",
                "button",
                {
                  type: "button",
                  role: "option",
                  tabIndex: -1,
                  disabled: option.disabled,
                  hidden,
                  "aria-disabled": option.disabled ? "true" : undefined,
                  "aria-selected": isSelected,
                  "data-choice-index": index,
                  onClick: () => choose(index),
                },
                option.label,
              );
              const groupHidden = context.signal(false);
              context.effect(() => {
                groupHidden.value = !options.some(
                  (candidate) => candidate.group === option.group && matches(candidate),
                );
              });
              return option.group && option.group !== options[index - 1]?.group
                ? [
                    context.part(
                      "group",
                      "div",
                      { role: "presentation", hidden: groupHidden },
                      option.group,
                    ),
                    item,
                  ]
                : [item];
            }),
          ),
          searchable
            ? context.part("empty", "p", { hidden: hasResults, role: "status" }, emptyMessage)
            : null,
        ],
      }),
      context.part(
        "native",
        "select",
        {
          id: `${id}-native`,
          name,
          form: props.form,
          value: selected,
          required,
          disabled,
          tabIndex: -1,
          ref: nativeRef,
          "aria-hidden": "true",
          "aria-labelledby": id,
          onChange: (event: Event) => {
            const next = (event.currentTarget as HTMLSelectElement).value;
            choose(options.findIndex((option) => option.value === next));
          },
          onInvalid: (event: Event) => {
            event.preventDefault();
            invalid.value = "true";
            validation.value = (event.currentTarget as HTMLSelectElement).validationMessage;
            trigger()?.focus();
          },
        },
        h("option", { value: "" }, placeholder),
        ...options.map((option) =>
          h("option", { value: option.value, disabled: option.disabled }, option.label),
        ),
      ),
      context.part("validation", "span", { id: `${id}-validation`, role: "alert" }, validation),
    );
  },
);
