import { defineStyleProps } from "meowcss/meowjsx";
import { h, type Child, type Context, type Props } from "meowjsx";
import { derived, unwrap, type MaybeSignal } from "meowjsx/signal";
import { chatComposerOptions } from "./composer.options";
import { Icon } from "../icons/icon";

export type ChatComposerSubmit = (event: SubmitEvent) => void;
export type ChatComposerInput = (event: Event) => void;

export interface ChatComposerProps extends Props {
  value?: MaybeSignal<string>;
  placeholder?: string;
  inputLabel?: string;
  /** Inline keeps a short draft and its actions on one row; long drafts still grow.
   * Bar is one rounded row: attach, text, trailing choices, send. */
  /** Draft attachments belong to the same writing surface; upload ownership stays with the host. */
  attachments?: Child;
  /** Model/provider selection beside the send action; options and state belong to the host. */
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
  onSubmit?: ChatComposerSubmit;
  onInput?: ChatComposerInput;
}

/** The message input of a conversation, with attachments, model choice and send. */
export function ChatComposer(
  {
    value = "",
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
    onSubmit,
    onInput,
    children,
    className,
    ref,
    ...props
  }: ChatComposerProps,
  context: Context<typeof ChatComposer>,
) {
  const submitBlocked =
    disabled === true
      ? true
      : typeof disabled === "boolean"
        ? submitDisabled
        : derived(() => Boolean(unwrap(disabled)) || Boolean(unwrap(submitDisabled)));
  let field: HTMLTextAreaElement | undefined;
  const resize = () => {
    if (!field?.isConnected) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  };
  const parts = context.parts;
  const inputRef = (textarea: HTMLTextAreaElement) => {
    field = textarea;
    const stop = context.effect(() => {
      unwrap(value);
      resize();
    });
    const onResizeInput = () => resize();
    textarea.addEventListener("input", onResizeInput);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : undefined;
    observer?.observe(textarea);
    queueMicrotask(() => {
      if (textarea.isConnected) resize();
    });
    return () => {
      stop();
      textarea.removeEventListener("input", onResizeInput);
      observer?.disconnect();
      field = undefined;
    };
  };
  return (
    <form {...props} className={className} onSubmit={onSubmit} ref={[parts.root, ref]}>
      <div ref={parts.surface}>
        {attachments ? <div ref={parts.attachments}>{attachments}</div> : null}
        <div ref={parts.field}>
          <textarea
            data-chat-input
            name="message"
            rows={1}
            value={value}
            placeholder={placeholder}
            aria-label={inputLabel}
            aria-describedby={hint && hintId ? hintId : undefined}
            disabled={disabled}
            readOnly={readOnly}
            onInput={onInput}
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
            ref={parts.submit}
          >
            {submitContent ?? <Icon name="arrow-up" />}
          </button>
        </div>
      </div>
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
  ],
  style: defineStyleProps(chatComposerOptions, {
    defaults: { layout: "stacked", surface: "default" },
  }),
} as const;
