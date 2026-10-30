import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { Field, Input, Textarea } from "meowtail";

export const InputStatesStory = defineStory({
  id: "input-states",
  title: "Input · Read-only, errors and long content",
  group: "Forms and selection",
  groupOrder: 40,
  component: "Input",
  variant: "Read-only and long content",
  description:
    "Read-only content can still be selected and copied; disabled content cannot be edited. Explicit errors, composed fields and long content keep a clear association.",
  covers: [
    "Input text/email/password/search",
    "readonly/disabled/invalid",
    "Textarea readonly/disabled/long",
    "Field explicit invalid",
    "Field multiple controls explicit association",
  ],
  render: () => (
    <div className="workshop-composition-columns">
      <section className="workshop-stack">
        <Field
          label="Project path (read-only)"
          htmlFor="readonly-path"
          description="Can be selected and copied; it cannot be changed here."
        >
          <Input
            id="readonly-path"
            readonly
            value="/workspace/meowland/packages/meowtail/components/long-project-reference"
          />
        </Field>
        <Field label="Search files" htmlFor="search-files">
          <Input id="search-files" type="search" placeholder="Enter a file name…" />
        </Field>
        <Field
          label="Notification email"
          htmlFor="invalid-email"
          invalid
          error="Enter a complete email address."
        >
          <Input id="invalid-email" type="email" value="meow@" />
        </Field>
        <Field label="Access passphrase (disabled)" htmlFor="disabled-password">
          <Input id="disabled-password" type="password" value="demo-only" disabled />
        </Field>
        <Field
          label="Check range"
          description="For composed fields, the caller associates the label and description separately."
          descriptionId="range-description"
        >
          <div className="workshop-foundation-range">
            <label>
              From{" "}
              <Input
                aria-label="Start line"
                aria-describedby="range-description"
                type="number"
                value="1"
                min="1"
              />
            </label>
            <label>
              To{" "}
              <Input
                aria-label="End line"
                aria-describedby="range-description"
                type="number"
                value="80"
                min="1"
              />
            </label>
          </div>
        </Field>
      </section>
      <section className="workshop-stack">
        <Field label="Delivery notes (editable)" htmlFor="long-notes">
          <Textarea id="long-notes" rows={6}>
            First, confirm every component stays readable on narrow screens. Second, keep user input
            while switching themes. Third, open a dialog with the keyboard, cancel it and return.
            Long content should wrap naturally; never drop the evidence for checks to keep the
            screen tidy.
          </Textarea>
        </Field>
        <Field label="Last check record (read-only)" htmlFor="readonly-notes">
          <Textarea id="readonly-notes" rows={3} readonly>
            The record is kept for checking. Read-only does not mean inaccessible.
          </Textarea>
        </Field>
        <Field label="Waiting for the connection to return" htmlFor="disabled-notes">
          <Textarea id="disabled-notes" rows={3} disabled>
            Continue editing once the connection returns.
          </Textarea>
        </Field>
      </section>
    </div>
  ),
});
