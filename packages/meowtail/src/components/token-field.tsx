import { h, keyed, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { Icon } from "../icons/icon";
import { elementId } from "../shared/element-id";

export interface TokenFieldToken {
  /** Unique in the list; also the submitted form value. */
  id: string;
  label: string;
  /** The host could not resolve this token; its name says so. */
  invalid?: boolean;
}

export interface TokenFieldProps extends Props {
  /** Id of the draft input; also the base for the token ids. Generated when omitted. */
  id?: string;
  /** The host owns the tokens; a Signal keeps them live. */
  tokens: MaybeSignal<readonly TokenFieldToken[]>;
  /**
   * Called with trimmed, non-empty draft text on Enter, a separator or a paste. The host resolves,
   * deduplicates or rejects it and updates `tokens`. Return false to keep the draft for correction.
   */
  onAdd: (text: string) => boolean | void;
  /** Called when the reader removes a token; the host decides. */
  onRemove: (id: string) => void;
  /** Characters that end a token as they are typed or pasted. */
  separators?: readonly string[];
  /** Accessible name of the token list. */
  listLabel?: string;
  removeLabel?: (label: string) => string;
  /** Read after a token's name when the host marked it invalid. */
  invalidMessage?: string;
  /** Submits one value per token under this name. */
  name?: string;
  /** At least one token; enforced through the draft's custom validity. */
  required?: boolean;
  requiredMessage?: string;
  disabled?: MaybeSignal<boolean>;
  placeholder?: string;
  className?: Props["className"];
}

/** Several values entered as text: tokens the host resolves, removable while the reader types. */
export function TokenField(
  {
    id = elementId("token-field"),
    tokens,
    onAdd,
    onRemove,
    separators = [","],
    listLabel = "Added items",
    removeLabel = (label) => `Remove ${label}`,
    invalidMessage = "Needs attention",
    name,
    required = false,
    requiredMessage = "Add at least one item.",
    disabled = false,
    placeholder,
    className,
    ref,
    ...props
  }: TokenFieldProps,
  context: Context<typeof TokenField>,
) {
  const list = () => unwrap(tokens);
  let input: HTMLInputElement | undefined;
  const buttons = new Map<string, HTMLButtonElement>();
  // The token the reader last stood on keeps the single tab stop among tokens.
  const stop = signal<string | undefined>(undefined);
  const tabStop = derived(() => {
    const items = list();
    return items.some((item) => item.id === stop.value) ? stop.value : items.at(-1)?.id;
  });
  let focused: string | undefined;
  // Focus to restore once the host has actually removed this token.
  let pending: { id: string; index: number; back: boolean } | undefined;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });

  const tokenId = (key: string) => `${id}-token-${key}`;
  const focusToken = (key: string | undefined) => {
    if (key === undefined) return input?.focus();
    stop.value = key;
    buttons.get(key)?.focus();
  };
  const validate = () => {
    input?.setCustomValidity(required && list().length === 0 ? requiredMessage : "");
  };
  context.effect(() => {
    list();
    validate();
  });

  const add = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || unwrap(disabled)) return true;
    return onAdd(trimmed) !== false;
  };
  const remove = (key: string, back: boolean) => {
    if (unwrap(disabled)) return;
    pending = { id: key, index: list().findIndex((item) => item.id === key), back };
    onRemove(key);
  };
  const repair = (removed: string) => {
    if (focused !== removed && pending?.id !== removed) return;
    const index = pending?.id === removed ? pending.index : 0;
    const back = pending?.id === removed && pending.back;
    pending = undefined;
    focused = undefined;
    queueMicrotask(() => {
      if (!alive) return;
      const items = list();
      const next = back ? (items[index - 1] ?? items[index]) : items[index];
      focusToken(next?.id);
    });
  };

  const draftKeydown = (event: KeyboardEvent) => {
    if (event.isComposing) return;
    const element = event.currentTarget as HTMLInputElement;
    const atStart = element.selectionStart === 0 && element.selectionEnd === 0;
    if (event.key === "Enter") {
      // An empty draft leaves Enter to the form.
      if (!element.value.trim()) return;
      event.preventDefault();
      if (add(element.value)) element.value = "";
    } else if (separators.includes(event.key)) {
      event.preventDefault();
      if (add(element.value)) element.value = "";
    } else if ((event.key === "Backspace" || event.key === "ArrowLeft") && atStart) {
      const last = list().at(-1);
      if (!last) return;
      // The first Backspace only moves to the last token, so a token is never lost by accident.
      event.preventDefault();
      focusToken(last.id);
    }
  };
  const paste = (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData("text") ?? "";
    if (!separators.some((separator) => text.includes(separator))) return;
    event.preventDefault();
    const element = event.currentTarget as HTMLInputElement;
    const start = element.selectionStart ?? element.value.length;
    const end = element.selectionEnd ?? start;
    const combined = element.value.slice(0, start) + text + element.value.slice(end);
    const pieces = combined.split(new RegExp(`[${separators.map(escape).join("")}]`));
    const rest = pieces.pop() ?? "";
    const kept = pieces.filter((piece) => !add(piece));
    element.value = [...kept, rest].filter((piece) => piece.trim()).join(separators[0] ?? ",");
  };
  const tokenKeydown = (event: KeyboardEvent, key: string) => {
    const items = list();
    const index = items.findIndex((item) => item.id === key);
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = items[index + (event.key === "ArrowLeft" ? -1 : 1)];
      if (event.key === "ArrowLeft" && !next) return;
      focusToken(next?.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusToken(items[0]?.id);
    } else if (event.key === "End") {
      event.preventDefault();
      focusToken(undefined);
    } else if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      remove(key, event.key === "Backspace");
    }
  };

  return (
    <div className={className} ref={[context.parts.root]}>
      <div
        ref={context.parts.control}
        onClick={(event: MouseEvent) => {
          if (event.target === event.currentTarget) input?.focus();
        }}
      >
        <ul role="list" aria-label={listLabel} ref={context.parts.list}>
          {keyed(
            tokens,
            (item) => item.id,
            (item) => {
              const key = item.value.id;
              const invalid = derived(() => Boolean(item.value.invalid));
              return (
                <li
                  data-invalid={derived(() => (invalid.value ? "true" : undefined))}
                  ref={[context.parts.token, () => () => repair(key)]}
                >
                  <span ref={context.parts.label}>{derived(() => item.value.label)}</span>
                  <span
                    id={`${tokenId(key)}-invalid`}
                    hidden={derived(() => !invalid.value)}
                    ref={context.parts.invalid}
                  >
                    {invalidMessage}
                  </span>
                  <button
                    type="button"
                    tabIndex={derived(() => (tabStop.value === key ? 0 : -1))}
                    disabled={disabled}
                    aria-label={derived(() => removeLabel(item.value.label))}
                    aria-describedby={derived(() =>
                      invalid.value ? `${tokenId(key)}-invalid` : undefined,
                    )}
                    onFocus={() => {
                      focused = key;
                      stop.value = key;
                    }}
                    onBlur={() => {
                      if (focused === key) focused = undefined;
                    }}
                    onKeyDown={(event: KeyboardEvent) => tokenKeydown(event, key)}
                    onClick={() => remove(key, false)}
                    ref={[
                      context.parts.remove,
                      (element: HTMLButtonElement) => {
                        buttons.set(key, element);
                        return () => {
                          if (buttons.get(key) === element) buttons.delete(key);
                        };
                      },
                    ]}
                  >
                    <Icon name="x" />
                  </button>
                </li>
              );
            },
          )}
        </ul>
        <input
          {...props}
          id={id}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          onKeyDown={draftKeydown}
          onPaste={paste}
          ref={[
            context.parts.input,
            ref,
            (element: HTMLInputElement) => {
              input = element;
              validate();
            },
          ]}
        />
      </div>
      {name
        ? keyed(
            tokens,
            (item) => item.id,
            (item) => <input type="hidden" name={name} value={derived(() => item.value.id)} />,
          )
        : null}
    </div>
  );
}
TokenField.meta = {
  name: "token-field",
  parts: ["root", "control", "list", "token", "label", "invalid", "remove", "input"],
} as const;

function escape(character: string): string {
  return character.replace(/[\\\]^-]/g, "\\$&");
}
