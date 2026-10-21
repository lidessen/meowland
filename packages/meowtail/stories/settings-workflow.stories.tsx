import { derived, h, signal } from "meowjsx";
import { defineStory } from "meowbook";
import {
  Button,
  Checkbox,
  Container,
  Field,
  FieldGroup,
  Input,
  PageHeader,
  Select,
  Stack,
} from "meowtail";

function deliveryPreferences() {
  const displayName = signal("Alex Morgan");
  const email = signal("alex.morgan@northstar.studio");
  const frequency = signal("daily");
  const mentions = signal(true);
  const milestones = signal(true);
  const emailError = signal<string | undefined>(undefined);
  const feedback = signal("");
  const snapshot = () => ({
    displayName: displayName.value,
    email: email.value,
    frequency: frequency.value,
    mentions: mentions.value,
    milestones: milestones.value,
  });
  const saved = signal(snapshot());
  const dirty = derived(() => JSON.stringify(snapshot()) !== JSON.stringify(saved.value));
  const status = derived(
    () =>
      feedback.value || (dirty.value ? "Unsaved changes" : "Changes apply to this preview only."),
  );
  let emailInput: HTMLInputElement | undefined;
  const edited = () => {
    feedback.value = "";
  };

  return (
    <Container width="narrow" as="main">
      <Stack gap="relaxed">
        <PageHeader
          title="Delivery preferences"
          description="Choose where project updates arrive and which ones deserve your attention."
        />
        <form
          noValidate
          aria-label="Delivery preferences"
          onSubmit={(event: Event) => {
            event.preventDefault();
            if (!emailInput?.validity.valid) {
              emailError.value = "Enter a valid email address, such as alex@northstar.studio.";
              feedback.value = "";
              // Field flushes its live message and ARIA before focus moves to the input.
              queueMicrotask(() => {
                if (!emailInput?.isConnected) return;
                emailInput.focus();
                feedback.value = "Preferences were not saved. Check the email address above.";
              });
              return;
            }
            emailError.value = undefined;
            saved.value = snapshot();
            feedback.value = "Delivery preferences saved for this preview.";
          }}
        >
          <Stack gap="relaxed">
            <FieldGroup
              legend="Account"
              description="Your name appears on the project updates you share with teammates."
            >
              <Field label="Full name" htmlFor="delivery-name">
                <Input
                  id="delivery-name"
                  name="displayName"
                  autoComplete="name"
                  value={displayName}
                  onInput={(event: Event) => {
                    displayName.value = (event.currentTarget as HTMLInputElement).value;
                    edited();
                  }}
                />
              </Field>
            </FieldGroup>

            <FieldGroup
              legend="Delivery"
              description="Send project updates to the inbox you check during your working day."
            >
              <Field
                label="Email address"
                htmlFor="delivery-email"
                description="Used for project updates and your scheduled digest."
                error={emailError}
              >
                <Input
                  id="delivery-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  ref={(input: HTMLInputElement) => {
                    emailInput = input;
                  }}
                  onInput={(event: Event) => {
                    const input = event.currentTarget as HTMLInputElement;
                    email.value = input.value;
                    if (input.validity.valid) emailError.value = undefined;
                    edited();
                  }}
                />
              </Field>
              <Field
                label="Project digest"
                htmlFor="delivery-frequency"
                description="A summary of progress, decisions, and upcoming milestones."
              >
                <Select
                  id="delivery-frequency"
                  name="frequency"
                  value={frequency}
                  onChange={(event: Event) => {
                    frequency.value = (event.currentTarget as HTMLSelectElement).value;
                    edited();
                  }}
                >
                  <option value="daily">Every weekday at 9:00 AM</option>
                  <option value="weekly">Every Monday at 9:00 AM</option>
                  <option value="off">Do not send a project digest</option>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup
              legend="Project notifications"
              description="These updates arrive as they happen, separately from your digest."
            >
              <Checkbox
                name="mentions"
                label="When someone mentions me or requests my review"
                checked={mentions}
                onChange={(event: Event) => {
                  mentions.value = (event.currentTarget as HTMLInputElement).checked;
                  edited();
                }}
              />
              <Checkbox
                name="milestones"
                label="When a project milestone is completed or its due date changes"
                checked={milestones}
                onChange={(event: Event) => {
                  milestones.value = (event.currentTarget as HTMLInputElement).checked;
                  edited();
                }}
              />
            </FieldGroup>

            <Stack gap="compact" align="start">
              <Button type="submit">Save preferences</Button>
              <span role="status" aria-live="polite" aria-atomic="true">
                {status}
              </span>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}

export const SettingsWorkflowStory = defineStory({
  id: "settings-workflow",
  title: "Delivery preferences",
  group: "Composition examples",
  groupOrder: 95,
  component: "FieldGroup",
  variant: "Continuous settings workflow",
  description:
    "Edit a local draft, submit an invalid email, correct it, and save. The field error and saved feedback stay next to the controls and action they describe.",
  covers: ["FieldGroup", "live Field error", "draft editing", "save feedback", "narrow settings"],
  render: deliveryPreferences,
});
