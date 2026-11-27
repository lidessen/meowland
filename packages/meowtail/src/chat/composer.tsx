import { defineStyleProps } from "meowcss/meowjsx";
import { h, keyed, type Child, type Context, type Props } from "meowjsx";
import { derived, signal, unwrap, type MaybeSignal } from "meowjsx/signal";
import { createListbox } from "../behaviors";
import { Popover } from "../components/popover";
import { activeElementInRoot, elementByIdInRoot } from "../shared/dom-root";
import { elementId } from "../shared/element-id";
import {
  findComposerTrigger,
  insertComposerSuggestion,
  type ComposerSuggestion,
  type ComposerTrigger,
  type ComposerTriggerMatch,
} from "./composer-triggers";
import { chatComposerOptions } from "./composer.options";
import { Icon } from "../icons/icon";

export type ChatComposerSubmit = (event: SubmitEvent) => void;
export type ChatComposerInput = (event: Event) => void;

export interface ChatComposerProps extends Props {
  /** Controlled text; a Signal stays live. Omit it to keep a local draft that starts at defaultValue. */
  value?: MaybeSignal<string>;
  defaultValue?: string;
  /** Called for every edit and for text the composer writes itself (an accepted suggestion, a reset). */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  inputLabel?: string;
  /** Inline keeps a short draft and its actions on one row; long drafts still grow.
   * Bar is one rounded row: attach, text, trailing choices, send. */
  /** Draft attachments belong to the same writing surface; upload ownership stays with the host. */
  attachments?: Child;
  /**
   * Choices the draft is submitted with (model, project, priority) beside the send action, usually
   * host-controlled ChoiceSelects; options and state belong to the host.
   */
  trailing?: Child;
  /** Supporting instructions below the writing surface, associated through hintId. */
  hint?: Child;
  hintId?: string;
  submitLabel?: string;
  /** Visible action content; the accessible name always comes from submitLabel. */
  submitContent?: Child;
  disabled?: MaybeSignal<boolean>;
  readOnly?: MaybeSignal<boolean>;
  /** Prevent another submission while keeping the draft editable. */
  submitDisabled?: MaybeSignal<boolean>;
  /**
   * Which key submits: "none" (Enter inserts a newline), "enter" (Shift+Enter for a newline) or
   * "mod-enter" (Cmd+Enter or Ctrl+Enter). A blocked composer swallows the key; IME composition never
   * submits. Fixed for the mount.
   */
  submitOn?: "none" | "enter" | "mod-enter";
  /** Characters that open host suggestions while writing. Fixed for the mount; use `disabled` on one. */
  triggers?: readonly ComposerTrigger[];
  /** Where the suggestion list opens relative to the writing surface; it flips when there is no room. */
  suggestionPlacement?: "top" | "bottom";
  /** Status shown while a trigger's lookup is pending. */
  loadingMessage?: string;
  onSubmit?: ChatComposerSubmit;
  onInput?: ChatComposerInput;
}

interface ActiveTrigger extends ComposerTriggerMatch {
  trigger: ComposerTrigger;
}

const sameMatch = (a: ActiveTrigger | null, b: ActiveTrigger | null) =>
  a === b || (!!a && !!b && a.index === b.index && a.char === b.char && a.query === b.query);

/** The message input of a conversation, with attachments, choices, suggestions and send. */
export function ChatComposer(
  {
    value,
    defaultValue = "",
    onValueChange,
    placeholder = "Write a message…",
    inputLabel = "Message",
    attachments,
    trailing,
    hint,
    hintId,
    submitLabel = "Send",
    submitContent,
    disabled = false,
    readOnly = false,
    submitDisabled = false,
    submitOn = "none",
    triggers = [],
    suggestionPlacement = "top",
    loadingMessage = "Loading suggestions",
    onSubmit,
    onInput,
    children,
    className,
    ref,
    ...props
  }: ChatComposerProps,
  context: Context<typeof ChatComposer>,
) {
  const local = signal(defaultValue);
  const current = value !== undefined ? value : local;
  const submitBlocked =
    disabled === true
      ? true
      : typeof disabled === "boolean"
        ? submitDisabled
        : derived(() => Boolean(unwrap(disabled)) || Boolean(unwrap(submitDisabled)));
  const blocked = () =>
    Boolean(unwrap(disabled)) || Boolean(unwrap(readOnly)) || Boolean(unwrap(submitDisabled));
  const hasTriggers = triggers.length > 0;
  // Ids only exist where the suggestion list needs them, so plain composers render as before.
  const baseId = hasTriggers ? elementId("chat-composer") : "";
  const surfaceId = `${baseId}-surface`;
  const listId = `${baseId}-suggestions`;
  let field: HTMLTextAreaElement | undefined;
  let submitButton: HTMLButtonElement | undefined;
  let alive = true;
  context.onCleanup(() => {
    alive = false;
  });
  const resize = () => {
    if (!field?.isConnected) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  };

  // The trigger occurrence under the caret, and the one the reader dismissed.
  const match = signal<ActiveTrigger | null>(null);
  let dismissed: { index: number; char: string } | null = null;
  const items = signal<readonly ComposerSuggestion[]>([]);
  const loading = signal(false);
  const settled = signal(false);
  const picked = signal<string | null>(null);
  const domVersion = hasTriggers ? signal(0) : undefined;
  const evaluate = (fromPaste = false) => {
    if (!triggers.length) return;
    const element = field;
    const usable =
      element &&
      element.isConnected &&
      activeElementInRoot(element) === element &&
      !unwrap(disabled) &&
      !unwrap(readOnly);
    const found =
      usable && element.selectionStart === element.selectionEnd
        ? findComposerTrigger(element.value, element.selectionStart, triggers)
        : null;
    const trigger = found ? triggers.find((candidate) => candidate.char === found.char) : undefined;
    let next: ActiveTrigger | null = found && trigger ? { ...found, trigger } : null;
    if (dismissed && (!next || next.index !== dismissed.index || next.char !== dismissed.char))
      dismissed = null;
    // A paste never opens a list; it dismisses the occurrence it lands in.
    if (next && fromPaste && !sameMatch(match.value, next)) dismissed = next;
    if (next && dismissed) next = null;
    if (!sameMatch(match.value, next)) {
      if (match.value?.index !== next?.index || match.value?.char !== next?.char)
        picked.value = null;
      match.value = next;
    }
  };
  const close = () => {
    if (match.value) dismissed = { index: match.value.index, char: match.value.char };
    match.value = null;
  };

  // Lookup: a synchronous result re-runs when Signals the host read change; a late result is dropped.
  let lookup: AbortController | undefined;
  context.effect(() => {
    const active = match.value;
    lookup?.abort();
    lookup = undefined;
    if (!active || unwrap(active.trigger.disabled ?? false)) {
      items.value = [];
      loading.value = false;
      settled.value = false;
      return;
    }
    const controller = new AbortController();
    lookup = controller;
    const result = active.trigger.suggest(active.query, { signal: controller.signal });
    if (typeof (result as PromiseLike<unknown>).then !== "function") {
      items.value = result as readonly ComposerSuggestion[];
      loading.value = false;
      settled.value = true;
      return;
    }
    loading.value = true;
    settled.value = false;
    void Promise.resolve(result).then(
      (list) => {
        if (!alive || lookup !== controller) return;
        items.value = list;
        loading.value = false;
        settled.value = true;
      },
      () => {
        if (!alive || lookup !== controller) return;
        items.value = [];
        loading.value = false;
        settled.value = true;
      },
    );
  });
  context.onCleanup(() => lookup?.abort());

  const enabledItems = () => items.value.filter((item) => !item.disabled);
  const activeId = derived(() => {
    const list = enabledItems();
    return (list.find((item) => item.id === picked.value) ?? list[0])?.id;
  });
  const emptyMessage = derived(() => match.value?.trigger.emptyMessage);
  const showEmpty = derived(
    () => settled.value && items.value.length === 0 && emptyMessage.value !== undefined,
  );
  const open = derived(
    () =>
      match.value !== null &&
      !unwrap(match.value.trigger.disabled ?? false) &&
      (items.value.length > 0 || loading.value || showEmpty.value),
  );
  const listbox: ReturnType<typeof createListbox<string>> | undefined = hasTriggers
    ? createListbox({
        id: baseId,
        focus: "virtual",
        loop: true,
        highlighted: picked,
        get controller() {
          return field;
        },
        items: () =>
          items.value.flatMap((item) => {
            const el = field && elementByIdInRoot(field, listbox!.idForKey(item.id));
            return el ? [{ key: item.id, label: item.label, disabled: item.disabled, el }] : [];
          }),
      })
    : undefined;
  if (listbox) {
    context.onCleanup(listbox.dispose);
    context.effect(() => {
      void items.value;
      void open.value;
      queueMicrotask(() => {
        if (alive) domVersion!.value++;
      });
    });
  }
  const announcement = derived(() => {
    if (!open.value) return "";
    if (loading.value) return loadingMessage;
    if (showEmpty.value) return emptyMessage.value ?? "";
    const count = items.value.length;
    return `${match.value!.trigger.label}: ${count} ${count === 1 ? "suggestion" : "suggestions"}`;
  });

  const write = (text: string) => {
    if (value === undefined) local.value = text;
    onValueChange?.(text);
  };
  const accept = (suggestion: ComposerSuggestion) => {
    const active = match.value;
    const element = field;
    if (!active || !element || suggestion.disabled) return;
    const next = insertComposerSuggestion(element.value, active, suggestion);
    write(next.text);
    // A controlled host that ignores the change still sees the field match its own value.
    element.value = value === undefined ? next.text : unwrap(current);
    element.setSelectionRange(next.caret, next.caret);
    resize();
    match.value = null;
    dismissed = null;
    evaluate();
    active.trigger.onAccept?.(suggestion);
  };
  const reveal = (key: string) => {
    queueMicrotask(() => {
      if (!alive || !field) return;
      elementByIdInRoot(field, listbox!.idForKey(key))?.scrollIntoView?.({ block: "nearest" });
    });
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (open.value) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        picked.value = activeId.value ?? null;
        const Keyboard = field!.ownerDocument.defaultView!.KeyboardEvent;
        const navigation = new Keyboard("keydown", { key: event.key, cancelable: true });
        event.preventDefault();
        if (listbox?.keydown(navigation) && picked.value !== null) reveal(picked.value);
        return;
      }
      if ((event.key === "Enter" || event.key === "Tab") && !event.altKey) {
        const chosen = enabledItems().find((item) => item.id === activeId.value);
        if (chosen) {
          event.preventDefault();
          accept(chosen);
          return;
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
    }
    if (event.key !== "Enter" || submitOn === "none" || event.altKey) return;
    const modifier = event.metaKey || event.ctrlKey;
    const wanted = submitOn === "enter" ? !event.shiftKey && !modifier : modifier;
    if (!wanted) return;
    event.preventDefault();
    if (blocked()) return;
    const form = field?.form;
    if (form && submitButton) form.requestSubmit(submitButton);
  };

  const parts = context.parts;
  const inputRef = (textarea: HTMLTextAreaElement) => {
    field = textarea;
    const stop = context.effect(() => {
      unwrap(current);
      resize();
      // Text the host changed (a cleared draft, a removed reference) moves the occurrence too.
      queueMicrotask(() => {
        if (alive) evaluate();
      });
    });
    const stopState = context.effect(() => {
      if (unwrap(disabled) || unwrap(readOnly)) match.value = null;
    });
    const onResizeInput = () => resize();
    textarea.addEventListener("input", onResizeInput);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : undefined;
    observer?.observe(textarea);
    queueMicrotask(() => {
      if (textarea.isConnected) resize();
    });
    const form = textarea.form;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Native reset restores the attribute default; the owner signal follows it.
    const reset = (event: Event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!alive || event.defaultPrevented) return;
        write(defaultValue);
        textarea.value = unwrap(current);
        match.value = null;
        resize();
      }, 0);
    };
    form?.addEventListener("reset", reset);
    return () => {
      stop();
      stopState();
      clearTimeout(timer);
      form?.removeEventListener("reset", reset);
      textarea.removeEventListener("input", onResizeInput);
      observer?.disconnect();
      field = undefined;
    };
  };
  return (
    <form {...props} className={className} onSubmit={onSubmit} ref={[parts.root, ref]}>
      <div id={hasTriggers ? surfaceId : undefined} ref={parts.surface}>
        {attachments ? <div ref={parts.attachments}>{attachments}</div> : null}
        <div ref={parts.field}>
          <textarea
            data-chat-input
            name="message"
            rows={1}
            value={current}
            placeholder={placeholder}
            aria-label={inputLabel}
            aria-describedby={hint && hintId ? hintId : undefined}
            aria-autocomplete={hasTriggers ? "list" : undefined}
            aria-haspopup={hasTriggers ? "listbox" : undefined}
            aria-controls={
              hasTriggers ? derived(() => (open.value ? listId : undefined)) : undefined
            }
            aria-activedescendant={
              hasTriggers
                ? derived(
                    () => (
                      domVersion!.value,
                      open.value && activeId.value !== undefined
                        ? listbox!.activeId(activeId.value)
                        : undefined
                    ),
                  )
                : undefined
            }
            disabled={disabled}
            readOnly={readOnly}
            onInput={(event: Event) => {
              const text = (event.currentTarget as HTMLTextAreaElement).value;
              if (value === undefined) local.value = text;
              onValueChange?.(text);
              onInput?.(event);
              evaluate((event as InputEvent).inputType === "insertFromPaste");
            }}
            onKeyDown={keydown}
            onKeyUp={(event: KeyboardEvent) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(event.key)
              )
                evaluate();
              else if (!open.value && (event.key === "ArrowUp" || event.key === "ArrowDown"))
                evaluate();
            }}
            onPointerUp={() => evaluate()}
            onFocus={() => evaluate()}
            onBlur={() => {
              match.value = null;
            }}
            ref={[parts.input, inputRef]}
          />
        </div>
        <div ref={parts.actions}>
          {children}
          {trailing ? <div ref={parts.trailing}>{trailing}</div> : null}
          <button
            type="submit"
            disabled={submitBlocked}
            aria-label={submitLabel}
            ref={[
              parts.submit,
              (element: HTMLButtonElement) => {
                submitButton = element;
              },
            ]}
          >
            {submitContent ?? <Icon name="arrow-up" />}
          </button>
        </div>
      </div>
      {hasTriggers ? (
        <div ref={parts.suggestions}>
          {h(Popover, {
            id: `${baseId}-popup`,
            triggerId: surfaceId,
            open,
            onOpenChange: (next: boolean) => {
              if (!next) close();
            },
            matchTriggerWidth: true,
            placement: suggestionPlacement,
            trigger: () => null,
            children: [
              <div
                id={listId}
                role="listbox"
                aria-label={derived(() => match.value?.trigger.label ?? "Suggestions")}
                ref={parts.suggestionList}
              >
                {keyed(
                  items,
                  (item) => item.id,
                  (item) => (
                    <div
                      id={listbox!.idForKey(item.value.id)}
                      role="option"
                      aria-selected={derived(() => String(activeId.value === item.value.id))}
                      aria-disabled={derived(() => (item.value.disabled ? "true" : undefined))}
                      // Keep focus in the textarea; a pointer choice does not blur it.
                      onMouseDown={(event: MouseEvent) => event.preventDefault()}
                      onClick={() => accept(item.value)}
                      ref={parts.suggestion}
                    >
                      {derived(() =>
                        item.value.leading !== undefined && item.value.leading !== null ? (
                          <span ref={parts.suggestionLeading}>{item.value.leading}</span>
                        ) : null,
                      )}
                      <span ref={parts.suggestionCopy}>
                        <span ref={parts.suggestionLabel}>{derived(() => item.value.label)}</span>
                        <span
                          hidden={derived(() => !item.value.description)}
                          ref={parts.suggestionDescription}
                        >
                          {derived(() => item.value.description ?? "")}
                        </span>
                      </span>
                      <span hidden={derived(() => !item.value.meta)} ref={parts.suggestionMeta}>
                        {derived(() => item.value.meta ?? "")}
                      </span>
                    </div>
                  ),
                )}
              </div>,
              <p
                hidden={derived(() => !loading.value && !showEmpty.value)}
                ref={parts.suggestionStatus}
              >
                {derived(() => (loading.value ? loadingMessage : (emptyMessage.value ?? "")))}
              </p>,
            ],
          })}
          <span role="status" aria-live="polite" ref={parts.announcement}>
            {announcement}
          </span>
        </div>
      ) : null}
      {hint ? (
        <span id={hintId} ref={parts.hint}>
          {hint}
        </span>
      ) : null}
    </form>
  );
}

ChatComposer.meta = {
  name: "chat-composer",
  parts: [
    "root",
    "surface",
    "attachments",
    "field",
    "input",
    "hint",
    "actions",
    "trailing",
    "submit",
    "suggestions",
    "suggestionList",
    "suggestion",
    "suggestionLeading",
    "suggestionCopy",
    "suggestionLabel",
    "suggestionDescription",
    "suggestionMeta",
    "suggestionStatus",
    "announcement",
  ],
  style: defineStyleProps(chatComposerOptions, {
    defaults: { layout: "stacked", surface: "default" },
  }),
} as const;
