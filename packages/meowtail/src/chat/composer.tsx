import { defineOptions } from "meowcss";
import { defineStyleProps, type StyledComponentContract, type ThemedProps } from "meowcss/meowjsx";
import { defineComponent, h, type Child, type MaybeSignal, type Props } from "meowjsx";
import { Icon } from "../icons/icon";

export const chatComposerOptions = defineOptions("chat-composer", {
  layout: ["stacked", "inline", "hero"],
  surface: ["default", "none"],
});

export const chatComposerContract = {
  name: "chat-composer",
  parts: ["root", "attachments", "field", "input", "hint", "actions", "trailing", "submit"],
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
  /** Inline keeps a short draft and its actions on one row; long drafts still grow. */
  /** Draft attachments belong to the same writing surface; upload ownership stays with the host. */
  attachments?: Child;
  /** Model/provider selection beside the send action; options and state belong to the host. */
  trailing?: Child;
  hint?: Child;
  hintId?: string;
  submitLabel?: string;
  /** Visible action content; the accessible name always comes from submitLabel. */
  submitContent?: Child;
  disabled?: boolean;
  /** Prevent another submission while keeping the draft editable. */
  submitDisabled?: MaybeSignal<boolean>;
  onSubmit?: ChatComposerSubmit;
  onInput?: ChatComposerInput;
  className?: string;
}

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
      submitDisabled = false,
      onSubmit,
      onInput,
      children,
      className,
      ...props
    },
    context,
  ) =>
    context.part(
      "root",
      "form",
      {
        ...props,
        className,
        onSubmit,
      },
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
          onInput,
        }),
        hint ? context.part("hint", "span", hintId ? { id: hintId } : null, hint) : null,
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
            disabled: disabled ? true : submitDisabled,
            "aria-label": submitLabel,
          },
          submitContent ?? <Icon name="arrow-up" />,
        ),
      ),
    ),
);
