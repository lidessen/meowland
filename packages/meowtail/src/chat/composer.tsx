import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import {
  defineComponent,
  derived,
  h,
  unwrap,
  type Child,
  type MaybeSignal,
  type Props,
} from "meowjsx";
import { Icon } from "../icons/icon";

export const chatComposerOptions = defineOptions("chat-composer", {
  layout: ["stacked", "inline", "hero", "bar"],
  surface: ["default", "none"],
});

export const chatComposerContract = {
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
  styleProps: defineStyleProps(chatComposerOptions, {
    defaults: { layout: "stacked", surface: "default" },
  }),
} as const satisfies StyledComponentContract;

export type ChatComposerSubmit = (event: SubmitEvent) => void;
export type ChatComposerInput = (event: Event) => void;

export interface ChatComposerProps extends Props, ThemedProps<typeof chatComposerOptions> {
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
  className?: string;
}

/** The message input of a conversation, with attachments, model choice and send. */
export const ChatComposer = defineComponent<
  ChatComposerProps,
  typeof chatComposerContract.name,
  (typeof chatComposerContract.parts)[number]
>(
  chatComposerContract,
  (
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
      ...props
    },
    context,
  ) => {
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
    return context.part(
      "root",
      "form",
      {
        ...props,
        className,
        onSubmit,
      },
      context.part(
        "surface",
        "div",
        null,
        attachments ? context.part("attachments", "div", null, attachments) : null,
        context.part(
          "field",
          "div",
          null,
          context.part("input", "textarea", {
            "data-chat-input": true,
            name: "message",
            rows: 1,
            value,
            placeholder,
            "aria-label": inputLabel,
            "aria-describedby": hint && hintId ? hintId : undefined,
            disabled,
            readOnly,
            onInput,
            ref: (textarea: HTMLTextAreaElement) => {
              field = textarea;
              const stop = context.effect(() => {
                unwrap(value);
                resize();
              });
              const onResizeInput = () => resize();
              textarea.addEventListener("input", onResizeInput);
              const observer =
                typeof ResizeObserver === "function" ? new ResizeObserver(resize) : undefined;
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
            },
          }),
        ),
        context.part(
          "actions",
          "div",
          null,
          children,
          trailing ? context.part("trailing", "div", null, trailing) : null,
          context.part(
            "submit",
            "button",
            {
              type: "submit",
              disabled: submitBlocked,
              "aria-label": submitLabel,
            },
            submitContent ?? <Icon name="arrow-up" />,
          ),
        ),
      ),
      hint ? context.part("hint", "span", hintId ? { id: hintId } : null, hint) : null,
    );
  },
);
