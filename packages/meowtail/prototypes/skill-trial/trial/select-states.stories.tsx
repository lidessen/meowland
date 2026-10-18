import { h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import { Button, Checkbox, ChoiceGroup, Field, Inline, Select, Stack } from "meowtail";

export const SelectStatesStory = defineStory({
  id: "select-states",
  title: "Select · Groups, errors and multiple selection",
  group: "Form inputs",
  groupOrder: 20,
  component: "Select",
  variant: "Groups and multiple selection",
  description:
    "Keeps native options and keyboard behavior. size is the number of visible rows; multiple selection uses the platform modifier keys.",
  covers: [
    "Select required/invalid/disabled",
    "optgroup/disabled option",
    "multiple/size",
    "long option",
    "keyboard native",
  ],
  render() {
    const feedback = signal("The current value appears here after you choose.");
    const changed = (event: Event) => {
      const select = event.currentTarget as HTMLSelectElement;
      const label = select.labels?.[0]?.textContent || "Selection";
      feedback.value = `${label} selected: ${Array.from(select.selectedOptions, (option) => option.text).join(", ") || "None"}. Only the local example updates.`;
    };
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>Native select capability comparison</h2>
          <p>
            Groups, required errors, multiple selection, and disabled states are separate examples;
            choosing only updates the local receipt and does not publish the delivery.
          </p>
        </header>
        <Field
          label="Delivery target"
          htmlFor="select-grouped"
          description="Grouped single selection; use the arrow keys to choose and Enter to confirm."
        >
          <Select id="select-grouped" value="review" onChange={changed}>
            <optgroup label="Current project">
              <option value="draft">Keep as a local draft</option>
              <option value="review">
                Send to the project owner to review the full change and verification record
              </option>
            </optgroup>
            <optgroup label="External targets">
              <option disabled>No remote connected yet</option>
            </optgroup>
          </Select>
        </Field>
        <Field
          label="Release environment"
          htmlFor="select-invalid"
          description="Required validation example; choosing a value clears the error."
          invalid
          error="Select an environment to continue."
        >
          <Select
            id="select-invalid"
            value=""
            required
            onChange={(event) => {
              changed(event);
              const select = event.currentTarget as HTMLSelectElement;
              const invalid = !select.value;
              select.setAttribute("aria-invalid", String(invalid));
              select.setAttribute(
                "aria-describedby",
                invalid
                  ? "select-invalid-description select-invalid-error"
                  : "select-invalid-description",
              );
              select
                .closest('[data-meowui-part="field/root"]')
                ?.setAttribute("data-invalid", String(invalid));
              const error = select.ownerDocument.getElementById("select-invalid-error");
              if (error) error.hidden = !invalid;
            }}
          >
            <option value="">Select an environment</option>
            <option value="local">Local preview only</option>
            <option value="staging">Staging environment</option>
          </Select>
        </Field>
        <Field
          label="Included outcomes"
          htmlFor="select-multiple"
          description="Hold ⌘ / Ctrl to add selections; use Shift for a range."
        >
          <Select id="select-multiple" multiple size={3} onChange={changed}>
            <option value="source" selected>
              Source code changes
            </option>
            <option value="tests">Verification record</option>
            <option value="design">Design notes</option>
          </Select>
        </Field>
        <Field label="Locked target" htmlFor="select-disabled">
          <Select id="select-disabled" disabled>
            <option>This task uses the local workspace</option>
          </Select>
        </Field>
        <p role="status" className="workshop-feedback">
          {feedback}
        </p>
      </div>
    );
  },
});

export const DeliveryChoiceStory = defineStory({
  id: "delivery-choice",
  title: "Selection use cases · Prepare a local delivery list",
  group: "Form inputs",
  groupOrder: 20,
  component: "ChoiceGroup",
  variant: "On-screen comparison and multiple selection",
  description:
    "Compare a few targets on one screen and add outcomes independently; submitting only generates a list on this page and does not send or publish.",
  render() {
    const feedback = signal("No list generated yet; the choices below are a draft.");
    return (
      <form
        className="workshop-constrained"
        onSubmit={(event: Event) => {
          event.preventDefault();
          const form = event.currentTarget as HTMLFormElement;
          const data = new FormData(form);
          const destination =
            data.get("destination") === "review"
              ? "Send to the project owner to review the full change and verification record"
              : "Keep as a local draft";
          const contents = data.getAll("contents").join(", ") || "No outcomes included";
          feedback.value = `Local list generated: ${destination}; ${contents}. After changing your choices, generate it again.`;
        }}
      >
        <Stack gap="relaxed">
          <Stack gap="compact">
            <strong>Prepare a local delivery list</strong>
            <span style={{ textWrap: "balance" }}>
              First choose the delivery target, then select the outcomes to include. The list
              appears only on this page.
            </span>
          </Stack>
          <ChoiceGroup
            label="Delivery target"
            name="destination"
            defaultValue="review"
            options={[
              {
                value: "draft",
                label: "Keep as a local draft",
                description: "Keep it in the workspace and continue preparing later.",
              },
              {
                value: "review",
                label:
                  "Send to the project owner to review the full change and verification record",
                description: "Put the change and checking materials in one list.",
              },
              { value: "remote", label: "No remote connected yet", disabled: true },
            ]}
          />
          <fieldset style={{ border: "0", padding: "0", margin: "0" }}>
            <legend>Included outcomes</legend>
            <Stack gap="compact">
              <Checkbox
                name="contents"
                value="Source code changes"
                defaultChecked
                label="Source code changes"
              />
              <Checkbox name="contents" value="Verification record" label="Verification record" />
              <Checkbox name="contents" value="Design notes" label="Design notes" />
            </Stack>
          </fieldset>
          <Inline>
            <Button type="submit">Generate local list</Button>
          </Inline>
          <p role="status" className="workshop-feedback">
            {feedback}
          </p>
        </Stack>
      </form>
    );
  },
});
