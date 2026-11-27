import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Field, Textarea } from "meowtail";
import { Note, Specimen, Specimens } from "./specimen";

export const TextareaStory = defineStory({
  id: "textarea",
  title: "Textarea · Multiline input",
  component: "Textarea",
  group: "Forms and selection",
  groupOrder: 40,
  description: "A native multiline input for editable, invalid, read-only and disabled content.",
  covers: ["empty and controlled", "invalid", "long content", "readonly and disabled"],
  render: () => {
    const draft = signal("");
    return (
      <Specimens>
        <Specimen label="Editable draft" width="narrow">
          <Field label="Notes" description="Add details for the next reviewer.">
            <Textarea
              rows={4}
              value={draft}
              placeholder="Write a note"
              onInput={(event: Event) => {
                draft.value = (event.currentTarget as HTMLTextAreaElement).value;
              }}
            />
          </Field>
          <Note>Draft: {draft}</Note>
        </Specimen>
        <Specimen label="Invalid" width="narrow">
          <Field label="Reason" error="Explain the requested change.">
            <Textarea rows={3} />
          </Field>
        </Specimen>
        <Specimen label="Read-only and disabled" width="narrow">
          <Field label="Review record">
            <Textarea rows={3} readonly>
              Review the complete document, including the proposed delivery schedule and the notes
              from the previous discussion.
            </Textarea>
          </Field>
          <Field label="Unavailable draft">
            <Textarea rows={3} disabled>
              Editing will be available later.
            </Textarea>
          </Field>
        </Specimen>
      </Specimens>
    );
  },
});
