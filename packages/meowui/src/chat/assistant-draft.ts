import type { AssistantDraft } from "./assistant-types";

/** Isolate submitted metadata from later in-place host edits; keep File and action identities. */
export function snapshotAssistantDraft(draft: AssistantDraft): AssistantDraft {
  return { text: draft.text, attachments: draft.attachments.map((attachment) => ({ ...attachment })) };
}

/** Consume only the fields accepted by this submission, never a later edit or attachment. */
export function consumeAssistantDraft(
  current: AssistantDraft,
  submitted: AssistantDraft,
  textUnchanged: boolean,
): AssistantDraft {
  const accepted = new Map(submitted.attachments.map((attachment) => [attachment.id, attachment]));
  return {
    text: textUnchanged && current.text === submitted.text ? "" : current.text,
    attachments: current.attachments.filter((attachment) => {
      const original = accepted.get(attachment.id);
      return !original || original.url !== attachment.url || original.file !== attachment.file ||
        original.name !== attachment.name || original.mediaType !== attachment.mediaType ||
        original.sizeBytes !== attachment.sizeBytes;
    }),
  };
}
