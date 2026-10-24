import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { Field, Select } from "meowtail";

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
      feedback.value = `Selected: ${Array.from((event.currentTarget as HTMLSelectElement).selectedOptions, (option) => option.text).join(", ") || "None"}`;
    };
    return (
      <div className="workshop-stack workshop-constrained">
        <header className="workshop-composition-header">
          <h2>Organize the delivery</h2>
          <p>First choose the delivery target, then select the outcomes to include.</p>
        </header>
        <Field
          label="Delivery target"
          htmlFor="select-grouped"
          description="Use the arrow keys to choose and Enter to confirm."
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
              if (invalid) select.setAttribute("aria-describedby", "select-invalid-error");
              else select.removeAttribute("aria-describedby");
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
