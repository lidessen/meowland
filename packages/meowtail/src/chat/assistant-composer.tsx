import { defineComponent, h, unwrap } from "meowjsx";
import { ChatComposer } from "./composer";
import { ChatAttachments } from "./attachments";
import { IconButton } from "../components/icon-button";
import { ChoiceSelect } from "../components/choice-select";
import { Icon } from "../icons/icon";
import { assistantDerived } from "./assistant-content";
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
  { options: AssistantViewProps },
  "assistant-composer",
  (typeof assistantComposerContract.parts)[number]
>(assistantComposerContract, ({ options }, context) => {
  const assistantCopy = { ...defaultAssistantCopy, ...options.labels };
  const controlled = options.draft !== undefined;
  if (controlled && !options.onDraftChange && !options.readOnly)
    throw new Error("A controlled Assistant draft requires onDraftChange or readOnly");
  const local = context.signal<AssistantDraft>(
    options.defaultDraft ?? { text: "", attachments: [] },
  );
  const draft = assistantDerived(context, () =>
    controlled ? unwrap(options.draft!) : local.value,
  );
  const text = assistantDerived(context, () => draft.value.text);
  const pending = context.signal(false);
  const attaching = context.signal(false);
  const feedback = context.signal("");
  const disabled = assistantDerived(
    context,
    () => options.readOnly || unwrap(options.disabled ?? false),
  );
  const submitDisabled = assistantDerived(
    context,
    () =>
      disabled.value ||
      pending.value ||
      !options.onSubmit ||
      (!draft.value.text.trim() && !draft.value.attachments.length),
  );
  let textVersion = 0;
  let previousText = draft.value.text;
  let disposed = false;
  let textarea: HTMLTextAreaElement | undefined;
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
  const resize = () => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
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
      if (!disposed) {
        pending.value = false;
        resize();
      }
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
  const choices = context.part(
    "choices",
    "div",
    null,
    assistantDerived(context, () => {
      const models = unwrap(options.models ?? []);
      return models.length
        ? h(ChoiceSelect, {
            options: models,
            value: options.model ?? localModel,
            "aria-label": assistantCopy.model,
            onValueChange: (value: string) => {
              if (options.model === undefined) localModel.value = value;
              options.onModelChange?.(value);
            },
            placement: "top",
            matchTriggerWidth: false,
          })
        : null;
    }),
    assistantDerived(context, () => {
      const reasoning = unwrap(options.reasoningOptions ?? []);
      return reasoning.length
        ? h(ChoiceSelect, {
            options: reasoning,
            value: options.reasoning ?? localReasoning,
            "aria-label": assistantCopy.reasoning,
            onValueChange: (value: string) => {
              if (options.reasoning === undefined) localReasoning.value = value;
              options.onReasoningChange?.(value);
            },
            placement: "top",
            matchTriggerWidth: false,
          })
        : null;
    }),
    options.composerTrailing,
  );
  return context.part(
    "root",
    "div",
    null,
    h(ChatComposer, {
      value: text,
      placeholder: assistantCopy.placeholder,
      inputLabel: assistantCopy.composer,
      submitLabel: assistantCopy.send,
      submitDisabled,
      trailing: choices,
      attachments: assistantDerived(context, () =>
        draft.value.attachments.length
          ? h(ChatAttachments, {
              items: draft.value.attachments.map((attachment) => ({
                ...attachment,
                onRemove: disabled.value
                  ? undefined
                  : () =>
                      change({
                        ...draft.value,
                        attachments: draft.value.attachments.filter((item) => item !== attachment),
                      }),
              })),
            })
          : null,
      ),
      hint: assistantDerived(context, () => unwrap(options.disabledReason ?? "")),
      onSubmit: send,
      onInput: (event: Event) => {
        textVersion++;
        change({ ...draft.value, text: (event.target as HTMLTextAreaElement).value });
        resize();
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (
          event.target === textarea &&
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.isComposing &&
          event.keyCode !== 229
        )
          void send(event);
      },
      ref: (form: HTMLFormElement) => {
        let active = true;
        let stop: (() => void) | undefined;
        const observer = new ResizeObserver(resize);
        observer.observe(form);
        // Host refs run before children mount; find the native input after this tree is mounted.
        queueMicrotask(() => {
          if (!active || disposed || !form.isConnected) return;
          textarea = form.querySelector("textarea")!;
          stop = context.effect(() => {
            const value = text.value;
            textarea!.disabled = !!disabled.value;
            textarea!.readOnly = !!options.readOnly;
            queueMicrotask(() => {
              if (!disposed && textarea) {
                if (textarea.value !== value) textarea.value = value;
                resize();
              }
            });
          });
          resize();
        });
        return () => {
          active = false;
          stop?.();
          observer.disconnect();
          textarea = undefined;
        };
      },
      children:
        options.allowAttachments === false
          ? []
          : [
              h(IconButton, {
                label: assistantCopy.attach,
                disabled: assistantDerived(context, () => disabled.value || attaching.value),
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
      { role: "status", hidden: assistantDerived(context, () => !feedback.value) },
      feedback,
    ),
  );
});
