import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ChoiceSelect, Field } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const GroupedChoiceSelectStory = defineStory({
  id: "choice-select-grouped",
  title: "Choice Select · Grouped options",
  group: "Forms and selection",
  groupOrder: 40,
  component: "ChoiceSelect",
  render() {
    const value = signal("deepseek-flash");
    return (
      <ChoiceSelect
        aria-label="Provider and model"
        value={value}
        onValueChange={(next) => {
          value.value = next;
        }}
        options={[
          { value: "deepseek-flash", label: "DeepSeek-V41-Flash", group: "DeepSeek" },
          { value: "deepseek-pro", label: "DeepSeek-V4-Pro", group: "DeepSeek" },
          { value: "anthropic", label: "Claude", group: "Anthropic" },
        ]}
      />
    );
  },
});

export const ChoiceWidthStory = defineStory({
  id: "choice-select-width",
  title: "Choice Select · Short trigger and long options",
  group: "Forms and selection",
  groupOrder: 40,
  component: "ChoiceSelect",
  description:
    "A matching trigger keeps its exact width; the natural popover and wide form follow their existing contracts.",
  render() {
    return (
      <Specimens>
        <Specimen
          label="Trigger width"
          note="The first list matches its trigger; the second takes its natural width."
          align="start"
        >
          <ChoiceSelect
            id="short-choice"
            aria-label="Short trigger choice"
            options={[
              { value: "one", label: "First option" },
              { value: "two", label: "Second option" },
            ]}
          />
          <ChoiceSelect
            id="natural-choice"
            aria-label="Natural width choice"
            matchTriggerWidth={false}
            options={[
              { value: "one", label: "First option" },
              { value: "two", label: "Second option" },
            ]}
          />
        </Specimen>
        <Specimen label="Long option names" width="narrow">
          <Field label="Full option name" htmlFor="long-choice">
            <ChoiceSelect
              id="long-choice"
              defaultValue="long"
              options={[
                {
                  value: "long",
                  label: "The project owner reviews the full change and verification record",
                },
                {
                  value: "path",
                  label: "workspace-very-long-source-reference-for-a-readable-selection",
                },
              ]}
            />
          </Field>
        </Specimen>
      </Specimens>
    );
  },
});
