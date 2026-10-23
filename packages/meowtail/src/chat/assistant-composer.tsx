import { defineComponent, derived, h, isSignal, unwrap, type Child } from "meowjsx";
import { ChatComposer } from "./composer";
import { ChatAttachments } from "./attachments";
import { IconButton } from "../components/icon-button";
import { ChoiceSelect } from "../components/choice-select";
import { Icon } from "../icons/icon";
import { consumeAssistantDraft, snapshotAssistantDraft } from "./assistant-draft";
import {
  assistantCopy as defaultAssistantCopy,
  type AssistantDraft,
  type AssistantViewProps,
} from "./assistant-types";

export const assistantComposerContract = {
  name: "assistant-composer",
  parts: ["root", "choices", "feedback", "file"],
} as const;
export const AssistantComposer = defineComponent<
  { options: AssistantViewProps; trailing?: Child },
  "assistant-composer",
  (typeof assistantComposerContract.parts)[number]
>(assistantComposerContract, ({ options, trailing }, context) => {
  const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
  const controlled = options.draft !== undefined;
  if (controlled && !options.onDraftChange && !options.readOnly)
    throw new Error("A controlled Assistant draft requires onDraftChange or readOnly");
  const local = context.signal<AssistantDraft>(
    options.defaultDraft ?? { text: "", attachments: [] },
  );
  const draft = derived(() => (controlled ? unwrap(options.draft!) : local.value));
  const text = derived(() => draft.value.text);
  const pending = context.signal(false);
  const attaching = context.signal(false);
  const feedback = context.signal("");
  const disabled = derived(() => options.readOnly || unwrap(options.disabled ?? false));
  const submitDisabled = derived(
    () =>
      disabled.value ||
      pending.value ||
      !options.onSubmit ||
      (!draft.value.text.trim() && !draft.value.attachments.length),
  );
  let textVersion = 0;
  let previousText = draft.value.text;
  let disposed = false;
  let fileInput: HTMLInputElement | undefined;
  const urls = new Set<string>();
  context.effect(() => {
    if (previousText !== draft.value.text) {
      previousText = draft.value.text;
      textVersion++;
    }
  });
  const change = (next: AssistantDraft, accepted = false) => {
    if (!accepted && disabled.value) return;
    if (!controlled) local.value = next;
    options.onDraftChange?.(next);
  };
  const send = async (event: Event) => {
    event.preventDefault();
    if (pending.value || submitDisabled.value || !options.onSubmit) return;
    const snapshot = snapshotAssistantDraft(draft.value);
    const version = textVersion;
    pending.value = true;
    feedback.value = "";
    try {
      const result = await options.onSubmit(snapshot);
      if (disposed) return;
      if (result?.accepted === true) {
        change(consumeAssistantDraft(draft.value, snapshot, version === textVersion), true);
      } else feedback.value = assistantCopy.rejected;
    } catch {
      if (!disposed) feedback.value = assistantCopy.submitError;
    } finally {
      if (!disposed) pending.value = false;
    }
  };
  const attach = async (event: Event) => {
    const files = [...((event.currentTarget as HTMLInputElement).files ?? [])];
    (event.currentTarget as HTMLInputElement).value = "";
    if (!files.length || disabled.value || attaching.value) return;
    attaching.value = true;
    feedback.value = "";
    try {
      const result = options.onAttach
        ? await options.onAttach(files)
        : files.map((file) => {
            const url = URL.createObjectURL(file);
            urls.add(url);
            return {
              id: url,
              name: file.name,
              mediaType: file.type || "application/octet-stream",
              sizeBytes: file.size,
              url,
              file,
            };
          });
      if (!disposed && result)
        change({ ...draft.value, attachments: [...draft.value.attachments, ...result] });
    } catch {
      if (!disposed) feedback.value = assistantCopy.attachError;
    } finally {
      if (!disposed) attaching.value = false;
    }
  };
  context.onCleanup(() => {
    disposed = true;
    for (const url of urls) URL.revokeObjectURL(url);
  });
  const localModel = context.signal(unwrap(options.models ?? [])[0]?.value ?? "");
  const localReasoning = context.signal(unwrap(options.reasoningOptions ?? [])[0]?.value ?? "");
  const modelsLive =
    options.models !== undefined && (isSignal(options.models) || options.models.length > 0);
  const reasoningLive =
    options.reasoningOptions !== undefined &&
    (isSignal(options.reasoningOptions) || options.reasoningOptions.length > 0);
  const choices = context.part(
    "choices",
    "div",
    null,
    modelsLive
      ? h(ChoiceSelect, {
          hidden: derived(() => unwrap(options.models ?? []).length === 0),
          options: derived(() => unwrap(options.models ?? [])),
          value: options.model ?? localModel,
          "aria-label": assistantCopy.model,
          onValueChange: (value: string) => {
            if (options.model === undefined) localModel.value = value;
            options.onModelChange?.(value);
          },
          placement: "top",
          matchTriggerWidth: false,
        })
      : null,
    reasoningLive
      ? h(ChoiceSelect, {
          hidden: derived(() => unwrap(options.reasoningOptions ?? []).length === 0),
          options: derived(() => unwrap(options.reasoningOptions ?? [])),
          value: options.reasoning ?? localReasoning,
          "aria-label": assistantCopy.reasoning,
          onValueChange: (value: string) => {
            if (options.reasoning === undefined) localReasoning.value = value;
            options.onReasoningChange?.(value);
          },
          placement: "top",
          matchTriggerWidth: false,
        })
      : null,
    options.composerTrailing,
    trailing,
  );
  return context.part(
    "root",
    "div",
    null,
    h(ChatComposer, {
      layout: "bar",
      value: text,
      placeholder: assistantCopy.placeholder,
      inputLabel: assistantCopy.composer,
      submitLabel: assistantCopy.send,
      disabled,
      readOnly: Boolean(options.readOnly),
      submitDisabled,
      trailing: choices,
      attachments: h(ChatAttachments, {
        hidden: derived(() => draft.value.attachments.length === 0),
        items: derived(() =>
          draft.value.attachments.map((attachment) => ({
            ...attachment,
            onRemove: disabled.value
              ? undefined
              : () =>
                  change({
                    ...draft.value,
                    attachments: draft.value.attachments.filter(
                      (item) => item.id !== attachment.id,
                    ),
                  }),
          })),
        ),
      }),
      hint: derived(() => unwrap(options.disabledReason ?? "")),
      onSubmit: send,
      onInput: (event: Event) => {
        textVersion++;
        change({ ...draft.value, text: (event.target as HTMLTextAreaElement).value });
      },
      onKeyDown: (event: KeyboardEvent) => {
        const target = event.target;
        if (
          target instanceof HTMLTextAreaElement &&
          target.dataset.chatInput !== undefined &&
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.isComposing &&
          event.keyCode !== 229
        )
          void send(event);
      },
      children:
        options.allowAttachments === false
          ? []
          : [
              h(IconButton, {
                label: assistantCopy.attach,
                disabled: derived(() => disabled.value || attaching.value),
                onClick: () => fileInput?.click(),
                children: h(Icon, { name: "paperclip" }),
              }),
              context.part("file", "input", {
                type: "file",
                multiple: true,
                hidden: true,
                onChange: attach,
                ref: (element: HTMLInputElement) => {
                  fileInput = element;
                },
              }),
            ],
    }),
    context.part(
      "feedback",
      "p",
      { role: "status", hidden: derived(() => !feedback.value) },
      feedback,
    ),
  );
});
