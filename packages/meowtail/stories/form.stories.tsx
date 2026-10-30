import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ChoiceSelect, Field, Form, Input, Switch } from "meowtail";
import { Measure, Note, Specimen, Specimens } from "./specimen";

export const FormStory = defineStory({
  id: "form",
  title: "Form · Validate, save and cancel",
  group: "Forms and selection",
  groupOrder: 40,
  component: "Form",
  description:
    "Native validation runs first and focuses the first invalid field; a valid submit hands the host its FormData. The host reports saving, a failure or a receipt, and nothing is reset.",
  covers: ["Form validation", "Form busy", "Form error", "Form status", "Form cancel"],
  render: () => {
    const busy = signal(false);
    const error = signal<string | undefined>(undefined);
    const status = signal<string | undefined>(undefined);
    const cancelled = signal("");
    return (
      <Specimens>
        <Specimen
          label="Connection settings"
          note="Use a host containing “fail” to see a server error."
        >
          <Measure width="narrow">
            <Form
              busy={busy}
              error={error}
              status={status}
              submitLabel="Save connection"
              busyLabel="Saving connection…"
              onCancel={() => {
                cancelled.value = "Cancelled; your edits are still here.";
              }}
              onSubmit={(data) => {
                error.value = undefined;
                status.value = undefined;
                cancelled.value = "";
                busy.value = true;
                setTimeout(() => {
                  busy.value = false;
                  const host = String(data.get("host"));
                  if (host.includes("fail")) error.value = `Could not reach ${host}.`;
                  else status.value = `Saved ${data.get("name")} (${data.get("region")}).`;
                }, 700);
              }}
            >
              <Field label="Connection name">
                <Input name="name" required defaultValue="Production" />
              </Field>
              <Field label="Host" description="Including the scheme, for example https://…">
                <Input name="host" type="url" required placeholder="https://api.example.com" />
              </Field>
              <Field label="Region">
                <ChoiceSelect
                  name="region"
                  required
                  options={[
                    { value: "eu", label: "Europe" },
                    { value: "us", label: "United States" },
                  ]}
                />
              </Field>
              <Switch name="verify" label="Verify certificates" defaultChecked />
            </Form>
            <Note role="status">{cancelled}</Note>
          </Measure>
        </Specimen>
      </Specimens>
    );
  },
});
