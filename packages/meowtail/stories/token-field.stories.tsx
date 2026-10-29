import { h } from "meowjsx";
import { mapSignal, signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, Field, Stack, TokenField, type TokenFieldToken } from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";

const people = new Map([
  ["ada", "Ada Lovelace"],
  ["grace", "Grace Hopper"],
  ["alan", "Alan Turing"],
]);

export const TokenFieldStory = defineStory({
  id: "token-field",
  title: "Token field · Several values while typing",
  component: "TokenField",
  group: "Form inputs",
  groupOrder: 56,
  description:
    "Enter adds the draft as a token, a comma ends one as it is typed, and Backspace steps back into the tokens. The host resolves each entry, rejects duplicates and owns the list.",
  covers: ["TokenField add", "TokenField remove", "TokenField invalid", "TokenField form"],
  render: () => {
    const recipients = signal<readonly TokenFieldToken[]>([{ id: "ada", label: "Ada Lovelace" }]);
    const message = signal("");
    const submitted = signal("");
    const labels = signal<readonly TokenFieldToken[]>([
      { id: "design", label: "design" },
      { id: "review", label: "review" },
    ]);
    return (
      <Specimens>
        <Specimen
          label="Resolved recipients"
          note="Try “grace”, “alan”, an unknown name or a duplicate."
        >
          <Measure width="narrow">
            <form
              onSubmit={(event: SubmitEvent) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget as HTMLFormElement);
                submitted.value = `Submitted ${data.getAll("to").join(", ")}.`;
              }}
            >
              <Stack>
                <Field label="To" error={message}>
                  <TokenField
                    name="to"
                    required
                    placeholder="Add a person"
                    tokens={recipients}
                    onAdd={(text) => {
                      const id = text.toLowerCase();
                      if (recipients.value.some((item) => item.id === id)) {
                        message.value = `${text} is already added.`;
                        return false;
                      }
                      const label = people.get(id);
                      recipients.value = [
                        ...recipients.value,
                        label ? { id, label } : { id, label: text, invalid: true },
                      ];
                      message.value = label ? "" : `${text} is not in this workspace.`;
                    }}
                    onRemove={(id) => {
                      recipients.value = recipients.value.filter((item) => item.id !== id);
                      if (!recipients.value.some((item) => item.invalid)) message.value = "";
                    }}
                  />
                </Field>
                <ActionRow>
                  <Button type="submit">Send</Button>
                </ActionRow>
                <Note role="status">{submitted}</Note>
              </Stack>
            </form>
          </Measure>
        </Specimen>
        <Specimen label="Free labels">
          <Measure width="narrow">
            <Field label="Labels">
              <TokenField
                tokens={labels}
                onAdd={(text) => {
                  if (labels.value.some((item) => item.id === text)) return false;
                  labels.value = [...labels.value, { id: text, label: text }];
                }}
                onRemove={(id) => {
                  labels.value = labels.value.filter((item) => item.id !== id);
                }}
              />
            </Field>
            <Note>{mapSignal(labels, (items) => `${items.length} labels.`)}</Note>
          </Measure>
        </Specimen>
        <Specimen label="Disabled">
          <Measure width="narrow">
            <Field label="Watchers">
              <TokenField
                tokens={[{ id: "ada", label: "Ada Lovelace" }]}
                onAdd={() => {}}
                onRemove={() => {}}
                disabled
              />
            </Field>
          </Measure>
        </Specimen>
      </Specimens>
    );
  },
});
